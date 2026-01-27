-- ============================================================================
-- HandtoHand MVP - Complete Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/vezbnfgtjpadksammaw/sql/new
-- ============================================================================

-- Enable required extensions (run this first if not already done)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================================
-- ENUMS
-- ============================================================================

CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'BANNED', 'DELETED');
CREATE TYPE "OfferStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED', 'REMOVED');
CREATE TYPE "WishStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');
CREATE TYPE "ExchangeStatus" AS ENUM ('PROPOSED', 'AGREED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ReportTarget" AS ENUM ('USER', 'OFFER', 'MESSAGE');
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'REVIEWED', 'ACTIONED', 'DISMISSED');

-- ============================================================================
-- TABLES
-- ============================================================================

-- Users table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL UNIQUE,
    "display_name" TEXT NOT NULL,
    "profile_photo" TEXT,
    "postcode_outward" TEXT NOT NULL,
    "postcode_full" TEXT,
    "bio" TEXT,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "show_full_postcode" BOOLEAN NOT NULL DEFAULT false,
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_active_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "users_postcode_outward_idx" ON "users"("postcode_outward");

-- Categories table
CREATE TABLE "categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL UNIQUE,
    "slug" TEXT NOT NULL UNIQUE,
    "description" TEXT,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- User Categories (many-to-many)
CREATE TABLE "user_categories" (
    "user_id" UUID NOT NULL,
    "category_id" UUID NOT NULL,
    PRIMARY KEY ("user_id", "category_id"),
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE
);

-- Offers table
CREATE TABLE "offers" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" UUID NOT NULL,
    "availability" TEXT,
    "location_radius" INTEGER NOT NULL DEFAULT 5,
    "location_lat" DOUBLE PRECISION,
    "location_lng" DOUBLE PRECISION,
    "status" "OfferStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
);

CREATE INDEX "offers_user_id_status_idx" ON "offers"("user_id", "status");
CREATE INDEX "offers_category_id_status_idx" ON "offers"("category_id", "status");
CREATE INDEX "offers_status_updated_at_idx" ON "offers"("status", "updated_at");
CREATE INDEX "offers_location_lat_location_lng_idx" ON "offers"("location_lat", "location_lng");

-- Offer Photos table
CREATE TABLE "offer_photos" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "offer_id" UUID NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("offer_id") REFERENCES "offers"("id") ON DELETE CASCADE
);

CREATE INDEX "offer_photos_offer_id_order_idx" ON "offer_photos"("offer_id", "order");

-- Wishes table
CREATE TABLE "wishes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" UUID,
    "open_to_suggestions" BOOLEAN NOT NULL DEFAULT true,
    "status" "WishStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("category_id") REFERENCES "categories"("id")
);

CREATE INDEX "wishes_user_id_status_idx" ON "wishes"("user_id", "status");
CREATE INDEX "wishes_category_id_status_idx" ON "wishes"("category_id", "status");

-- Conversations table
CREATE TABLE "conversations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "offer_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "conversations_offer_id_idx" ON "conversations"("offer_id");

-- Conversation Participants table
CREATE TABLE "conversation_participants" (
    "conversation_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "last_read_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY ("conversation_id", "user_id"),
    FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE,
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");

-- Messages table
CREATE TABLE "messages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL,
    "sender_id" UUID NOT NULL,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "edited_at" TIMESTAMP(3),
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flag_reason" TEXT,
    FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE,
    FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- Exchanges table
CREATE TABLE "exchanges" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "initiator_id" UUID NOT NULL,
    "responder_id" UUID NOT NULL,
    "initiator_offer" TEXT,
    "responder_offer" TEXT,
    "initiator_offer_id" TEXT,
    "responder_offer_id" TEXT,
    "status" "ExchangeStatus" NOT NULL DEFAULT 'PROPOSED',
    "proposed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "agreed_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "initiator_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "responder_confirmed" BOOLEAN NOT NULL DEFAULT false,
    FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("responder_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "exchanges_initiator_id_status_idx" ON "exchanges"("initiator_id", "status");
CREATE INDEX "exchanges_responder_id_status_idx" ON "exchanges"("responder_id", "status");
CREATE INDEX "exchanges_status_completed_at_idx" ON "exchanges"("status", "completed_at");

-- Feedback table
CREATE TABLE "feedback" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "exchange_id" UUID NOT NULL,
    "from_user_id" UUID NOT NULL,
    "to_user_id" UUID NOT NULL,
    "would_exchange_again" BOOLEAN NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("exchange_id") REFERENCES "exchanges"("id") ON DELETE CASCADE,
    FOREIGN KEY ("from_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("to_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE ("exchange_id", "from_user_id")
);

CREATE INDEX "feedback_to_user_id_idx" ON "feedback"("to_user_id");

-- Blocks table
CREATE TABLE "blocks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "blocker_id" UUID NOT NULL,
    "blocked_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("blocker_id") REFERENCES "users"("id") ON DELETE CASCADE,
    FOREIGN KEY ("blocked_id") REFERENCES "users"("id") ON DELETE CASCADE,
    UNIQUE ("blocker_id", "blocked_id")
);

CREATE INDEX "blocks_blocker_id_idx" ON "blocks"("blocker_id");
CREATE INDEX "blocks_blocked_id_idx" ON "blocks"("blocked_id");

-- Reports table
CREATE TABLE "reports" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "reporter_id" UUID NOT NULL,
    "target_type" "ReportTarget" NOT NULL,
    "target_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "details" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("reporter_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX "reports_status_created_at_idx" ON "reports"("status", "created_at");
CREATE INDEX "reports_target_type_target_id_idx" ON "reports"("target_type", "target_id");

-- Analytics Events table
CREATE TABLE "analytics_events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "analytics_events_event_type_created_at_idx" ON "analytics_events"("event_type", "created_at");
CREATE INDEX "analytics_events_user_id_created_at_idx" ON "analytics_events"("user_id", "created_at");

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON "users"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at BEFORE UPDATE ON "offers"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wishes_updated_at BEFORE UPDATE ON "wishes"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON "conversations"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- DONE!
-- ============================================================================
-- All tables created successfully!
-- Next: Run Prisma generate to create the client
-- cd packages/database && npx prisma db pull && npx prisma generate

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================

CREATE TABLE "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
