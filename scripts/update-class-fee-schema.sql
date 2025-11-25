-- Updating database schema to match API expectations
-- Drop existing table if it exists
DROP TABLE IF EXISTS payment_confirmations;

-- Create payment confirmations table with correct field names
CREATE TABLE payment_confirmations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    nim VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    weeks INTEGER NOT NULL CHECK (weeks > 0),
    unique_code INTEGER NOT NULL,
    total_amount INTEGER NOT NULL,
    payment_proof_url TEXT,
    wa_sent BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_payment_confirmations_nim ON payment_confirmations(nim);
CREATE INDEX idx_payment_confirmations_status ON payment_confirmations(status);
CREATE INDEX idx_payment_confirmations_created_at ON payment_confirmations(created_at);
