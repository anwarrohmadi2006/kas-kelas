-- Create payment_confirmations table for storing class fee payments
-- This table stores student payment confirmations and proof uploads

CREATE TABLE IF NOT EXISTS payment_confirmations (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    nim VARCHAR(20) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    weeks INTEGER NOT NULL CHECK (weeks >= 1 AND weeks <= 52),
    unique_code INTEGER NOT NULL,
    total_amount INTEGER NOT NULL CHECK (total_amount > 0),
    method VARCHAR(20) DEFAULT 'qris' CHECK (method IN ('qris', 'cash')),
    payment_proof_url TEXT,
    whatsapp_message VARCHAR(50) DEFAULT 'Not sent',
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_nim ON payment_confirmations(nim);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_email ON payment_confirmations(email);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status ON payment_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_created_at ON payment_confirmations(created_at);

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_confirmations_updated_at 
    BEFORE UPDATE ON payment_confirmations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Add some sample data for testing (optional)
-- INSERT INTO payment_confirmations (nama, email, nim, phone, weeks, unique_code, total_amount, status)
-- VALUES ('Test Student', 'test@example.com', '2301001', '628123456789', 4, 123, 50123, 'pending');
