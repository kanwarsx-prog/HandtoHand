-- The application supports one cover image URL on an offer.
ALTER TABLE "offers"
ADD COLUMN IF NOT EXISTS "image_url" TEXT;
