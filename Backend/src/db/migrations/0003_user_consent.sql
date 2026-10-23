ALTER TABLE "users" ADD COLUMN "consent_version" varchar(32);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "consented_at" timestamp with time zone;
