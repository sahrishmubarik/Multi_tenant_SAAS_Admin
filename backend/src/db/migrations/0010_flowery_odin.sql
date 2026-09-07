ALTER TABLE "auditLog"
ADD COLUMN IF NOT EXISTS "message" text;

UPDATE "auditLog"
SET "message" = 'Activity recorded.'
WHERE "message" IS NULL;

ALTER TABLE "auditLog"
ALTER COLUMN "message" SET NOT NULL;

