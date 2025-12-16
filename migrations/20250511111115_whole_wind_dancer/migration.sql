ALTER TABLE `controllers` ADD `hysteresis` real DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `controllers` ADD `min_delay_in_seconds` integer DEFAULT 30 NOT NULL;--> statement-breakpoint
ALTER TABLE `controllers` ADD `avg_temperature_buffer_size` integer DEFAULT 5 NOT NULL;