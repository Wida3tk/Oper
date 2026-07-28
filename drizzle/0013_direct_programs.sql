ALTER TABLE programs ADD COLUMN program_kind TEXT NOT NULL DEFAULT 'شهادة';
ALTER TABLE seat_reservations ADD COLUMN reservation_kind TEXT NOT NULL DEFAULT 'حجز مقعد';

UPDATE programs
SET program_kind = CASE
  WHEN name LIKE '%تحليل السلوك التطبيقي%' THEN 'شهادة'
  ELSE 'برنامج مباشر'
END;

CREATE INDEX IF NOT EXISTS programs_kind_idx ON programs(program_kind);
CREATE INDEX IF NOT EXISTS seat_reservations_kind_idx ON seat_reservations(reservation_kind);
