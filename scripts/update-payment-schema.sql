-- Updated schema for weeks-based system with better security
ALTER TABLE payment_confirmations 
DROP COLUMN IF EXISTS role,
DROP COLUMN IF EXISTS angkatan,
DROP COLUMN IF EXISTS base_fee;

ALTER TABLE payment_confirmations 
ADD COLUMN IF NOT EXISTS weeks INTEGER NOT NULL DEFAULT 1;

-- Add indexes for better performance and security
CREATE INDEX IF NOT EXISTS idx_payment_nim ON payment_confirmations(nim);
CREATE INDEX IF NOT EXISTS idx_payment_status ON payment_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_payment_created ON payment_confirmations(created_at);

-- Add constraints for data integrity
ALTER TABLE payment_confirmations 
ADD CONSTRAINT IF NOT EXISTS chk_weeks_positive CHECK (weeks > 0 AND weeks <= 52),
ADD CONSTRAINT IF NOT EXISTS chk_unique_code_range CHECK (unique_code >= 0 AND unique_code <= 99),
ADD CONSTRAINT IF NOT EXISTS chk_total_amount_positive CHECK (total_amount > 0);
