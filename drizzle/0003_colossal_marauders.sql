CREATE TABLE `reportViews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tokenId` int NOT NULL,
	`projectId` int NOT NULL,
	`viewedAt` timestamp NOT NULL DEFAULT (now()),
	`ipHash` varchar(64),
	`userAgent` text,
	`country` varchar(64),
	CONSTRAINT `reportViews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shareTokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`token` varchar(64) NOT NULL,
	`projectId` int NOT NULL,
	`userId` int NOT NULL,
	`viewCount` int NOT NULL DEFAULT 0,
	`lastViewedAt` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shareTokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `shareTokens_token_unique` UNIQUE(`token`)
);
