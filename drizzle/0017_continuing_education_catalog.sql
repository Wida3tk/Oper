UPDATE programs
SET active = 0, updated_at = CURRENT_TIMESTAMP
WHERE name IN ('الاقتصاد السلوكي', 'انتقائية الطعام');

INSERT INTO program_tracks(id, program_id, name, sort_order, active, created_at, updated_at)
SELECT 'TRK-CE-BE', 'PRG-CE', 'الاقتصاد السلوكي', 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM program_tracks WHERE program_id = 'PRG-CE' AND name = 'الاقتصاد السلوكي'
);

INSERT INTO program_tracks(id, program_id, name, sort_order, active, created_at, updated_at)
SELECT 'TRK-CE-FOOD', 'PRG-CE', 'انتقائية الطعام', 2, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (
  SELECT 1 FROM program_tracks WHERE program_id = 'PRG-CE' AND name = 'انتقائية الطعام'
);
