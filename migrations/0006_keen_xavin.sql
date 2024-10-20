PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_controller_temperatures` (
	`id` integer PRIMARY KEY NOT NULL,
	`controller_id` integer NOT NULL,
	`temperature` real NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`controller_id`) REFERENCES `controllers`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_controller_temperatures`("id", "controller_id", "temperature", "timestamp") SELECT "id", "controller_id", "temperature", "timestamp" FROM `controller_temperatures`;--> statement-breakpoint
DROP TABLE `controller_temperatures`;--> statement-breakpoint
ALTER TABLE `__new_controller_temperatures` RENAME TO `controller_temperatures`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_ingredients` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`amount` real NOT NULL,
	`type` text NOT NULL,
	`time` integer,
	`batch_id` integer NOT NULL,
	FOREIGN KEY (`batch_id`) REFERENCES `batches`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_ingredients`("id", "name", "amount", "type", "time", "batch_id") SELECT "id", "name", "amount", "type", "time", "batch_id" FROM `ingredients`;--> statement-breakpoint
DROP TABLE `ingredients`;--> statement-breakpoint
ALTER TABLE `__new_ingredients` RENAME TO `ingredients`;--> statement-breakpoint
CREATE TABLE `__new_passwords` (
	`hash` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_passwords`("hash", "user_id") SELECT "hash", "user_id" FROM `passwords`;--> statement-breakpoint
DROP TABLE `passwords`;--> statement-breakpoint
ALTER TABLE `__new_passwords` RENAME TO `passwords`;--> statement-breakpoint
CREATE UNIQUE INDEX `passwords_userId_unique` ON `passwords` (`user_id`);--> statement-breakpoint
CREATE TABLE `__new_sessions` (
	`id` text PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`expiration_date` integer NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_sessions`("id", "created_at", "updated_at", "expiration_date", "user_id") SELECT "id", "created_at", "updated_at", "expiration_date", "user_id" FROM `sessions`;--> statement-breakpoint
DROP TABLE `sessions`;--> statement-breakpoint
ALTER TABLE `__new_sessions` RENAME TO `sessions`;--> statement-breakpoint
DELETE FROM `batches`;--> statement-breakpoint
DELETE FROM `controllers`;--> statement-breakpoint
DELETE FROM `verifications`;--> statement-breakpoint
ALTER TABLE `batches` ADD `user_id` text NOT NULL REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `controllers` ADD `user_id` text NOT NULL REFERENCES users(id);