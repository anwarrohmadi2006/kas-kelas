-- Seed bills for all active students across existing periods (default nominal from periods)
INSERT INTO bills (student_id, period_id, nominal, status)
SELECT s.id, p.id, p.nominal, 'unpaid'
FROM students s
JOIN periods p ON 1=1
WHERE s.status = 'active'
ON CONFLICT (student_id, period_id) DO NOTHING;
