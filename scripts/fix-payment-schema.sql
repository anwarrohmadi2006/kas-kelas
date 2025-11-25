-- Add missing columns and fix schema for class fee payment confirmations
ALTER TABLE payment_confirmations 
ADD COLUMN IF NOT EXISTS email VARCHAR(255),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Update any existing records to ensure consistency
UPDATE payment_confirmations SET status = 'pending' WHERE status IS NULL;
