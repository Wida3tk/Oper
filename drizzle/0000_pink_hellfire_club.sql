CREATE TABLE `audit_log` (
	`id` text PRIMARY KEY NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`details` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`customer_type` text DEFAULT 'مسجل' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `customers_phone_uq` ON `customers` (`phone`);--> statement-breakpoint
CREATE UNIQUE INDEX `customers_email_uq` ON `customers` (`email`);--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`program` text NOT NULL,
	`track` text NOT NULL,
	`delivery` text NOT NULL,
	`language` text NOT NULL,
	`purchase_source` text NOT NULL,
	`payment_plan` text NOT NULL,
	`total` real DEFAULT 0 NOT NULL,
	`paid` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'جديد' NOT NULL,
	`academy_status` text NOT NULL,
	`owner` text DEFAULT 'غير مسند' NOT NULL,
	`competency` integer DEFAULT false NOT NULL,
	`seat_reservation` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`amount` real NOT NULL,
	`due_date` text,
	`paid_at` text,
	`status` text NOT NULL,
	`method` text,
	`reference` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`department` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'مفتوحة' NOT NULL,
	`assignee` text,
	`due_at` text,
	`created_at` text NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
