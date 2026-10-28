import { cn, initials } from "@/lib/utils";

describe("cn", () => {
  it("keeps custom type-scale sizes next to colour classes", () => {
    expect(cn("font-headline-md text-headline-md", "text-primary")).toBe("font-headline-md text-headline-md text-primary");
  });
  it("still resolves real conflicts", () => {
    expect(cn("text-body-sm", "text-label-lg")).toBe("text-label-lg");
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});

describe("initials", () => {
  it("uses first and last name", () => {
    expect(initials("Ravi Shinde")).toBe("RS");
    expect(initials("Meera")).toBe("M");
    expect(initials("")).toBe("?");
  });
});
