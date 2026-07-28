CREATE TABLE IF NOT EXISTS `staff_accounts` (
  `email` text PRIMARY KEY NOT NULL,
  `password_hash` text NOT NULL,
  `password_salt` text NOT NULL,
  `permissions` text NOT NULL DEFAULT '[]',
  `active` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE TABLE IF NOT EXISTS `staff_sessions` (
  `id` text PRIMARY KEY NOT NULL,
  `email` text NOT NULL,
  `token_hash` text NOT NULL,
  `expires_at` text NOT NULL,
  `created_at` text NOT NULL,
  FOREIGN KEY (`email`) REFERENCES `staff_accounts`(`email`) ON UPDATE cascade ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS `staff_sessions_token_uq` ON `staff_sessions` (`token_hash`);
CREATE INDEX IF NOT EXISTS `staff_sessions_email_idx` ON `staff_sessions` (`email`);
