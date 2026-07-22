CREATE TABLE IF NOT EXISTS `program_tracks` (
  `id` text PRIMARY KEY NOT NULL,
  `program_id` text NOT NULL,
  `name` text NOT NULL,
  `sort_order` integer NOT NULL DEFAULT 0,
  `active` integer NOT NULL DEFAULT 1,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  FOREIGN KEY (`program_id`) REFERENCES `programs`(`id`) ON UPDATE no action ON DELETE cascade
);
CREATE UNIQUE INDEX IF NOT EXISTS `program_tracks_program_name_uq` ON `program_tracks` (`program_id`,`name`);
INSERT OR IGNORE INTO `program_tracks` (`id`,`program_id`,`name`,`sort_order`,`active`,`created_at`,`updated_at`) VALUES
 ('TRK-ABA-ABAT','PRG-ABA','ABAT',1,1,datetime('now'),datetime('now')),
 ('TRK-ABA-QBA','PRG-ABA','QBA',2,1,datetime('now'),datetime('now')),
 ('TRK-ABA-QASPS','PRG-ABA','QASP-S',3,1,datetime('now'),datetime('now')),
 ('TRK-OBM-P','PRG-OBM','P',1,1,datetime('now'),datetime('now')),
 ('TRK-OBM-E','PRG-OBM','E',2,1,datetime('now'),datetime('now')),
 ('TRK-OBM-C','PRG-OBM','C',3,1,datetime('now'),datetime('now'));
