ALTER TABLE `brokerProfiles` ADD `brokerEmail` varchar(320);--> statement-breakpoint
ALTER TABLE `brokerProfiles` ADD `brokerLogoKey` text;--> statement-breakpoint
ALTER TABLE `brokerProfiles` ADD `brokerPhotoKey` text;--> statement-breakpoint
ALTER TABLE `brokerProfiles` ADD `profileComplete` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `scenarios` ADD `impactLevel` enum('low','medium','high') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `stripeCustomerId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `stripeSubscriptionId` varchar(64);--> statement-breakpoint
ALTER TABLE `users` ADD `stripePlan` enum('starter','professional','team');--> statement-breakpoint
ALTER TABLE `users` ADD `stripeStatus` varchar(32);--> statement-breakpoint
ALTER TABLE `users` ADD `trialEndsAt` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionEndsAt` timestamp;