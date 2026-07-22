CREATE TABLE IF NOT EXISTS `installments` (
  `id` text PRIMARY KEY NOT NULL,
  `order_id` text NOT NULL,
  `sequence` integer NOT NULL,
  `amount_cents` integer NOT NULL,
  `due_date` text NOT NULL,
  `status` text NOT NULL DEFAULT 'قادم',
  `paid_payment_id` text,
  `paid_at` text,
  `reference` text,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade,
  FOREIGN KEY (`paid_payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE set null
);
CREATE UNIQUE INDEX IF NOT EXISTS `installments_order_sequence_uq` ON `installments` (`order_id`,`sequence`);
CREATE INDEX IF NOT EXISTS `installments_due_status_idx` ON `installments` (`due_date`,`status`);

CREATE TABLE IF NOT EXISTS `finance_notes` (
  `order_id` text PRIMARY KEY NOT NULL,
  `note` text NOT NULL DEFAULT '',
  `updated_by_email` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE cascade
);
