-- Fix payment confirmations table schema to match API expectations
DROP TABLE IF EXISTS payment_confirmations;

-- Create payment confirmations table with correct field names matching the API
CREATE TABLE payment_confirmations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    nim VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    weeks INTEGER NOT NULL CHECK (weeks > 0),
    unique_code INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    method VARCHAR(20) DEFAULT 'qris' CHECK (method IN ('qris', 'cash')),
    payment_proof_url TEXT,
    wa_sent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_payment_confirmations_nim ON payment_confirmations(nim);
CREATE INDEX idx_payment_confirmations_status ON payment_confirmations(status);
CREATE INDEX idx_payment_confirmations_created_at ON payment_confirmations(created_at);

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_confirmations_updated_at 
    BEFORE UPDATE ON payment_confirmations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
