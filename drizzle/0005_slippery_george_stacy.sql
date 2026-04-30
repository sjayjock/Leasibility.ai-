CREATE TABLE `changelogSeen` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`version` varchar(32) NOT NULL,
	`seenAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `changelogSeen_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `referrals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`referrerId` int NOT NULL,
	`referredUserId` int,
	`referralCode` varchar(32) NOT NULL,
	`status` enum('pending','signed_up','subscribed','credited') NOT NULL DEFAULT 'pending',
	`creditApplied` boolean NOT NULL DEFAULT false,
	`creditMonths` int NOT NULL DEFAULT 0,
	`referredAt` timestamp,
	`subscribedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `referrals_id` PRIMARY KEY(`id`),
	CONSTRAINT `referrals_referredUserId_unique` UNIQUE(`referredUserId`),
	CONSTRAINT `referrals_referralCode_unique` UNIQUE(`referralCode`)
);
