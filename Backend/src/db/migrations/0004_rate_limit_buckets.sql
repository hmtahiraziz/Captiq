CREATE TABLE "rate_limit_buckets" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"hits" integer DEFAULT 0 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE INDEX "rate_limit_buckets_reset_at_idx" ON "rate_limit_buckets" USING btree ("reset_at");
