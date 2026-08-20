CREATE TABLE `savedDraftFilters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(80) NOT NULL,
	`query` varchar(120) NOT NULL DEFAULT '',
	`status` enum('all','draft','approved','archived') NOT NULL DEFAULT 'all',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `savedDraftFilters_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `savedDraftFilters` ADD CONSTRAINT `savedDraftFilters_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;