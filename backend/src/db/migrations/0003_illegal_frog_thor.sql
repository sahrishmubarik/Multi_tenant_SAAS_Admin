CREATE TYPE "public"."role" AS ENUM('admin', 'owner', 'editor', 'viewer');--> statement-breakpoint
ALTER TABLE "workspace_members" ALTER COLUMN "role" SET DEFAULT 'viewer'::"public"."role";--> statement-breakpoint
ALTER TABLE "workspace_members" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";