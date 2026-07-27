ALTER TABLE `seat_reservations` ADD COLUMN `assignment_date` text;
CREATE UNIQUE INDEX IF NOT EXISTS `enrollments_source_reservation_uq`
ON `enrollments` (`source_reservation_id`)
WHERE `source_reservation_id` IS NOT NULL;
