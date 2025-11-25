-- Seed periods up to 2028 for selected months (Feb, Mar, Apr, Sep, Oct, Nov)
WITH months(year, month, nama) AS (
  VALUES
    (2024, 2, 'Februari'),
    (2024, 3, 'Maret'),
    (2024, 4, 'April'),
    (2024, 9, 'September'),
    (2024, 10, 'Oktober'),
    (2024, 11, 'November'),

    (2025, 2, 'Februari'),
    (2025, 3, 'Maret'),
    (2025, 4, 'April'),
    (2025, 9, 'September'),
    (2025, 10, 'Oktober'),
    (2025, 11, 'November'),

    (2026, 2, 'Februari'),
    (2026, 3, 'Maret'),
    (2026, 4, 'April'),
    (2026, 9, 'September'),
    (2026, 10, 'Oktober'),
    (2026, 11, 'November'),

    (2027, 2, 'Februari'),
    (2027, 3, 'Maret'),
    (2027, 4, 'April'),
    (2027, 9, 'September'),
    (2027, 10, 'Oktober'),
    (2027, 11, 'November'),

    (2028, 2, 'Februari'),
    (2028, 3, 'Maret'),
    (2028, 4, 'April'),
    (2028, 9, 'September'),
    (2028, 10, 'Oktober'),
    (2028, 11, 'November')
)
INSERT INTO periods (
  kode_periode,
  nama_periode,
  tanggal_mulai,
  tanggal_selesai,
  nominal,
  is_active
)
SELECT
  CONCAT(year, '-', LPAD(month::text, 2, '0')) AS kode_periode,
  CONCAT(nama, ' ', year) AS nama_periode,
  MAKE_DATE(year, month, 1) AS tanggal_mulai,
  (MAKE_DATE(year, month, 1) + INTERVAL '1 month - 1 day')::date AS tanggal_selesai,
  10000 AS nominal,
  TRUE AS is_active
ON CONFLICT (kode_periode) DO NOTHING;
