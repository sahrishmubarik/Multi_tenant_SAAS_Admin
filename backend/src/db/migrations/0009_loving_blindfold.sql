ALTER TABLE "users" RENAME COLUMN "username" TO "name";--> statement-breakpoint
DROP INDEX "users_username_unique_idx";