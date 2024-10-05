CREATE TABLE `batches` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_timestamp` integer DEFAULT (unixepoch()) NOT NULL
);
