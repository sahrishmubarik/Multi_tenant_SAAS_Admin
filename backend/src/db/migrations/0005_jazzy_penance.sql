CREATE TABLE "auditLog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"preformed_by" uuid NOT NULL,
	"action" varchar(100) NOT NULL,
	"affected_user" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_preformed_by_users_id_fk" FOREIGN KEY ("preformed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "auditLog" ADD CONSTRAINT "auditLog_affected_user_users_id_fk" FOREIGN KEY ("affected_user") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;