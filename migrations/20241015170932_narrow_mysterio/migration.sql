CREATE TABLE `verifications` (
	`id` integer PRIMARY KEY NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`secret` text NOT NULL,
	`type` text NOT NULL,
	`target` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `verifications_type_target_unique` ON `verifications` (`type`,`target`);--> statement-breakpoint
ALTER TABLE `controllers` DROP COLUMN `hashed_secret`;