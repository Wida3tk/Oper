ALTER TABLE `staff_accounts` ADD COLUMN `display_name` text NOT NULL DEFAULT '';
UPDATE `staff_accounts` SET `display_name`='الإدارة' WHERE `email`='ro7e.entaa@gmail.com' AND `display_name`='';
