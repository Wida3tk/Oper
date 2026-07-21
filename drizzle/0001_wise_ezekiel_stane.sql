CREATE TABLE `enrollments` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`program_id` text NOT NULL,
	`order_id` text NOT NULL,
	`source_reservation_id` text,
	`status` text DEFAULT 'جديد' NOT NULL,
	`owner_email` text,
	`account_created_at` text,
	`assigned_at` text,
	`access_verified_at` text,
	`started_at` text,
	`completed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_reservation_id`) REFERENCES `seat_reservations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `enrollments_customer_idx` ON `enrollments` (`customer_id`);--> statement-breakpoint
CREATE INDEX `enrollments_status_idx` ON `enrollments` (`status`);--> statement-breakpoint
CREATE TABLE `payment_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text NOT NULL,
	`status` text DEFAULT 'بانتظار المالية' NOT NULL,
	`reviewed_by_finance_email` text,
	`reviewed_at` text,
	`rejection_reason` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `payment_reviews_payment_uq` ON `payment_reviews` (`payment_id`);--> statement-breakpoint
CREATE TABLE `program_trials` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`program_id` text NOT NULL,
	`status` text DEFAULT 'فعالة' NOT NULL,
	`starts_at` text NOT NULL,
	`ends_at` text NOT NULL,
	`granted_by_sales_email` text NOT NULL,
	`converted_order_id` text,
	`outcome` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `program_trials_customer_idx` ON `program_trials` (`customer_id`);--> statement-breakpoint
CREATE INDEX `program_trials_status_idx` ON `program_trials` (`status`);--> statement-breakpoint
CREATE TABLE `programs` (
	`id` text PRIMARY KEY NOT NULL,
	`code` text NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT 'برنامج' NOT NULL,
	`default_trial_days` integer DEFAULT 0 NOT NULL,
	`seat_reservation_fee` real,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `programs_code_uq` ON `programs` (`code`);--> statement-breakpoint
CREATE TABLE `prospects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text NOT NULL,
	`intended_program_id` text,
	`status` text DEFAULT 'بانتظار الدفع' NOT NULL,
	`created_by_email` text NOT NULL,
	`converted_customer_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`intended_program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `prospects_phone_idx` ON `prospects` (`phone`);--> statement-breakpoint
CREATE INDEX `prospects_email_idx` ON `prospects` (`email`);--> statement-breakpoint
CREATE TABLE `reservation_transfers` (
	`id` text PRIMARY KEY NOT NULL,
	`from_reservation_id` text NOT NULL,
	`to_reservation_id` text,
	`status` text DEFAULT 'بانتظار المالية' NOT NULL,
	`requested_by_email` text NOT NULL,
	`requested_at` text NOT NULL,
	`reviewed_by_finance_email` text,
	`reviewed_at` text,
	`financial_decision` text,
	`notes` text,
	FOREIGN KEY (`from_reservation_id`) REFERENCES `seat_reservations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`to_reservation_id`) REFERENCES `seat_reservations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `reservation_transfers_from_idx` ON `reservation_transfers` (`from_reservation_id`);--> statement-breakpoint
CREATE INDEX `reservation_transfers_status_idx` ON `reservation_transfers` (`status`);--> statement-breakpoint
CREATE TABLE `seat_reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`customer_id` text NOT NULL,
	`program_id` text NOT NULL,
	`order_id` text NOT NULL,
	`fee_amount` real NOT NULL,
	`status` text DEFAULT 'بانتظار الدفع' NOT NULL,
	`cohort_label` text,
	`converted_enrollment_id` text,
	`confirmed_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `seat_reservations_customer_idx` ON `seat_reservations` (`customer_id`);--> statement-breakpoint
CREATE INDEX `seat_reservations_status_idx` ON `seat_reservations` (`status`);--> statement-breakpoint
CREATE TABLE `workflow_tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`department` text NOT NULL,
	`title` text NOT NULL,
	`status` text DEFAULT 'مفتوحة' NOT NULL,
	`priority` text DEFAULT 'عادية' NOT NULL,
	`assignee_email` text,
	`due_at` text,
	`created_by_email` text NOT NULL,
	`created_at` text NOT NULL,
	`completed_at` text
);
--> statement-breakpoint
CREATE INDEX `workflow_tasks_entity_idx` ON `workflow_tasks` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `workflow_tasks_assignee_idx` ON `workflow_tasks` (`assignee_email`,`status`);--> statement-breakpoint
ALTER TABLE `customers` ADD `admitted_via` text;--> statement-breakpoint
ALTER TABLE `customers` ADD `admission_source_id` text;--> statement-breakpoint
ALTER TABLE `orders` ADD `order_type` text DEFAULT 'برنامج' NOT NULL;--> statement-breakpoint
ALTER TABLE `orders` ADD `program_id` text REFERENCES programs(id);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `orders_customer_idx` ON `orders` (`customer_id`);--> statement-breakpoint
CREATE INDEX `orders_program_id_idx` ON `orders` (`program_id`);--> statement-breakpoint
ALTER TABLE `payments` ADD `proof_asset_key` text;--> statement-breakpoint
CREATE INDEX `payments_order_idx` ON `payments` (`order_id`);--> statement-breakpoint
CREATE INDEX `payments_status_idx` ON `payments` (`status`);--> statement-breakpoint
CREATE INDEX `audit_log_entity_idx` ON `audit_log` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_log_created_idx` ON `audit_log` (`created_at`);
--> statement-breakpoint
INSERT OR IGNORE INTO `programs` (`id`,`code`,`name`,`category`,`default_trial_days`,`active`,`created_at`,`updated_at`) VALUES
('PRG-ABA','ABA','تحليل السلوك التطبيقي','برنامج',0,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('PRG-OBM','OBM','إدارة السلوك التنظيمي','برنامج',0,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('PRG-BE','BE','الاقتصاد السلوكي','برنامج',0,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('PRG-CE','CE','التعليم المستمر','برنامج',0,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP),
('PRG-COMP','COMPETENCY','تقييم الكفاءة','برنامج',0,true,CURRENT_TIMESTAMP,CURRENT_TIMESTAMP);
--> statement-breakpoint
UPDATE `orders` SET `program_id`='PRG-ABA' WHERE `program`='تحليل السلوك التطبيقي' AND `program_id` IS NULL;
--> statement-breakpoint
UPDATE `orders` SET `program_id`='PRG-OBM' WHERE `program`='إدارة السلوك التنظيمي' AND `program_id` IS NULL;
--> statement-breakpoint
UPDATE `orders` SET `program_id`='PRG-BE' WHERE `program`='الاقتصاد السلوكي' AND `program_id` IS NULL;
--> statement-breakpoint
UPDATE `orders` SET `program_id`='PRG-CE' WHERE `program`='التعليم المستمر' AND `program_id` IS NULL;
