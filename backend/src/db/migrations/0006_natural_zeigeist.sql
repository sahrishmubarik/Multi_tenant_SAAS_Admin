ALTER TABLE "auditLog" RENAME COLUMN "preformed_by" TO "performed_by";--> statement-breakpoint
ALTER TABLE "auditLog" DROP CONSTRAINT "auditLog_preformed_by_users_id_fk";
--> statement-breakpoint
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_performed_by_users_id_fk" FOREIGN KEY ("performed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;