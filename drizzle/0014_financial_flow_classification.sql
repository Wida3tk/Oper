ALTER TABLE `payments` ADD COLUMN `flow_type` text NOT NULL DEFAULT 'sale';
ALTER TABLE `payments` ADD COLUMN `classification_status` text NOT NULL DEFAULT 'confirmed';
ALTER TABLE `orders` ADD COLUMN `finance_review_status` text NOT NULL DEFAULT 'not_required';
CREATE TABLE IF NOT EXISTS `monthly_sales_targets` (
  `month_key` text PRIMARY KEY NOT NULL,
  `target_amount` real NOT NULL DEFAULT 0,
  `updated_by_email` text NOT NULL,
  `updated_at` text NOT NULL
);
CREATE TABLE IF NOT EXISTS `system_migrations` (`key` text PRIMARY KEY NOT NULL, `applied_at` text NOT NULL);
