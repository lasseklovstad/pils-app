CREATE TABLE `controller_temperatures` (
	`id` integer PRIMARY KEY NOT NULL,
	`controller_id` integer NOT NULL,
	`temperature` real NOT NULL,
	`timestamp` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`controller_id`) REFERENCES `controllers`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `controllers` (
	`id` integer PRIMARY KEY NOT NULL,
	`hashed_secret` text NOT NULL,
	`name` text NOT NULL
);
