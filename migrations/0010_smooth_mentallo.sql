ALTER TABLE `controller_temperatures` ADD `batch_id` integer REFERENCES batches(id);