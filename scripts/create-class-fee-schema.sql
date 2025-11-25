-- Creating proper database schema for class fee payment confirmations
-- Drop existing table if it exists
DROP TABLE IF EXISTS payment_confirmations;

-- Create payment confirmations table
CREATE TABLE payment_confirmations (
    id SERIAL PRIMARY KEY,
    nama VARCHAR(255) NOT NULL,
    nim VARCHAR(20) NOT NULL,
    weeks INTEGER NOT NULL CHECK (weeks > 0),
    unique_code INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    payment_proof_url TEXT,
    whatsapp_message TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_payment_confirmations_nim ON payment_confirmations(nim);
CREATE INDEX idx_payment_confirmations_status ON payment_confirmations(status);
CREATE INDEX idx_payment_confirmations_created_at ON payment_confirmations(created_at);

-- Add some sample data for testing
INSERT INTO payment_confirmations (nama, nim, weeks, unique_code, total_amount, status) VALUES
('Test Student', '257411001', 1, 1, 10001, 'pending'),
('Another Student', '247411002', 2, 2, 20002, 'confirmed');
