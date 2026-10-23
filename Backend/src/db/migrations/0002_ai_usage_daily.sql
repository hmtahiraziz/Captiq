CREATE TABLE "ai_usage_daily" (
	"user_id" uuid NOT NULL,
	"usage_date" date NOT NULL,
	"scan_count" integer DEFAULT 0 NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "ai_usage_daily_user_id_usage_date_pk" PRIMARY KEY("user_id","usage_date")
);
--> statement-breakpoint
ALTER TABLE "ai_usage_daily" ADD CONSTRAINT "ai_usage_daily_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "ai_usage_daily_user_id_idx" ON "ai_usage_daily" USING btree ("user_id");
