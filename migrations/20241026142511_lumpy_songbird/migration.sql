CREATE TABLE `batch_files` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`type` text NOT NULL,
	`batch_id` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE no action
);
