import { ApiError, api, errorMessage, onSessionExpired } from "@/lib/api-client";
import { getAccessToken, setAccessToken } from "@/lib/auth-token";

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

describe("api client", () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    setAccessToken(null);
  });
  afterEach(() => vi.unstubAllGlobals());

  it("sends the in-memory bearer token and credentials", async () => {
    setAccessToken("abc");
    fetchMock.mockResolvedValueOnce(json(200, { ok: true }));
    await api("/claims");
    const [, init] = fetchMock.mock.calls[0]!;
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer abc");
    expect(init?.credentials).toBe("include");
  });

  it("maps Problem Details to ApiError with field errors", async () => {
    fetchMock.mockResolvedValueOnce(json(400, { code: "validation_failed", detail: "Check the form", errors: { totalAmount: "must be positive" } }));
    const err = await api("/claims", { method: "POST", body: {} }).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect((err as ApiError).code).toBe("validation_failed");
    expect((err as ApiError).fieldErrors.totalAmount).toBe("must be positive");
  });

  it("never surfaces server details for 5xx responses", async () => {
    fetchMock.mockResolvedValueOnce(json(500, { detail: "java.sql.SQLException: table x" }));
    const err = (await api("/claims").catch((e: unknown) => e)) as ApiError;
    expect(err.message).not.toMatch(/SQL/);
    expect(errorMessage(err)).toBe("Something went wrong on our side. Please try again.");
  });

  it("refreshes once on 401 and retries the request", async () => {
    setAccessToken("old");
    fetchMock
      .mockResolvedValueOnce(json(401, { code: "unauthorized" }))
      .mockResolvedValueOnce(json(200, { accessToken: "new", expiresIn: 900, session: { user: {}, workspaces: [] } }))
      .mockResolvedValueOnce(json(200, { value: 1 }));
    await expect(api<{ value: number }>("/claims")).resolves.toEqual({ value: 1 });
    expect(getAccessToken()).toBe("new");
    expect(String(fetchMock.mock.calls[1]![0])).toContain("/auth/refresh");
    const retryHeaders = fetchMock.mock.calls[2]![1]?.headers as Record<string, string>;
    expect(retryHeaders.Authorization).toBe("Bearer new");
  });

  it("signals session expiry when refresh fails", async () => {
    const expired = vi.fn();
    onSessionExpired(expired);
    fetchMock.mockResolvedValueOnce(json(401, {})).mockResolvedValueOnce(json(401, {}));
    await expect(api("/claims")).rejects.toBeInstanceOf(ApiError);
    expect(expired).toHaveBeenCalledTimes(1);
    expect(getAccessToken()).toBeNull();
  });

  it("does not try to refresh for auth endpoints", async () => {
    fetchMock.mockResolvedValueOnce(json(401, { detail: "Invalid email or password" }));
    const err = (await api("/auth/login", { method: "POST", body: {}, noRefresh: true }).catch((e: unknown) => e)) as ApiError;
    expect(err.message).toBe("Invalid email or password");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports network failures clearly", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const err = (await api("/claims").catch((e: unknown) => e)) as ApiError;
    expect(err.code).toBe("network_error");
  });
});
