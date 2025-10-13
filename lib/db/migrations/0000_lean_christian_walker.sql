CREATE TABLE "activity_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"supabase_user_id" text,
	"action" text NOT NULL,
	"timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" text
);
--> statement-breakpoint
CREATE TABLE "background_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'queued' NOT NULL,
	"priority" integer DEFAULT 5,
	"progress" integer DEFAULT 0,
	"current_step" text,
	"input" text,
	"result" text,
	"error" text,
	"metadata" text,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"retry_count" integer DEFAULT 0,
	"max_retries" integer DEFAULT 3,
	"next_retry_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "business_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"business_name" text NOT NULL,
	"address" text,
	"phone" text,
	"website" text,
	"description" text,
	"categories" text,
	"geo_lat" real,
	"geo_lng" real,
	"service_area" text,
	"business_hours" text,
	"nap_consistency_score" integer DEFAULT 0,
	"profile_completeness" integer DEFAULT 0,
	"verified_status" text DEFAULT 'unverified',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "business_profiles_supabase_user_id_unique" UNIQUE("supabase_user_id")
);
--> statement-breakpoint
CREATE TABLE "citations" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"directory" text NOT NULL,
	"url" text,
	"status" text DEFAULT 'unclaimed' NOT NULL,
	"priority" text DEFAULT 'medium' NOT NULL,
	"business_info" text,
	"notes" text,
	"citation_type" text DEFAULT 'local',
	"domain_authority" integer,
	"citation_confidence" integer DEFAULT 0,
	"last_checked_at" timestamp,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"primary_website_analysis_id" integer NOT NULL,
	"competitor_url" text NOT NULL,
	"competitor_domain" text NOT NULL,
	"missing_topics" text,
	"weaker_content" text,
	"opportunities" text,
	"analysis_data" text,
	"content_gap_analysis" text,
	"performance_comparison" text,
	"keyword_overlap_analysis" text,
	"recommendations" text,
	"industry_id" text,
	"competitor_strength_score" integer DEFAULT 0,
	"content_similarity_score" integer DEFAULT 0,
	"backlink_profile" text,
	"technical_seo_score" integer DEFAULT 0,
	"social_presence" text,
	"analyzed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitor_monitoring" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"competitor_url" text NOT NULL,
	"competitor_domain" text NOT NULL,
	"is_active" boolean DEFAULT true,
	"last_crawl_date" timestamp,
	"previous_page_count" integer DEFAULT 0,
	"current_page_count" integer DEFAULT 0,
	"new_content_detected" text,
	"removed_content_detected" text,
	"keyword_changes" text,
	"change_score" integer DEFAULT 0,
	"alerts_sent" integer DEFAULT 0,
	"analysis_data" text,
	"content_gap_analysis" text,
	"performance_comparison" text,
	"keyword_overlap_analysis" text,
	"recommendations" text,
	"last_analysis_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_briefs" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"saved_topic_id" integer,
	"title" text NOT NULL,
	"brief_content" text NOT NULL,
	"suggested_headings" text,
	"target_keywords" text,
	"word_count_estimate" integer,
	"internal_linking_suggestions" text,
	"content_recommendations" text,
	"generated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_calendars" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"calendar_data" text NOT NULL,
	"year" integer NOT NULL,
	"industry_id" text,
	"location" text,
	"target_audience" text,
	"content_themes" text,
	"publishing_frequency" text DEFAULT 'weekly',
	"status" text DEFAULT 'active',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_gaps" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_analysis_id" integer NOT NULL,
	"topic" text NOT NULL,
	"reason" text NOT NULL,
	"priority" text NOT NULL,
	"estimated_difficulty" text NOT NULL,
	"competitor_advantage" text,
	"identified_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crawled_pages" (
	"id" serial PRIMARY KEY NOT NULL,
	"website_analysis_id" integer NOT NULL,
	"url" text NOT NULL,
	"title" text NOT NULL,
	"meta_description" text,
	"headings" text,
	"content" text,
	"word_count" integer DEFAULT 0 NOT NULL,
	"internal_links" text,
	"external_links" text,
	"images" text,
	"last_modified" timestamp
);
--> statement-breakpoint
CREATE TABLE "generated_content" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"saved_topic_id" integer,
	"content_type" text NOT NULL,
	"variant_number" integer NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"html_content" text,
	"tone" text NOT NULL,
	"additional_context" text,
	"website_analysis_context" text,
	"word_count" integer DEFAULT 0 NOT NULL,
	"reading_time" integer,
	"target_keywords" text,
	"seo_score" integer,
	"status" text DEFAULT 'draft' NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"published_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "gsc_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"site_url" text NOT NULL,
	"access_token" text NOT NULL,
	"refresh_token" text NOT NULL,
	"token_expiry" timestamp NOT NULL,
	"is_active" boolean DEFAULT true,
	"sync_frequency" text DEFAULT 'daily',
	"last_sync_date" timestamp,
	"total_keywords_tracked" integer DEFAULT 0,
	"average_position" integer,
	"connected_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"email" text NOT NULL,
	"role" text NOT NULL,
	"invited_by" integer NOT NULL,
	"invited_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "job_notifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"job_id" integer NOT NULL,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"is_read" boolean DEFAULT false,
	"auto_dismiss" boolean DEFAULT true,
	"dismiss_at" timestamp,
	"action_url" text,
	"action_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"read_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "performance_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"saved_topic_id" integer,
	"keyword" text NOT NULL,
	"position" integer NOT NULL,
	"url" text NOT NULL,
	"clicks" integer DEFAULT 0,
	"impressions" integer DEFAULT 0,
	"ctr" integer,
	"device" text,
	"country" text,
	"date" text NOT NULL,
	"sync_timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_topics" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"topic" text NOT NULL,
	"description" text,
	"tags" text,
	"difficulty" text,
	"search_volume" integer,
	"competition_level" text,
	"source_generation_id" integer,
	"business_type" text,
	"target_audience" text,
	"location" text,
	"tone" text,
	"additional_context" text,
	"website_url" text,
	"website_analysis_context" text,
	"saved_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"role" text NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"stripe_customer_id" text,
	"stripe_subscription_id" text,
	"stripe_product_id" text,
	"plan_name" text,
	"subscription_status" text,
	CONSTRAINT "teams_stripe_customer_id_unique" UNIQUE("stripe_customer_id"),
	CONSTRAINT "teams_stripe_subscription_id_unique" UNIQUE("stripe_subscription_id")
);
--> statement-breakpoint
CREATE TABLE "topic_generations" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"input_topic" text NOT NULL,
	"generated_topics" text NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "usage_tracking" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"action" text NOT NULL,
	"metadata" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text,
	"email" text NOT NULL,
	"supabase_id" text NOT NULL,
	"role" text DEFAULT 'member' NOT NULL,
	"primary_website_url" text,
	"business_name" text,
	"business_address" text,
	"business_phone" text,
	"business_website" text,
	"business_description" text,
	"business_categories" text,
	"business_city" text,
	"business_state" text,
	"business_zip_code" text,
	"business_country" text,
	"business_latitude" real,
	"business_longitude" real,
	"setup_wizard_completed" boolean DEFAULT false,
	"setup_progress" text,
	"setup_wizard_completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_supabase_id_unique" UNIQUE("supabase_id")
);
--> statement-breakpoint
CREATE TABLE "website_analyses" (
	"id" serial PRIMARY KEY NOT NULL,
	"supabase_user_id" text NOT NULL,
	"url" text NOT NULL,
	"domain" text NOT NULL,
	"total_word_count" integer DEFAULT 0 NOT NULL,
	"total_images" integer DEFAULT 0 NOT NULL,
	"topics" text,
	"keywords" text,
	"content_gaps" text,
	"internal_linking_score" integer DEFAULT 0,
	"technical_issues" text,
	"crawled_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_analyses" ADD CONSTRAINT "competitor_analyses_primary_website_analysis_id_website_analyses_id_fk" FOREIGN KEY ("primary_website_analysis_id") REFERENCES "public"."website_analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_briefs" ADD CONSTRAINT "content_briefs_saved_topic_id_saved_topics_id_fk" FOREIGN KEY ("saved_topic_id") REFERENCES "public"."saved_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_gaps" ADD CONSTRAINT "content_gaps_website_analysis_id_website_analyses_id_fk" FOREIGN KEY ("website_analysis_id") REFERENCES "public"."website_analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crawled_pages" ADD CONSTRAINT "crawled_pages_website_analysis_id_website_analyses_id_fk" FOREIGN KEY ("website_analysis_id") REFERENCES "public"."website_analyses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "generated_content" ADD CONSTRAINT "generated_content_saved_topic_id_saved_topics_id_fk" FOREIGN KEY ("saved_topic_id") REFERENCES "public"."saved_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_users_id_fk" FOREIGN KEY ("invited_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "job_notifications" ADD CONSTRAINT "job_notifications_job_id_background_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."background_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "performance_tracking" ADD CONSTRAINT "performance_tracking_saved_topic_id_saved_topics_id_fk" FOREIGN KEY ("saved_topic_id") REFERENCES "public"."saved_topics"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_topics" ADD CONSTRAINT "saved_topics_source_generation_id_topic_generations_id_fk" FOREIGN KEY ("source_generation_id") REFERENCES "public"."topic_generations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_members" ADD CONSTRAINT "team_members_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE cascade ON UPDATE no action;