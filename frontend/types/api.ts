/**
 * TypeScript mirrors of the Spring Boot DTOs (backend/src/main/java/com/hisabloop/**). Money values
 * are JSON numbers produced from BigDecimal; dates are ISO strings (LocalDate = "yyyy-MM-dd",
 * Instant = UTC ISO-8601). Keep in sync with docs/API_SPECIFICATION.md.
 */

export type Role = "ADMIN" | "FINANCE" | "MANAGER" | "EMPLOYEE" | "CA_PARTNER";

export type Permission =
  | "VIEW_CLAIMS"
  | "CREATE_CLAIM"
  | "APPROVE_CLAIMS"
  | "MANAGE_REIMBURSEMENTS"
  | "VIEW_REIMBURSEMENTS"
  | "VIEW_REPORTS"
  | "EXPORT_DATA"
  | "VIEW_POLICIES"
  | "MANAGE_POLICIES"
  | "VIEW_TEAM"
  | "MANAGE_TEAM"
  | "VIEW_AUDIT"
  | "REVIEW_ITC"
  | "MANAGE_COMPANY";

export type ClaimStatus = "DRAFT" | "CONFIRMED" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED" | "IN_BATCH" | "PAID";
export type ClaimSource = "WEB" | "WHATSAPP" | "TEXT";
export type GstinStatus = "VALID" | "MISSING" | "INVALID" | "NOT_APPLICABLE" | "NOT_CHECKED";
export type DuplicateStatus = "NONE" | "SUSPECTED" | "CONFIRMED_DUPLICATE" | "NOT_DUPLICATE";
export type PolicyStatus = "OK" | "WARNING" | "VIOLATION";
export type ItcStatus = "UNREVIEWED" | "ELIGIBLE" | "INELIGIBLE" | "NOT_APPLICABLE";
export type ClaimFlag =
  | "DUPLICATE"
  | "MISSING_GSTIN"
  | "INVALID_GSTIN"
  | "POLICY_VIOLATION"
  | "NO_RECEIPT"
  | "CLARIFICATION_REQUESTED";
export type ClaimAction =
  | "EDIT"
  | "UPLOAD_RECEIPT"
  | "CONFIRM"
  | "SUBMIT"
  | "APPROVE"
  | "REJECT"
  | "REQUEST_CHANGES"
  | "REQUEST_CLARIFICATION"
  | "RESPOND_CLARIFICATION"
  | "COMMENT"
  | "RESOLVE_DUPLICATE"
  | "REVIEW_ITC";

export interface PageResponse<T> {
  items: T[];
  page: number;
  size: number;
  totalItems: number;
  totalPages: number;
}

// ---------------------------------------------------------------- auth

export interface UserDto {
  id: string;
  email: string;
  fullName: string;
  phone?: string | null;
  caPartner: boolean;
  firmName?: string | null;
}

export interface Workspace {
  companyId: string;
  companyName: string;
  gstin?: string | null;
  plan: "STARTER" | "GROWTH" | "BUSINESS";
  city?: string | null;
  state?: string | null;
  role: Role;
  membershipId?: string | null;
  kind: "MEMBER" | "CA_CLIENT";
  teamName?: string | null;
  designation?: string | null;
  permissions: Permission[];
}

export interface Session {
  user: UserDto;
  workspaces: Workspace[];
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  session: Session;
}

export interface AuthConfig {
  selfRegistrationEnabled: boolean;
}

// ---------------------------------------------------------------- claims

export interface EmployeeRef {
  membershipId: string;
  userId: string;
  name: string;
  team?: string | null;
  designation?: string | null;
}

export interface Ref {
  id: string;
  reference: string;
}

export interface ClaimSummary {
  id: string;
  reference: string;
  claimNumber: number;
  employee: EmployeeRef;
  vendorName?: string | null;
  receiptDate?: string | null;
  categoryCode: string;
  totalAmount: number;
  gstAmount: number;
  status: ClaimStatus;
  source: ClaimSource;
  hasReceipt: boolean;
  flags: ClaimFlag[];
  batchId?: string | null;
  createdAt: string;
  submittedAt?: string | null;
}

