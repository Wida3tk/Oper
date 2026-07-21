PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_payment_intents` (
	`id` text PRIMARY KEY NOT NULL,
	`prospect_id` text NOT NULL,
	`program_id` text NOT NULL,
	`purchase_type` text DEFAULT 'برنامج' NOT NULL,
	`amount` real NOT NULL,
	`method` text NOT NULL,
	`reference` text,
	`proof_asset_key` text,
	`status` text DEFAULT 'مسجلة' NOT NULL,
	`reviewed_by_finance_email` text,
	`reviewed_at` text,
	`rejection_reason` text,
	`resulting_customer_id` text,
	`resulting_order_id` text,
	`created_by_email` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`prospect_id`) REFERENCES `prospects`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resulting_customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`resulting_order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_payment_intents`("id", "prospect_id", "program_id", "purchase_type", "amount", "method", "reference", "proof_asset_key", "status", "reviewed_by_finance_email", "reviewed_at", "rejection_reason", "resulting_customer_id", "resulting_order_id", "created_by_email", "created_at", "updated_at") SELECT "id", "prospect_id", "program_id", "purchase_type", "amount", "method", "reference", "proof_asset_key", "status", "reviewed_by_finance_email", "reviewed_at", "rejection_reason", "resulting_customer_id", "resulting_order_id", "created_by_email", "created_at", "updated_at" FROM `payment_intents`;--> statement-breakpoint
DROP TABLE `payment_intents`;--> statement-breakpoint
ALTER TABLE `__new_payment_intents` RENAME TO `payment_intents`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `payment_intents_prospect_idx` ON `payment_intents` (`prospect_id`);--> statement-breakpoint
CREATE INDEX `payment_intents_status_idx` ON `payment_intents` (`status`);