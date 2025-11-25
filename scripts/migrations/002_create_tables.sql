-- Core tables for Kelas Kas Payment System
-- Assumes enums from 001_create_enums.sql already exist

CREATE TABLE admin_users (
  id            BIGSERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role          VARCHAR(32) NOT NULL DEFAULT 'admin',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE students (
  id            BIGSERIAL PRIMARY KEY,
  nim           VARCHAR(32) UNIQUE NOT NULL,
  nama          VARCHAR(255) NOT NULL,
  kelas         VARCHAR(64),
  angkatan      VARCHAR(16),
  status        student_status NOT NULL DEFAULT 'active',
  email         VARCHAR(255),
  whatsapp      VARCHAR(32),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE periods (
  id              BIGSERIAL PRIMARY KEY,
  kode_periode    VARCHAR(32) UNIQUE NOT NULL,
  nama_periode    VARCHAR(64) NOT NULL,
  tanggal_mulai   DATE NOT NULL,
  tanggal_selesai DATE NOT NULL,
  nominal         INTEGER NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE bills (
  id          BIGSERIAL PRIMARY KEY,
  student_id  BIGINT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  period_id   BIGINT NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
  nominal     INTEGER NOT NULL,
  status      bill_status NOT NULL DEFAULT 'unpaid',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (student_id, period_id)
);

CREATE TABLE payments (
  id             BIGSERIAL PRIMARY KEY,
  student_id     BIGINT NOT NULL REFERENCES students(id) ON DELETE RESTRICT,
  metode         payment_method NOT NULL,
  tanggal_bayar  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_bayar    INTEGER NOT NULL,
  bukti_url      TEXT,
  status         payment_status NOT NULL DEFAULT 'pending',
  verified_by    BIGINT REFERENCES admin_users(id),
  catatan_admin  TEXT,
  raw_payload    JSONB,
  idempotency_key VARCHAR(64),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (idempotency_key)
);

CREATE TABLE payment_periods (
  id           BIGSERIAL PRIMARY KEY,
  payment_id   BIGINT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
  period_id    BIGINT NOT NULL REFERENCES periods(id) ON DELETE RESTRICT,
  nominal      INTEGER NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payment_id, period_id)
);

CREATE TABLE cash_flows (
  id             BIGSERIAL PRIMARY KEY,
  jenis          cash_flow_kind NOT NULL,
  sumber         cash_source NOT NULL,
  tanggal        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  amount         INTEGER NOT NULL,
  keterangan     TEXT,
  ref_payment_id BIGINT REFERENCES payments(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE app_settings (
  id         BIGSERIAL PRIMARY KEY,
  key        TEXT UNIQUE NOT NULL,
  value      JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to update updated_at on change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_periods_updated_at BEFORE UPDATE ON periods FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_bills_updated_at BEFORE UPDATE ON bills FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payment_periods_updated_at BEFORE UPDATE ON payment_periods FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_cash_flows_updated_at BEFORE UPDATE ON cash_flows FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_app_settings_updated_at BEFORE UPDATE ON app_settings FOR EACH ROW EXECUTE FUNCTION set_updated_at();
