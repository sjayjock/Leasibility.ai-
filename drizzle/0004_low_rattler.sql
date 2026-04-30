ALTER TABLE `brokerProfiles` ADD `onboardingCompleted` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `brokerProfiles` ADD `onboardingRole` varchar(64);--> statement-breakpoint
ALTER TABLE `brokerProfiles` ADD `onboardingDealVolume` varchar(32);--> statement-breakpoint
ALTER TABLE `brokerProfiles` ADD `onboardingMarket` varchar(100);--> statement-breakpoint
ALTER TABLE `brokerProfiles` ADD `onboardingPainPoints` text;