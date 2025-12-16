PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_verifications` (
	`id` integer PRIMARY KEY,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expires_at` integer,
	`secret` text NOT NULL,
	`type` text NOT NULL,
	`target` text NOT NULL,
	CONSTRAINT `verifications_type_target_unique` UNIQUE(`type`,`target`)
);
--> statement-breakpoint
INSERT INTO `__new_verifications`(`id`, `created_at`, `expires_at`, `secret`, `type`, `target`) SELECT `id`, `created_at`, `expires_at`, `secret`, `type`, `target` FROM `verifications`;--> statement-breakpoint
DROP TABLE `verifications`;--> statement-breakpoint
ALTER TABLE `__new_verifications` RENAME TO `verifications`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_passwords` (
	`hash` text NOT NULL,
	`user_id` text NOT NULL UNIQUE,
	CONSTRAINT `fk_passwords_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_passwords`(`hash`, `user_id`) SELECT `hash`, `user_id` FROM `passwords`;--> statement-breakpoint
DROP TABLE `passwords`;--> statement-breakpoint
ALTER TABLE `__new_passwords` RENAME TO `passwords`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY,
	`email` text NOT NULL UNIQUE,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_users`(`id`, `email`, `created_at`, `name`, `role`) SELECT `id`, `email`, `created_at`, `name`, `role` FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_batch_files` (
	`id` text PRIMARY KEY,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`type` text NOT NULL,
	`batch_id` integer NOT NULL,
	`is_deleted` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `fk_batch_files_batch_id_batches_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_batch_files`(`id`, `created_at`, `type`, `batch_id`, `is_deleted`) SELECT `id`, `created_at`, `type`, `batch_id`, `is_deleted` FROM `batch_files`;--> statement-breakpoint
DROP TABLE `batch_files`;--> statement-breakpoint
ALTER TABLE `__new_batch_files` RENAME TO `batch_files`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_batch_temperatures` (
	`id` integer PRIMARY KEY,
	`day_index` real NOT NULL,
	`temperature` real NOT NULL,
	`batch_id` integer NOT NULL,
	CONSTRAINT `fk_batch_temperatures_batch_id_batches_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_batch_temperatures`(`id`, `day_index`, `temperature`, `batch_id`) SELECT `id`, `day_index`, `temperature`, `batch_id` FROM `batch_temperatures`;--> statement-breakpoint
DROP TABLE `batch_temperatures`;--> statement-breakpoint
ALTER TABLE `__new_batch_temperatures` RENAME TO `batch_temperatures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_batches` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`mashing_temperature` integer,
	`mashing_strike_water_volume` integer DEFAULT 20,
	`mashing_malt_temperature` integer DEFAULT 18,
	`original_gravity` integer,
	`final_gravity` integer,
	`created_timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`user_id` text NOT NULL,
	`preview_file_id` text,
	`controller_id` integer,
	`mode` text,
	`controller_status` text DEFAULT 'inactive' NOT NULL,
	`fermentation_start_date` integer,
	CONSTRAINT `fk_batches_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_batches_preview_file_id_batch_files_id_fk` FOREIGN KEY (`preview_file_id`) REFERENCES `batch_files`(`id`) ON DELETE set null,
	CONSTRAINT `fk_batches_controller_id_controllers_id_fk` FOREIGN KEY (`controller_id`) REFERENCES `controllers`(`id`) ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_batches`(`id`, `name`, `mashing_temperature`, `mashing_strike_water_volume`, `mashing_malt_temperature`, `original_gravity`, `final_gravity`, `created_timestamp`, `user_id`, `preview_file_id`, `controller_id`, `mode`, `controller_status`, `fermentation_start_date`) SELECT `id`, `name`, `mashing_temperature`, `mashing_strike_water_volume`, `mashing_malt_temperature`, `original_gravity`, `final_gravity`, `created_timestamp`, `user_id`, `preview_file_id`, `controller_id`, `mode`, `controller_status`, `fermentation_start_date` FROM `batches`;--> statement-breakpoint
DROP TABLE `batches`;--> statement-breakpoint
ALTER TABLE `__new_batches` RENAME TO `batches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_controller_temperatures` (
	`id` integer PRIMARY KEY,
	`controller_id` integer NOT NULL,
	`temperature` real NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	`batch_id` integer,
	CONSTRAINT `fk_controller_temperatures_controller_id_controllers_id_fk` FOREIGN KEY (`controller_id`) REFERENCES `controllers`(`id`) ON DELETE cascade,
	CONSTRAINT `fk_controller_temperatures_batch_id_batches_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_controller_temperatures`(`id`, `controller_id`, `temperature`, `timestamp`, `batch_id`) SELECT `id`, `controller_id`, `temperature`, `timestamp`, `batch_id` FROM `controller_temperatures`;--> statement-breakpoint
DROP TABLE `controller_temperatures`;--> statement-breakpoint
ALTER TABLE `__new_controller_temperatures` RENAME TO `controller_temperatures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_controllers` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`is_relay_on` integer DEFAULT 0 NOT NULL,
	`hysteresis` real DEFAULT 0 NOT NULL,
	`min_delay_in_seconds` integer DEFAULT 30 NOT NULL,
	`avg_temperature_buffer_size` integer DEFAULT 5 NOT NULL,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_controllers_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_controllers`(`id`, `name`, `is_relay_on`, `hysteresis`, `min_delay_in_seconds`, `avg_temperature_buffer_size`, `user_id`) SELECT `id`, `name`, `is_relay_on`, `hysteresis`, `min_delay_in_seconds`, `avg_temperature_buffer_size`, `user_id` FROM `controllers`;--> statement-breakpoint
DROP TABLE `controllers`;--> statement-breakpoint
ALTER TABLE `__new_controllers` RENAME TO `controllers`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_ingredients` (
	`id` integer PRIMARY KEY,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`time` integer,
	`batch_id` integer NOT NULL,
	CONSTRAINT `fk_ingredients_batch_id_batches_id_fk` FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_ingredients`(`id`, `name`, `amount`, `type`, `time`, `batch_id`) SELECT `id`, `name`, `amount`, `type`, `time`, `batch_id` FROM `ingredients`;--> statement-breakpoint
DROP TABLE `ingredients`;--> statement-breakpoint
ALTER TABLE `__new_ingredients` RENAME TO `ingredients`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expiration_date` integer NOT NULL,
	`user_id` text NOT NULL,
	CONSTRAINT `fk_sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions`(`id`, `created_at`, `updated_at`, `expiration_date`, `user_id`) SELECT `id`, `created_at`, `updated_at`, `expiration_date`, `user_id` FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
DROP INDEX IF EXISTS `passwords_userId_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `users_email_unique`;--> statement-breakpoint
DROP INDEX IF EXISTS `verifications_type_target_unique`;