export interface PolicyCheck {
  type: "CATEGORY_LIMIT" | "DUPLICATE" | "GSTIN" | "RECEIPT";
  result: "PASS" | "WARN" | "FAIL";
  blocking: boolean;
  message: string;
}

export interface ApprovalEntry {
  id: string;
  level: number;
  approverName: string;
  decision: "APPROVED" | "REJECTED" | "CHANGES_REQUESTED";
  comment?: string | null;
  decidedAt: string;
}

export interface CommentEntry {
  id: string;
  authorName: string;
  authorUserId: string;
  kind: "COMMENT" | "CLARIFICATION_REQUEST" | "CLARIFICATION_RESPONSE" | "SYSTEM";
  body: string;
  createdAt: string;
}

export interface AuditEntry {
  id: string;
  action: string;
  actorName: string;
  occurredAt: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  metadataJson?: string | null;
}

export interface ReceiptDto {
  id: string;
  originalFilename: string;
  contentType: string;
  sizeBytes: number;
  sha256: string;
  processingStatus: "UPLOADED" | "PROCESSING" | "COMPLETED" | "FAILED" | "NEEDS_REVIEW";
  provider?: string | null;
  confidence?: number | null;
  message?: string | null;
  uploadedAt: string;
  processedAt?: string | null;
}

export interface ClaimDetail {
  id: string;
  reference: string;
  claimNumber: number;
  employee: EmployeeRef;
  approverName?: string | null;
  categoryCode: string;
  vendorName?: string | null;
  receiptDate?: string | null;
  totalAmount: number;
  taxableAmount?: number | null;
  gstAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  vendorGstin?: string | null;
  gstinStatus: GstinStatus;
  paymentMode?: string | null;
  description?: string | null;
  rawText?: string | null;
  source: ClaimSource;
  status: ClaimStatus;
  hasReceipt: boolean;
  requiredApprovalLevels: number;
  approvalsCompleted: number;
  duplicateStatus: DuplicateStatus;
  duplicateOf?: Ref | null;
  policyStatus: PolicyStatus;
  clarificationRequested: boolean;
  itcStatus: ItcStatus;
  itcNote?: string | null;
  rejectionReason?: string | null;
  batch?: Ref | null;
  flags: ClaimFlag[];
  createdAt: string;
  confirmedAt?: string | null;
  submittedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  paidAt?: string | null;
  version: number;
  receipts: ReceiptDto[];
  policyChecks: PolicyCheck[];
  approvals: ApprovalEntry[];
  comments: CommentEntry[];
  auditTrail: AuditEntry[];
  availableActions: ClaimAction[];
}

export interface ClaimStats {
  count: number;
  amount: number;
}

export interface ClaimListStats {
  all: ClaimStats;
  pendingApproval: ClaimStats;
  approved: ClaimStats;
  needsAttention: ClaimStats;
}

export interface ClaimFilters {
  q?: string;
  status?: ClaimStatus[];
  category?: string;
  employeeId?: string;
  teamId?: string;
  from?: string;
  to?: string;
  flagged?: boolean;
  source?: ClaimSource[];
  page?: number;
  size?: number;
  sort?: string;
}

export interface ClaimInput {
  vendorName?: string | null;
  receiptDate?: string | null;
  categoryCode?: string;
  totalAmount?: number | null;
  taxableAmount?: number | null;
  cgstAmount?: number | null;
  sgstAmount?: number | null;
  igstAmount?: number | null;
  vendorGstin?: string | null;
  paymentMode?: string | null;
  description?: string | null;
}

export interface CreateClaimInput extends ClaimInput {
  categoryCode: string;
  source?: "WEB" | "WHATSAPP";
}

export interface UpdateClaimInput extends ClaimInput {
  version: number;
}

// ---------------------------------------------------------------- approvals

export interface PendingApproval {
  claim: ClaimSummary;
  level: number;
  requiredLevels: number;
  issues: PolicyCheck[];
  hasBlockingIssues: boolean;
  firstReceiptId?: string | null;
  clarificationRequested: boolean;
}

