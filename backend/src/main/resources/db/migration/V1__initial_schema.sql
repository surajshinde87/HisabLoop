-- HisabLoop initial schema (MySQL 8.x, InnoDB, utf8mb4)
-- Conventions:
--   * Public identifiers are UUID strings (VARCHAR(36)).
--   * Money: DECIMAL(14,2). Event timestamps: DATETIME(6) stored in UTC.
--   * Business dates (receipt date, payment date): DATE, interpreted as Indian business dates.

CREATE TABLE users (
    id              VARCHAR(36)     NOT NULL,
    email           VARCHAR(190) NOT NULL,
    password_hash   VARCHAR(100) NOT NULL,
    full_name       VARCHAR(120) NOT NULL,
    phone           VARCHAR(20)  NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE,
    is_ca_partner   BOOLEAN      NOT NULL DEFAULT FALSE,
    firm_name       VARCHAR(160) NULL,
    last_login_at   DATETIME(6)  NULL,
    created_at      DATETIME(6)  NOT NULL,
    updated_at      DATETIME(6)  NOT NULL,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uq_users_email UNIQUE (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE companies (
    id                 VARCHAR(36)     NOT NULL,
    name               VARCHAR(160) NOT NULL,
    legal_name         VARCHAR(200) NULL,
    gstin              VARCHAR(15)  NULL,
    email              VARCHAR(190) NULL,
    phone              VARCHAR(20)  NULL,
    city               VARCHAR(80)  NULL,
    state              VARCHAR(80)  NULL,
    plan               VARCHAR(20)  NOT NULL,
    status             VARCHAR(20)  NOT NULL,
    next_claim_number  INT          NOT NULL DEFAULT 1001,
    next_batch_number  INT          NOT NULL DEFAULT 101,
    created_at         DATETIME(6)  NOT NULL,
    updated_at         DATETIME(6)  NOT NULL,
    CONSTRAINT pk_companies PRIMARY KEY (id),
    CONSTRAINT ck_companies_plan CHECK (plan IN ('STARTER','GROWTH','BUSINESS')),
    CONSTRAINT ck_companies_status CHECK (status IN ('ACTIVE','SUSPENDED','CLOSED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_companies_gstin ON companies (gstin);

CREATE TABLE company_subscriptions (
    id              VARCHAR(36)      NOT NULL,
    company_id      VARCHAR(36)      NOT NULL,
    plan            VARCHAR(20)   NOT NULL,
    seats           INT           NOT NULL,
    price_per_user  DECIMAL(10,2) NOT NULL,
    status          VARCHAR(20)   NOT NULL,
    started_at      DATETIME(6)   NOT NULL,
    ends_at         DATETIME(6)   NULL,
    created_at      DATETIME(6)   NOT NULL,
    CONSTRAINT pk_company_subscriptions PRIMARY KEY (id),
    CONSTRAINT fk_subscriptions_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT ck_subscriptions_seats CHECK (seats > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_subscriptions_company ON company_subscriptions (company_id, status);

CREATE TABLE teams (
    id          VARCHAR(36)    NOT NULL,
    company_id  VARCHAR(36)    NOT NULL,
    name        VARCHAR(80) NOT NULL,
    created_at  DATETIME(6) NOT NULL,
    updated_at  DATETIME(6) NOT NULL,
    CONSTRAINT pk_teams PRIMARY KEY (id),
    CONSTRAINT fk_teams_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT uq_teams_company_name UNIQUE (company_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE company_memberships (
    id                     VARCHAR(36)    NOT NULL,
    user_id                VARCHAR(36)    NOT NULL,
    company_id             VARCHAR(36)    NOT NULL,
    role                   VARCHAR(20) NOT NULL,
    team_id                VARCHAR(36)    NULL,
    manager_membership_id  VARCHAR(36)    NULL,
    designation            VARCHAR(80) NULL,
    status                 VARCHAR(20) NOT NULL,
    created_at             DATETIME(6) NOT NULL,
    updated_at             DATETIME(6) NOT NULL,
    CONSTRAINT pk_company_memberships PRIMARY KEY (id),
    CONSTRAINT fk_memberships_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT fk_memberships_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_memberships_team FOREIGN KEY (team_id) REFERENCES teams (id),
    CONSTRAINT fk_memberships_manager FOREIGN KEY (manager_membership_id) REFERENCES company_memberships (id),
    CONSTRAINT uq_memberships_user_company UNIQUE (user_id, company_id),
    CONSTRAINT ck_memberships_role CHECK (role IN ('ADMIN','FINANCE','MANAGER','EMPLOYEE')),
    CONSTRAINT ck_memberships_status CHECK (status IN ('ACTIVE','INACTIVE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_memberships_company_status ON company_memberships (company_id, status);
CREATE INDEX ix_memberships_manager ON company_memberships (manager_membership_id);

CREATE TABLE ca_client_relationships (
    id                 VARCHAR(36)    NOT NULL,
    ca_user_id         VARCHAR(36)    NOT NULL,
    company_id         VARCHAR(36)    NOT NULL,
    status             VARCHAR(20) NOT NULL,
    can_view_claims    BOOLEAN     NOT NULL DEFAULT TRUE,
    can_view_reports   BOOLEAN     NOT NULL DEFAULT TRUE,
    can_export         BOOLEAN     NOT NULL DEFAULT TRUE,
    can_view_audit     BOOLEAN     NOT NULL DEFAULT FALSE,
    can_review_itc     BOOLEAN     NOT NULL DEFAULT TRUE,
    last_export_at     DATETIME(6) NULL,
    created_at         DATETIME(6) NOT NULL,
    updated_at         DATETIME(6) NOT NULL,
    revoked_at         DATETIME(6) NULL,
    CONSTRAINT pk_ca_client_relationships PRIMARY KEY (id),
    CONSTRAINT fk_ca_rel_user FOREIGN KEY (ca_user_id) REFERENCES users (id),
    CONSTRAINT fk_ca_rel_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT uq_ca_rel_user_company UNIQUE (ca_user_id, company_id),
    CONSTRAINT ck_ca_rel_status CHECK (status IN ('ACTIVE','REVOKED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_ca_rel_company ON ca_client_relationships (company_id, status);

CREATE TABLE invitations (
    id                     VARCHAR(36)     NOT NULL,
    company_id             VARCHAR(36)     NOT NULL,
    email                  VARCHAR(190) NOT NULL,
    full_name              VARCHAR(120) NULL,
    role                   VARCHAR(20)  NOT NULL,
    team_id                VARCHAR(36)     NULL,
    manager_membership_id  VARCHAR(36)     NULL,
    token_hash             VARCHAR(64)     NOT NULL,
    status                 VARCHAR(20)  NOT NULL,
    expires_at             DATETIME(6)  NOT NULL,
    invited_by_user_id     VARCHAR(36)     NOT NULL,
    accepted_at            DATETIME(6)  NULL,
    created_at             DATETIME(6)  NOT NULL,
    updated_at             DATETIME(6)  NOT NULL,
    CONSTRAINT pk_invitations PRIMARY KEY (id),
    CONSTRAINT fk_invitations_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_invitations_team FOREIGN KEY (team_id) REFERENCES teams (id),
    CONSTRAINT fk_invitations_manager FOREIGN KEY (manager_membership_id) REFERENCES company_memberships (id),
    CONSTRAINT fk_invitations_inviter FOREIGN KEY (invited_by_user_id) REFERENCES users (id),
    CONSTRAINT uq_invitations_token UNIQUE (token_hash),
    CONSTRAINT ck_invitations_status CHECK (status IN ('PENDING','ACCEPTED','REVOKED','EXPIRED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_invitations_company_status ON invitations (company_id, status);

CREATE TABLE password_reset_tokens (
    id          VARCHAR(36)    NOT NULL,
    user_id     VARCHAR(36)    NOT NULL,
    token_hash  VARCHAR(64)    NOT NULL,
    expires_at  DATETIME(6) NOT NULL,
    used_at     DATETIME(6) NULL,
    created_at  DATETIME(6) NOT NULL,
    updated_at  DATETIME(6) NOT NULL,
    CONSTRAINT pk_password_reset_tokens PRIMARY KEY (id),
    CONSTRAINT fk_prt_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uq_prt_token UNIQUE (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE refresh_tokens (
    id           VARCHAR(36)    NOT NULL,
    user_id      VARCHAR(36)    NOT NULL,
    token_hash   VARCHAR(64)    NOT NULL,
    expires_at   DATETIME(6) NOT NULL,
    revoked_at   DATETIME(6) NULL,
    created_at   DATETIME(6) NOT NULL,
    updated_at   DATETIME(6) NOT NULL,
    CONSTRAINT pk_refresh_tokens PRIMARY KEY (id),
    CONSTRAINT fk_refresh_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT uq_refresh_token UNIQUE (token_hash)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_refresh_user ON refresh_tokens (user_id, revoked_at);

CREATE TABLE expense_categories (
    code        VARCHAR(40) NOT NULL,
    label       VARCHAR(80) NOT NULL,
    icon        VARCHAR(40) NOT NULL,
    sort_order  INT         NOT NULL,
    CONSTRAINT pk_expense_categories PRIMARY KEY (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

INSERT INTO expense_categories (code, label, icon, sort_order) VALUES
    ('TRAVEL', 'Travel', 'local_taxi', 1),
    ('FOOD', 'Food & Meals', 'restaurant', 2),
    ('FUEL', 'Fuel', 'local_gas_station', 3),
    ('OFFICE', 'Office Supplies', 'inventory', 4),
    ('SOFTWARE', 'Software & SaaS', 'memory', 5),
    ('CLIENT_ENTERTAINMENT', 'Client Entertainment', 'handshake', 6),
    ('OTHER', 'Other', 'category', 7);

CREATE TABLE expense_policies (
    id                           VARCHAR(36)      NOT NULL,
    company_id                   VARCHAR(36)      NOT NULL,
    two_level_approval_above     DECIMAL(14,2) NOT NULL,
    duplicate_detection_enabled  BOOLEAN       NOT NULL DEFAULT TRUE,
    duplicate_window_days        INT           NOT NULL DEFAULT 90,
    gstin_validation_enabled     BOOLEAN       NOT NULL DEFAULT TRUE,
    receipt_required_above       DECIMAL(14,2) NULL,
    updated_by_user_id           VARCHAR(36)      NULL,
    created_at                   DATETIME(6)   NOT NULL,
    updated_at                   DATETIME(6)   NOT NULL,
    CONSTRAINT pk_expense_policies PRIMARY KEY (id),
    CONSTRAINT fk_policies_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT uq_policies_company UNIQUE (company_id),
    CONSTRAINT ck_policies_threshold CHECK (two_level_approval_above >= 0),
    CONSTRAINT ck_policies_window CHECK (duplicate_window_days BETWEEN 1 AND 730)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- role = 'ALL' applies to every role; a role-specific row overrides it.
CREATE TABLE policy_category_limits (
    id               VARCHAR(36)      NOT NULL,
    company_id       VARCHAR(36)      NOT NULL,
    category_code    VARCHAR(40)   NOT NULL,
    role             VARCHAR(20)   NOT NULL,
    per_claim_limit  DECIMAL(14,2) NOT NULL,
    created_at       DATETIME(6)   NOT NULL,
    updated_at       DATETIME(6)   NOT NULL,
    CONSTRAINT pk_policy_category_limits PRIMARY KEY (id),
    CONSTRAINT fk_pcl_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_pcl_category FOREIGN KEY (category_code) REFERENCES expense_categories (code),
    CONSTRAINT uq_pcl_company_category_role UNIQUE (company_id, category_code, role),
    CONSTRAINT ck_pcl_limit CHECK (per_claim_limit > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE reimbursement_batches (
    id                  VARCHAR(36)      NOT NULL,
    company_id          VARCHAR(36)      NOT NULL,
    batch_number        INT           NOT NULL,
    status              VARCHAR(20)   NOT NULL,
    total_amount        DECIMAL(14,2) NOT NULL,
    claim_count         INT           NOT NULL,
    notes               VARCHAR(500)  NULL,
    created_by_user_id  VARCHAR(36)      NOT NULL,
    paid_at             DATETIME(6)   NULL,
    created_at          DATETIME(6)   NOT NULL,
    updated_at          DATETIME(6)   NOT NULL,
    version             INT           NOT NULL DEFAULT 0,
    CONSTRAINT pk_reimbursement_batches PRIMARY KEY (id),
    CONSTRAINT fk_batches_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_batches_creator FOREIGN KEY (created_by_user_id) REFERENCES users (id),
    CONSTRAINT uq_batches_company_number UNIQUE (company_id, batch_number),
    CONSTRAINT ck_batches_status CHECK (status IN ('CREATED','PAID')),
    CONSTRAINT ck_batches_total CHECK (total_amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_batches_company_status ON reimbursement_batches (company_id, status, created_at);

CREATE TABLE expense_claims (
    id                        VARCHAR(36)      NOT NULL,
    company_id                VARCHAR(36)      NOT NULL,
    claim_number              INT           NOT NULL,
    employee_membership_id    VARCHAR(36)      NOT NULL,
    category_code             VARCHAR(40)   NOT NULL,
    vendor_name               VARCHAR(160)  NULL,
    receipt_date              DATE          NULL,
    total_amount              DECIMAL(14,2) NOT NULL,
    taxable_amount            DECIMAL(14,2) NULL,
    gst_amount                DECIMAL(14,2) NOT NULL DEFAULT 0,
    cgst_amount               DECIMAL(14,2) NOT NULL DEFAULT 0,
    sgst_amount               DECIMAL(14,2) NOT NULL DEFAULT 0,
    igst_amount               DECIMAL(14,2) NOT NULL DEFAULT 0,
    vendor_gstin              VARCHAR(15)   NULL,
    payment_mode              VARCHAR(30)   NULL,
    description               VARCHAR(500)  NULL,
    raw_text                  VARCHAR(500)  NULL,
    source                    VARCHAR(20)   NOT NULL,
    status                    VARCHAR(20)   NOT NULL,
    has_receipt               BOOLEAN       NOT NULL DEFAULT FALSE,
    required_approval_levels  INT       NOT NULL DEFAULT 1,
    approvals_completed       INT       NOT NULL DEFAULT 0,
    gstin_status              VARCHAR(20)   NOT NULL,
    duplicate_status          VARCHAR(30)   NOT NULL DEFAULT 'NONE',
    duplicate_of_claim_id     VARCHAR(36)      NULL,
    policy_status             VARCHAR(20)   NOT NULL DEFAULT 'OK',
    clarification_requested   BOOLEAN       NOT NULL DEFAULT FALSE,
    itc_status                VARCHAR(20)   NOT NULL DEFAULT 'UNREVIEWED',
    itc_note                  VARCHAR(500)  NULL,
    rejection_reason          VARCHAR(1000) NULL,
    batch_id                  VARCHAR(36)      NULL,
    confirmed_at              DATETIME(6)   NULL,
    submitted_at              DATETIME(6)   NULL,
    approved_at               DATETIME(6)   NULL,
    rejected_at               DATETIME(6)   NULL,
    paid_at                   DATETIME(6)   NULL,
    created_at                DATETIME(6)   NOT NULL,
    updated_at                DATETIME(6)   NOT NULL,
    version                   INT           NOT NULL DEFAULT 0,
    CONSTRAINT pk_expense_claims PRIMARY KEY (id),
    CONSTRAINT fk_claims_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_claims_employee FOREIGN KEY (employee_membership_id) REFERENCES company_memberships (id),
    CONSTRAINT fk_claims_category FOREIGN KEY (category_code) REFERENCES expense_categories (code),
    CONSTRAINT fk_claims_duplicate_of FOREIGN KEY (duplicate_of_claim_id) REFERENCES expense_claims (id),
    CONSTRAINT fk_claims_batch FOREIGN KEY (batch_id) REFERENCES reimbursement_batches (id),
    CONSTRAINT uq_claims_company_number UNIQUE (company_id, claim_number),
    CONSTRAINT ck_claims_status CHECK (status IN ('DRAFT','CONFIRMED','PENDING_APPROVAL','APPROVED','REJECTED','IN_BATCH','PAID')),
    CONSTRAINT ck_claims_source CHECK (source IN ('WEB','WHATSAPP','TEXT')),
    CONSTRAINT ck_claims_amount CHECK (total_amount >= 0),
    CONSTRAINT ck_claims_gst CHECK (gst_amount >= 0 AND cgst_amount >= 0 AND sgst_amount >= 0 AND igst_amount >= 0),
    CONSTRAINT ck_claims_levels CHECK (required_approval_levels BETWEEN 1 AND 2 AND approvals_completed BETWEEN 0 AND 2),
    CONSTRAINT ck_claims_gstin_status CHECK (gstin_status IN ('VALID','MISSING','INVALID','NOT_APPLICABLE','NOT_CHECKED')),
    CONSTRAINT ck_claims_dup_status CHECK (duplicate_status IN ('NONE','SUSPECTED','CONFIRMED_DUPLICATE','NOT_DUPLICATE')),
    CONSTRAINT ck_claims_policy_status CHECK (policy_status IN ('OK','WARNING','VIOLATION')),
    CONSTRAINT ck_claims_itc_status CHECK (itc_status IN ('UNREVIEWED','ELIGIBLE','INELIGIBLE','NOT_APPLICABLE'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_claims_company_status ON expense_claims (company_id, status);
CREATE INDEX ix_claims_company_employee ON expense_claims (company_id, employee_membership_id);
CREATE INDEX ix_claims_company_date ON expense_claims (company_id, receipt_date);
CREATE INDEX ix_claims_company_category ON expense_claims (company_id, category_code);
CREATE INDEX ix_claims_duplicate_lookup ON expense_claims (company_id, total_amount, receipt_date);
CREATE INDEX ix_claims_batch ON expense_claims (batch_id);

CREATE TABLE receipts (
    id                   VARCHAR(36)     NOT NULL,
    company_id           VARCHAR(36)     NOT NULL,
    claim_id             VARCHAR(36)     NOT NULL,
    original_filename    VARCHAR(255) NOT NULL,
    content_type         VARCHAR(100) NOT NULL,
    size_bytes           BIGINT       NOT NULL,
    storage_key          VARCHAR(255) NOT NULL,
    sha256               VARCHAR(64)     NOT NULL,
    processing_status    VARCHAR(20)  NOT NULL,
    provider             VARCHAR(40)  NULL,
    confidence           DECIMAL(5,2) NULL,
    extracted_json       TEXT         NULL,
    error_message        VARCHAR(500) NULL,
    uploaded_by_user_id  VARCHAR(36)     NOT NULL,
    processed_at         DATETIME(6)  NULL,
    created_at           DATETIME(6)  NOT NULL,
    updated_at           DATETIME(6)  NOT NULL,
    CONSTRAINT pk_receipts PRIMARY KEY (id),
    CONSTRAINT fk_receipts_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_receipts_claim FOREIGN KEY (claim_id) REFERENCES expense_claims (id),
    CONSTRAINT fk_receipts_uploader FOREIGN KEY (uploaded_by_user_id) REFERENCES users (id),
    CONSTRAINT uq_receipts_storage_key UNIQUE (storage_key),
    CONSTRAINT ck_receipts_status CHECK (processing_status IN ('UPLOADED','PROCESSING','COMPLETED','FAILED','NEEDS_REVIEW')),
    CONSTRAINT ck_receipts_confidence CHECK (confidence IS NULL OR (confidence >= 0 AND confidence <= 100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_receipts_claim ON receipts (claim_id);
CREATE INDEX ix_receipts_company_sha ON receipts (company_id, sha256);

CREATE TABLE claim_policy_checks (
    id            VARCHAR(36)     NOT NULL,
    company_id    VARCHAR(36)     NOT NULL,
    claim_id      VARCHAR(36)     NOT NULL,
    check_type    VARCHAR(30)  NOT NULL,
    result        VARCHAR(10)  NOT NULL,
    blocking      BOOLEAN      NOT NULL DEFAULT FALSE,
    message       VARCHAR(500) NOT NULL,
    evaluated_at  DATETIME(6)  NOT NULL,
    CONSTRAINT pk_claim_policy_checks PRIMARY KEY (id),
    CONSTRAINT fk_cpc_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_cpc_claim FOREIGN KEY (claim_id) REFERENCES expense_claims (id),
    CONSTRAINT ck_cpc_type CHECK (check_type IN ('CATEGORY_LIMIT','DUPLICATE','GSTIN','RECEIPT')),
    CONSTRAINT ck_cpc_result CHECK (result IN ('PASS','WARN','FAIL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_cpc_claim ON claim_policy_checks (claim_id);

CREATE TABLE approvals (
    id                      VARCHAR(36)      NOT NULL,
    company_id              VARCHAR(36)      NOT NULL,
    claim_id                VARCHAR(36)      NOT NULL,
    level                   INT       NOT NULL,
    approver_membership_id  VARCHAR(36)      NOT NULL,
    decision                VARCHAR(30)   NOT NULL,
    comment                 VARCHAR(1000) NULL,
    decided_at              DATETIME(6)   NOT NULL,
    CONSTRAINT pk_approvals PRIMARY KEY (id),
    CONSTRAINT fk_approvals_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_approvals_claim FOREIGN KEY (claim_id) REFERENCES expense_claims (id),
    CONSTRAINT fk_approvals_approver FOREIGN KEY (approver_membership_id) REFERENCES company_memberships (id),
    CONSTRAINT ck_approvals_decision CHECK (decision IN ('APPROVED','REJECTED','CHANGES_REQUESTED')),
    CONSTRAINT ck_approvals_level CHECK (level BETWEEN 1 AND 2)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_approvals_claim ON approvals (claim_id, decided_at);
CREATE INDEX ix_approvals_company_approver ON approvals (company_id, approver_membership_id);

CREATE TABLE claim_comments (
    id              VARCHAR(36)      NOT NULL,
    company_id      VARCHAR(36)      NOT NULL,
    claim_id        VARCHAR(36)      NOT NULL,
    author_user_id  VARCHAR(36)      NOT NULL,
    kind            VARCHAR(30)   NOT NULL,
    body            VARCHAR(2000) NOT NULL,
    created_at      DATETIME(6)   NOT NULL,
    CONSTRAINT pk_claim_comments PRIMARY KEY (id),
    CONSTRAINT fk_comments_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_comments_claim FOREIGN KEY (claim_id) REFERENCES expense_claims (id),
    CONSTRAINT fk_comments_author FOREIGN KEY (author_user_id) REFERENCES users (id),
    CONSTRAINT ck_comments_kind CHECK (kind IN ('COMMENT','CLARIFICATION_REQUEST','CLARIFICATION_RESPONSE','SYSTEM'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_comments_claim ON claim_comments (claim_id, created_at);

CREATE TABLE reimbursement_batch_items (
    id                      VARCHAR(36)      NOT NULL,
    company_id              VARCHAR(36)      NOT NULL,
    batch_id                VARCHAR(36)      NOT NULL,
    claim_id                VARCHAR(36)      NOT NULL,
    employee_membership_id  VARCHAR(36)      NOT NULL,
    amount                  DECIMAL(14,2) NOT NULL,
    CONSTRAINT pk_reimbursement_batch_items PRIMARY KEY (id),
    CONSTRAINT fk_items_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_items_batch FOREIGN KEY (batch_id) REFERENCES reimbursement_batches (id),
    CONSTRAINT fk_items_claim FOREIGN KEY (claim_id) REFERENCES expense_claims (id),
    CONSTRAINT fk_items_employee FOREIGN KEY (employee_membership_id) REFERENCES company_memberships (id),
    -- A claim can only ever be part of one batch.
    CONSTRAINT uq_items_claim UNIQUE (claim_id),
    CONSTRAINT ck_items_amount CHECK (amount >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_items_batch ON reimbursement_batch_items (batch_id);

CREATE TABLE payment_records (
    id                   VARCHAR(36)      NOT NULL,
    company_id           VARCHAR(36)      NOT NULL,
    batch_id             VARCHAR(36)      NOT NULL,
    method               VARCHAR(20)   NOT NULL,
    reference            VARCHAR(100)  NOT NULL,
    amount               DECIMAL(14,2) NOT NULL,
    paid_on              DATE          NOT NULL,
    recorded_by_user_id  VARCHAR(36)      NOT NULL,
    created_at           DATETIME(6)   NOT NULL,
    CONSTRAINT pk_payment_records PRIMARY KEY (id),
    CONSTRAINT fk_payments_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_payments_batch FOREIGN KEY (batch_id) REFERENCES reimbursement_batches (id),
    CONSTRAINT fk_payments_recorder FOREIGN KEY (recorded_by_user_id) REFERENCES users (id),
    -- A batch can be paid only once.
    CONSTRAINT uq_payments_batch UNIQUE (batch_id),
    CONSTRAINT ck_payments_method CHECK (method IN ('NEFT','IMPS','RTGS','UPI_MANUAL','CHEQUE','CASH'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE audit_events (
    seq               BIGINT       NOT NULL AUTO_INCREMENT,
    id                VARCHAR(36)     NOT NULL,
    company_id        VARCHAR(36)     NOT NULL,
    entity_type       VARCHAR(40)  NOT NULL,
    entity_id         VARCHAR(36)     NOT NULL,
    entity_ref        VARCHAR(40)  NULL,
    action            VARCHAR(60)  NOT NULL,
    actor_user_id     VARCHAR(36)     NULL,
    actor_name        VARCHAR(120) NOT NULL,
    occurred_at       DATETIME(6)  NOT NULL,
    previous_status   VARCHAR(30)  NULL,
    new_status        VARCHAR(30)  NULL,
    metadata_json     TEXT         NULL,
    prev_hash         VARCHAR(64)     NOT NULL,
    hash              VARCHAR(64)     NOT NULL,
    CONSTRAINT pk_audit_events PRIMARY KEY (seq),
    CONSTRAINT uq_audit_events_id UNIQUE (id),
    CONSTRAINT fk_audit_company FOREIGN KEY (company_id) REFERENCES companies (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_audit_company_time ON audit_events (company_id, occurred_at);
CREATE INDEX ix_audit_company_entity ON audit_events (company_id, entity_type, entity_id);
CREATE INDEX ix_audit_company_action ON audit_events (company_id, action);
CREATE INDEX ix_audit_company_actor ON audit_events (company_id, actor_user_id);

CREATE TABLE notification_records (
    id          VARCHAR(36)     NOT NULL,
    company_id  VARCHAR(36)     NULL,
    user_id     VARCHAR(36)     NULL,
    channel     VARCHAR(20)  NOT NULL,
    recipient   VARCHAR(190) NOT NULL,
    template    VARCHAR(60)  NOT NULL,
    subject     VARCHAR(200) NULL,
    body        TEXT         NOT NULL,
    status      VARCHAR(20)  NOT NULL,
    created_at  DATETIME(6)  NOT NULL,
    CONSTRAINT pk_notification_records PRIMARY KEY (id),
    CONSTRAINT fk_notifications_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users (id),
    CONSTRAINT ck_notifications_channel CHECK (channel IN ('EMAIL','WHATSAPP','IN_APP')),
    CONSTRAINT ck_notifications_status CHECK (status IN ('SENT','LOGGED','FAILED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_notifications_company ON notification_records (company_id, created_at);

CREATE TABLE export_jobs (
    id                    VARCHAR(36)    NOT NULL,
    company_id            VARCHAR(36)    NOT NULL,
    requested_by_user_id  VARCHAR(36)    NOT NULL,
    report_type           VARCHAR(30) NOT NULL,
    format                VARCHAR(10) NOT NULL,
    row_count             INT         NOT NULL,
    status                VARCHAR(20) NOT NULL,
    created_at            DATETIME(6) NOT NULL,
    CONSTRAINT pk_export_jobs PRIMARY KEY (id),
    CONSTRAINT fk_exports_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT fk_exports_user FOREIGN KEY (requested_by_user_id) REFERENCES users (id),
    CONSTRAINT ck_exports_format CHECK (format IN ('CSV','XLSX')),
    CONSTRAINT ck_exports_status CHECK (status IN ('COMPLETED','FAILED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_exports_company ON export_jobs (company_id, created_at);

-- Non-secret integration flags only. Secrets (API keys, tokens) come from environment variables.
CREATE TABLE integration_settings (
    id               VARCHAR(36)    NOT NULL,
    company_id       VARCHAR(36)    NOT NULL,
    integration_key  VARCHAR(60) NOT NULL,
    enabled          BOOLEAN     NOT NULL DEFAULT FALSE,
    config_json      TEXT        NULL,
    created_at       DATETIME(6) NOT NULL,
    updated_at       DATETIME(6) NOT NULL,
    CONSTRAINT pk_integration_settings PRIMARY KEY (id),
    CONSTRAINT fk_integrations_company FOREIGN KEY (company_id) REFERENCES companies (id),
    CONSTRAINT uq_integrations_company_key UNIQUE (company_id, integration_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE contact_requests (
    id            VARCHAR(36)      NOT NULL,
    full_name     VARCHAR(120)  NOT NULL,
    email         VARCHAR(190)  NOT NULL,
    company_name  VARCHAR(160)  NULL,
    phone         VARCHAR(20)   NULL,
    team_size     VARCHAR(20)   NULL,
    topic         VARCHAR(40)   NOT NULL,
    message       VARCHAR(2000) NOT NULL,
    status        VARCHAR(20)   NOT NULL,
    created_at    DATETIME(6)   NOT NULL,
    CONSTRAINT pk_contact_requests PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE INDEX ix_contact_created ON contact_requests (created_at);
