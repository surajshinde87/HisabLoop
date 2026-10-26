import type { Role } from "@/types/api";

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin / Owner",
  FINANCE: "Finance",
  MANAGER: "Manager",
  EMPLOYEE: "Employee",
  CA_PARTNER: "CA Partner",
};
