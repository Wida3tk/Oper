CREATE TABLE `payment_intents` (
	`id` text PRIMARY KEY NOT NULL,
	`prospect_id` text NOT NULL,
	`program_id` text NOT NULL,
	`purchase_type` text DEFAULT 'برنامج' NOT NULL,
	`amount` real NOT NULL,
	`method` text NOT NULL,
	`reference` text,
	`proof_asset_key` text,
	`status` text DEFAULT 'بانتظار المالية' NOT NULL,
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
CREATE INDEX `payment_intents_prospect_idx` ON `payment_intents` (`prospect_id`);--> statement-breakpoint
CREATE INDEX `payment_intents_status_idx` ON `payment_intents` (`status`);--> statement-breakpoint
CREATE TABLE `staff_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`granted_by_email` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `staff_roles_email_role_uq` ON `staff_roles` (`email`,`role`);--> statement-breakpoint
CREATE INDEX `staff_roles_email_idx` ON `staff_roles` (`email`);