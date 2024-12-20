PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_batch_temperatures` (
	`id` integer PRIMARY KEY NOT NULL,
	`day_index` real NOT NULL,
	`temperature` real NOT NULL,
	`batch_id` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_batch_temperatures`("id", "day_index", "temperature", "batch_id") SELECT "id", "day_index", "temperature", "batch_id" FROM `batch_temperatures`;--> statement-breakpoint
DROP TABLE `batch_temperatures`;--> statement-breakpoint
ALTER TABLE `__new_batch_temperatures` RENAME TO `batch_temperatures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;