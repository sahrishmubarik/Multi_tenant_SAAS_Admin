ALTER TABLE "invitations" DROP CONSTRAINT "invitations_token_unique";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_email_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "inv_token_unique_idx" ON "invitations" USING btree ("token");--> statement-breakpoint
CREATE INDEX "inv_workspace_id_idx" ON "invitations" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "inv_email_idx" ON "invitations" USING btree ("email");--> statement-breakpoint
CREATE INDEX "inv_invited_by_idx" ON "invitations" USING btree ("invited_by");--> statement-breakpoint
CREATE INDEX "inv_active_status_idx" ON "invitations" USING btree ("status","revoke");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "users_username_unique_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE INDEX "wm_workspace_id_idx" ON "workspace_members" USING btree ("workspace_id");--> statement-breakpoint
CREATE INDEX "wm_assigned_by_idx" ON "workspace_members" USING btree ("assigned_by");