export interface BulkItemResult {
  claimId: string;
  reference?: string | null;
  outcome: "APPROVED" | "LEVEL_APPROVED" | "SKIPPED" | "FAILED";
  message: string;
}

export interface BulkResult {
  approved: number;
  skipped: number;
  failed: number;
  results: BulkItemResult[];
}

// ---------------------------------------------------------------- reimbursements

export interface BatchSummary {
  id: string;
  reference: string;
  status: "CREATED" | "PAID";
  totalAmount: number;
  claimCount: number;
  employeeCount: number;
  createdByName?: string | null;
  createdAt: string;
  paidAt?: string | null;
  notes?: string | null;
}

export interface EmployeeTotal {
  membershipId: string;
  name: string;
  team?: string | null;
  claimCount: number;
  amount: number;
}

export interface PaymentDto {
  method: string;
  reference: string;
  amount: number;
  paidOn: string;
  recordedByName?: string | null;
  recordedAt: string;
}

export interface BatchDetail {
  batch: BatchSummary;
  employees: EmployeeTotal[];
  claims: ClaimSummary[];
  payment?: PaymentDto | null;
}

export interface EligibleClaims {
  claims: ClaimSummary[];
  totalAmount: number;
}

export interface PayoutCapabilities {
  upiPayoutAvailable: boolean;
  upiPayoutMessage: string;
}

export type PaymentMethod = "NEFT" | "IMPS" | "RTGS" | "UPI_MANUAL" | "CHEQUE" | "CASH";

// ---------------------------------------------------------------- reports

export interface Amount {
  count: number;
  amount: number;
}

export interface CategorySpend {
  code: string;
  label: string;
  amount: number;
  count: number;
  percent: number;
}

export interface MonthSpend {
  month: string;
  label: string;
  total: number;
  byTeam: Record<string, number>;
}

export interface FlaggedClaim {
  claim: ClaimSummary;
  issueType: string;
  issueTitle: string;
  issueMessage: string;
}

export interface Dashboard {
  month: string;
  from: string;
  to: string;
  totalSpend: Amount;
  previousMonthSpend: number;
  spendChangePercent?: number | null;
  pendingApproval: Amount;
  approvedAwaitingPayment: Amount;
  inBatch: Amount;
  paidThisMonth: Amount;
  averageApprovalHours?: number | null;
  previousAverageApprovalHours?: number | null;
  flagged: Amount;
  byCategory: CategorySpend[];
  monthlyTrend: MonthSpend[];
  teams: string[];
  gstCaptured: number;
  itcMarkedEligible: number;
  flaggedClaims: FlaggedClaim[];
  recentClaims: ClaimSummary[];
}

export interface NavCounts {
  claims: number;
  approvals: number;
  openBatches: number;
}

export type SpendGroup = "category" | "team" | "employee" | "vendor" | "month";

export interface SpendRow {
  key: string;
  label: string;
  claimCount: number;
  totalAmount: number;
  gstAmount: number;
}

export interface SpendReport {
  groupBy: SpendGroup;
  from?: string | null;
  to?: string | null;
  rows: SpendRow[];
  total: number;
  claimCount: number;
  basis: string;
}

export interface GstRow {
  month: string;
  claimId: string;
  claimReference: string;
  receiptDate?: string | null;
  vendor?: string | null;
  gstin?: string | null;
  gstinStatus: GstinStatus;
  taxableValue?: number | null;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  invoiceTotal: number;
  itcStatus: ItcStatus;
  completenessIssues: string[];
}

export interface GstMonth {
  month: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  totalGst: number;
  itcMarkedEligible: number;
  rows: number;
  completeRows: number;
}

export interface GstReport {
  from?: string | null;
  to?: string | null;
  rows: GstRow[];
  months: GstMonth[];
  totalGst: number;
  itcMarkedEligible: number;
  completenessPercent: number;
  basis: string;
}

export interface ExportJob {
  id: string;
  reportType: string;
  format: string;
  rowCount: number;
  requestedByName?: string | null;
  createdAt: string;
}

// ---------------------------------------------------------------- policies, team, company

