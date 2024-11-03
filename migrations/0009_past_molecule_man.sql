CREATE TABLE `batch_temperatures` (
	`id` integer PRIMARY KEY NOT NULL,
	`day_index` integer NOT NULL,
	`temperature` real NOT NULL,
	`batch_id` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `batches` ADD `controller_id` integer REFERENCES controllers(id);--> statement-breakpoint
ALTER TABLE `batches` ADD `mode` text;--> statement-breakpoint
ALTER TABLE `batches` ADD `controller_status` text DEFAULT 'inactive' NOT NULL;--> statement-breakpoint
ALTER TABLE `batches` ADD `fermentation_start_date` integer;