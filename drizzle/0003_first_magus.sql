ALTER TABLE `reservation_transfers` ADD `target_program_id` text NOT NULL REFERENCES programs(id);--> statement-breakpoint
ALTER TABLE `reservation_transfers` ADD `target_cohort_label` text;