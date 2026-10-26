-- Audit events are append-only. The application never updates or deletes them, and these
-- triggers make the database reject such statements as well (defence in depth on top of the
-- per-company SHA-256 hash chain kept in prev_hash/hash).
--
-- Note: on a MySQL server with binary logging enabled, creating triggers requires either the
-- SUPER/SYSTEM_VARIABLES_ADMIN privilege or log_bin_trust_function_creators=1. The provided
-- docker-compose.yml enables the latter.

CREATE TRIGGER trg_audit_events_no_update
    BEFORE UPDATE ON audit_events
    FOR EACH ROW
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'audit_events is append-only';

CREATE TRIGGER trg_audit_events_no_delete
    BEFORE DELETE ON audit_events
    FOR EACH ROW
    SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'audit_events is append-only';
