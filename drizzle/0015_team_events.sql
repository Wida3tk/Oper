CREATE TABLE IF NOT EXISTS `team_events` (
  `id` text PRIMARY KEY NOT NULL,
  `title` text NOT NULL,
  `event_date` text NOT NULL,
  `event_time` text,
  `details` text,
  `audience` text NOT NULL DEFAULT 'all',
  `created_by_email` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE INDEX IF NOT EXISTS `team_events_date_idx` ON `team_events` (`event_date`);
