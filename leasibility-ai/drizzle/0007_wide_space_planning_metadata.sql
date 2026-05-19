ALTER TABLE `scenarios` ADD `requestedProgram` json;
--> statement-breakpoint
ALTER TABLE `scenarios` ADD `existingConditions` json;
--> statement-breakpoint
ALTER TABLE `scenarios` ADD `achievedProgram` json;
--> statement-breakpoint
ALTER TABLE `scenarios` ADD `fitVariance` json;
--> statement-breakpoint
ALTER TABLE `scenarios` ADD `reuseStrategy` text;
--> statement-breakpoint
ALTER TABLE `scenarios` ADD `changeSummary` json;
--> statement-breakpoint
ALTER TABLE `scenarios` ADD `qaWarnings` json;
--> statement-breakpoint
ALTER TABLE `scenarios` ADD `validationStatus` varchar(32);
