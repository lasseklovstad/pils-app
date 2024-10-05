CREATE TABLE `ingredients` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`time` integer,
	`batch_id` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `batches` ADD `mashing_temperature` integer;--> statement-breakpoint
ALTER TABLE `batches` ADD `mashing_strike_water_volume` integer DEFAULT 20;--> statement-breakpoint
ALTER TABLE `batches` ADD `mashing_malt_temperature` integer DEFAULT 18;--> statement-breakpoint
ALTER TABLE `batches` ADD `original_gravity` integer;--> statement-breakpoint
ALTER TABLE `batches` ADD `final_gravity` integer;