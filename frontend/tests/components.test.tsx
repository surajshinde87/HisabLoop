import { render, screen } from "@testing-library/react";
import { StatusBadge, FlagChips } from "@/components/app/badges";
import type { Permission, Workspace } from "@/types/api";

const authState: { workspace: Workspace | null; caPartner: boolean } = { workspace: null, caPartner: false };

vi.mock("next/navigation", () => ({ usePathname: () => "/claims", useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));
vi.mock("@/hooks/use-company-data", () => ({ useNavCounts: () => ({ data: { claims: 40, approvals: 8, openBatches: 1 } }) }));
vi.mock("@/features/auth/auth-provider", () => ({
  useAuth: () => ({
    workspace: authState.workspace,
    companyId: authState.workspace?.companyId ?? null,
    session: { user: { id: "u", email: "x@y.z", fullName: "Test User", caPartner: authState.caPartner }, workspaces: authState.workspace ? [authState.workspace] : [] },
    can: (p: Permission) => Boolean(authState.workspace?.permissions.includes(p)),
    logout: vi.fn(),
  }),
}));

import { AppSidebar } from "@/components/app/app-sidebar";

function ws(role: Workspace["role"], permissions: Permission[], kind: Workspace["kind"] = "MEMBER"): Workspace {
  return { companyId: "c1", companyName: "Shinde Agro Traders", plan: "GROWTH", role, kind, permissions, membershipId: "m1" };
}

describe("StatusBadge", () => {
  it("shows human labels", () => {
    render(<StatusBadge status="PENDING_APPROVAL" />);
    expect(screen.getByText(/pending/i)).toBeInTheDocument();
  });
  it("renders duplicate flags", () => {
    render(<FlagChips flags={["DUPLICATE"]} />);
    expect(screen.getByText(/duplicate/i)).toBeInTheDocument();
  });
});

describe("role-aware sidebar", () => {
  it("hides approvals, reports and audit from employees", () => {
    authState.workspace = ws("EMPLOYEE", ["VIEW_CLAIMS", "CREATE_CLAIM", "VIEW_POLICIES"]);
    render(<AppSidebar />);
    expect(screen.getByRole("link", { name: /claims/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /approvals/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /audit log/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /reports/i })).toBeNull();
    expect(screen.getByRole("link", { name: /whatsapp simulator/i })).toBeInTheDocument();
  });
  it("shows approvals with a pending count for managers", () => {
    authState.workspace = ws("MANAGER", ["VIEW_CLAIMS", "CREATE_CLAIM", "APPROVE_CLAIMS", "VIEW_POLICIES", "VIEW_TEAM"]);
    render(<AppSidebar />);
    expect(screen.getByRole("link", { name: /approvals.*8 pending/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /reimbursements/i })).toBeNull();
  });
  it("gives CA partners the portal but not the simulator", () => {
    authState.workspace = ws("CA_PARTNER", ["VIEW_CLAIMS", "VIEW_REPORTS", "EXPORT_DATA"], "CA_CLIENT");
    authState.caPartner = true;
    render(<AppSidebar />);
    expect(screen.getByRole("link", { name: /ca partner portal/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /whatsapp simulator/i })).toBeNull();
    expect(screen.queryByRole("link", { name: /team & settings/i })).toBeNull();
  });
});