export interface CategoryLimit {
  categoryCode: string;
  role: "ALL" | "ADMIN" | "FINANCE" | "MANAGER" | "EMPLOYEE";
  perClaimLimit: number;
}

export interface Policy {
  twoLevelApprovalAbove: number;
  duplicateDetectionEnabled: boolean;
  duplicateWindowDays: number;
  gstinValidationEnabled: boolean;
  receiptRequiredAbove?: number | null;
  categoryLimits: CategoryLimit[];
  updatedAt?: string | null;
  updatedByName?: string | null;
  canEdit: boolean;
}

export type PolicyInput = Omit<Policy, "updatedAt" | "updatedByName" | "canEdit">;

export interface Category {
  code: string;
  label: string;
  icon: string;
}

export interface Member {
  membershipId: string;
  userId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  role: Role;
  teamId?: string | null;
  teamName?: string | null;
  managerMembershipId?: string | null;
  managerName?: string | null;
  designation?: string | null;
  status: "ACTIVE" | "INACTIVE";
  joinedAt: string;
}

export interface TeamDto {
  id: string;
  name: string;
  memberCount: number;
}

export interface Invitation {
  id: string;
  email: string;
  fullName?: string | null;
  role: Role;
  teamName?: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface MembersResponse {
  members: Member[];
  teams: TeamDto[];
  pendingInvitations: Invitation[];
  canManage: boolean;
}

export interface InviteResponse {
  invitation: Invitation;
  acceptUrl?: string | null;
  emailDelivered: boolean;
}

export interface Company {
  id: string;
  name: string;
  legalName?: string | null;
  gstin?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  state?: string | null;
  plan: "STARTER" | "GROWTH" | "BUSINESS";
  status: string;
  createdAt: string;
  activeMembers: number;
  subscription?: {
    plan: string;
    seats: number;
    pricePerUser: number;
    status: string;
    billingConfigured: boolean;
  } | null;
}

// ---------------------------------------------------------------- accountant

export interface ClientDto {
  companyId: string;
  companyName: string;
  gstin?: string | null;
  city?: string | null;
  state?: string | null;
  pendingClaims: number;
  claimsAwaitingItcReview: number;
  gstCompletenessPercent?: number | null;
  lastExportAt?: string | null;
  accessStatus: "ACTIVE" | "REVOKED";
  permissions: Permission[];
}

export interface ClientSummary {
  client: ClientDto;
  claimsByStatus: Record<string, number>;
  gstMonths: GstMonth[];
  gstTotal: number;
  itcMarkedEligible: number;
  recentExports: ExportJob[];
}

export interface CaPartner {
  relationshipId: string;
  caUserId: string;
  name?: string | null;
  email?: string | null;
  firmName?: string | null;
  status: string;
  canViewClaims: boolean;
  canViewReports: boolean;
  canExport: boolean;
  canViewAudit: boolean;
  canReviewItc: boolean;
  lastExportAt?: string | null;
  grantedAt: string;
}

// ---------------------------------------------------------------- audit & messaging

export interface AuditEvent {
  id: string;
  seq: number;
  entityType: string;
  entityId: string;
  entityRef?: string | null;
  action: string;
  actorUserId?: string | null;
  actorName: string;
  occurredAt: string;
  previousStatus?: string | null;
  newStatus?: string | null;
  metadataJson?: string | null;
  hash: string;
}

export interface ChainVerification {
  valid: boolean;
  eventsChecked: number;
  firstInvalidEventId?: string | null;
}

export interface WhatsAppMessage {
  id: string;
  template: string;
  body: string;
  status: "SENT" | "LOGGED" | "FAILED";
  createdAt: string;
}

export interface WhatsAppStatus {
  mode: string;
  businessApiConfigured: boolean;
  message: string;
}

export interface ContactInput {
  fullName: string;
  email: string;
  companyName?: string;
  phone?: string;
  teamSize?: string;
  topic: "DEMO" | "SALES" | "SUPPORT" | "PARTNERSHIP" | "OTHER";
  message: string;
  website?: string;
}

export interface PlanInfo {
  code: "STARTER" | "GROWTH" | "BUSINESS";
  pricePerUserMonthly: number;
  currency: string;
}
