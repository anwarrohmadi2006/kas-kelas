-- Create payment_confirmations table in Neon database
CREATE TABLE IF NOT EXISTS payment_confirmations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  nim text NOT NULL,
  phone text,
  role text NOT NULL CHECK (role IN ('mahasiswa_baru', 'panitia', 'volunteer')),
  angkatan integer NOT NULL,
  unique_code integer NOT NULL,
  base_fee integer NOT NULL,
  total_amount integer NOT NULL,
  payment_proof_url text,
  wa_sent boolean DEFAULT false,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_status ON payment_confirmations(status);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_created_at ON payment_confirmations(created_at);
CREATE INDEX IF NOT EXISTS idx_payment_confirmations_nim ON payment_confirmations(nim);
