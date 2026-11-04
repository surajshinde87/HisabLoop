/**
 * DEVELOPMENT ONLY. These accounts exist only in a database seeded with the `demo` Spring
 * profile (backend/src/main/resources/db/demo). They are shown only when NEXT_PUBLIC_DEMO_MODE=true
 * and still log in through the normal /auth/login endpoint – they grant nothing by themselves.
 */
export const DEMO_PASSWORD = "Demo@12345";

export interface DemoAccount {
  key: "sanjay" | "meera" | "ravi" | "priya" | "anita";
  name: string;
  initials: string;
  email: string;
  title: string;
  subtitle: string;
  tag: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    key: "sanjay",
    name: "Sanjay",
    initials: "SJ",
    email: "sanjay@shindeagro.example",
    title: "Admin / Owner",
    subtitle: "Shinde Agro Traders",
    tag: "Full Access",
    description: "Review spending, manage expense policies, approve high-value claims and create payout batches.",
  },
  {
    key: "meera",
    name: "Meera",
    initials: "MR",
    email: "meera@shindeagro.example",
    title: "Department Manager",
    subtitle: "Sales & Ops",
    tag: "Sales & Ops",
    description: "Approve team claims and review limit and duplicate flags.",
  },
  {
    key: "ravi",
    name: "Ravi",
    initials: "RV",
    email: "ravi@shindeagro.example",
    title: "Sales Executive",
    subtitle: "+91 98201 10004",
    tag: "WhatsApp User",
    description: "Send bills on WhatsApp, submit daily expenses and track reimbursement status.",
  },
  {
    key: "priya",
    name: "CA Priya",
    initials: "PR",
    email: "priya@kulkarnica.example",
    title: "Chartered Accountant",
    subtitle: "4 client workspaces",
    tag: "Audit & Tax",
    description: "Review claims and GST reports, and download Excel or CSV exports.",
  },
];

export const DEMO_FINANCE: DemoAccount = {
  key: "anita",
  name: "Anita",
  initials: "AR",
  email: "anita@shindeagro.example",
  title: "Finance Executive",
  subtitle: "Finance",
  tag: "Payouts",
  description: "Creates reimbursement batches and records bank payments.",
};
