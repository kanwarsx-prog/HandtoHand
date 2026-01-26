-- ============================================================================
-- HandtoHand MVP - Initial Database Setup
-- Run this in Supabase SQL Editor after creating your project
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Note: After running this, use Prisma to create the tables:
-- cd packages/database
-- npm run db:push

-- This will create all tables based on your Prisma schema
