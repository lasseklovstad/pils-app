ALTER TABLE `batches` ADD `controller_id` text REFERENCES controllers(id);--> statement-breakpoint
ALTER TABLE `batches` ADD `mode` text;