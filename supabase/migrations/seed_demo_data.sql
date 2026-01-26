-- Seed script for HandtoHand demo data
-- This creates sample users, offers, and wishes for demonstration

-- Note: You'll need to create these users through Supabase Auth first, then update the UUIDs below
-- Or run this after users sign up through the app

-- First, let's insert some sample users into the users table
-- These UUIDs are placeholders - replace with actual auth user IDs after they sign up

-- Sample user 1: Sarah (Gardening enthusiast)
INSERT INTO users (id, email, display_name, postcode_outward, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'sarah@example.com', 'Sarah Green', 'SW1', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample user 2: Mike (DIY expert)
INSERT INTO users (id, email, display_name, postcode_outward, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'mike@example.com', 'Mike Builder', 'SW1', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample user 3: Emma (Food lover)
INSERT INTO users (id, email, display_name, postcode_outward, created_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'emma@example.com', 'Emma Baker', 'SW2', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample user 4: James (Tech person)
INSERT INTO users (id, email, display_name, postcode_outward, created_at)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'james@example.com', 'James Tech', 'SW2', NOW())
ON CONFLICT (id) DO NOTHING;

-- Sample user 5: Lisa (Arts & Crafts)
INSERT INTO users (id, email, display_name, postcode_outward, created_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'lisa@example.com', 'Lisa Artist', 'SW3', NOW())
ON CONFLICT (id) DO NOTHING;

-- Get category IDs for reference
DO $$
DECLARE
  cat_gardening UUID;
  cat_diy UUID;
  cat_food UUID;
  cat_tech UUID;
  cat_arts UUID;
  cat_skills UUID;
BEGIN
  -- Get category IDs
  SELECT id INTO cat_gardening FROM categories WHERE slug = 'gardening';
  SELECT id INTO cat_diy FROM categories WHERE slug = 'diy';
  SELECT id INTO cat_food FROM categories WHERE slug = 'food';
  SELECT id INTO cat_tech FROM categories WHERE slug = 'tech';
  SELECT id INTO cat_arts FROM categories WHERE slug = 'arts';
  SELECT id INTO cat_skills FROM categories WHERE slug = 'skills';

  -- Sarah's Offers (Gardening)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Tomato Seedlings', 'I have 20+ tomato seedlings ready to transplant. Cherry and beefsteak varieties. Free to good homes!', cat_gardening, 'ACTIVE', NOW() - INTERVAL '2 days'),
    ('11111111-1111-1111-1111-111111111111', 'Garden Tools to Borrow', 'Happy to lend out my spade, rake, and hand tools. Just return them clean!', cat_gardening, 'ACTIVE', NOW() - INTERVAL '5 days')
  ON CONFLICT DO NOTHING;

  -- Mike's Offers (DIY)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('22222222-2222-2222-2222-222222222222', 'Power Drill Available', 'Cordless drill with various bits. Can lend for weekend projects.', cat_diy, 'ACTIVE', NOW() - INTERVAL '1 day'),
    ('22222222-2222-2222-2222-222222222222', 'Help with Small Repairs', 'Experienced with basic home repairs. Happy to help neighbors with fixing things!', cat_diy, 'ACTIVE', NOW() - INTERVAL '3 days')
  ON CONFLICT DO NOTHING;

  -- Emma's Offers (Food)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('33333333-3333-3333-3333-333333333333', 'Sourdough Starter', 'Active sourdough starter, over 5 years old! Includes feeding instructions.', cat_food, 'ACTIVE', NOW() - INTERVAL '4 days'),
    ('33333333-3333-3333-3333-333333333333', 'Baking Lessons', 'Love to teach bread making! Can show you how to make artisan loaves.', cat_food, 'ACTIVE', NOW() - INTERVAL '6 days')
  ON CONFLICT DO NOTHING;

  -- James's Offers (Tech)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('44444444-4444-4444-4444-444444444444', 'Computer Help', 'Can help with basic computer issues, software installation, virus removal.', cat_tech, 'ACTIVE', NOW() - INTERVAL '2 days'),
    ('44444444-4444-4444-4444-444444444444', 'Old Laptop for Parts', 'Non-working laptop, good for parts or learning to repair electronics.', cat_tech, 'ACTIVE', NOW() - INTERVAL '7 days')
  ON CONFLICT DO NOTHING;

  -- Lisa's Offers (Arts)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('55555555-5555-5555-5555-555555555555', 'Art Supplies Swap', 'Have extra acrylic paints and canvases. Happy to swap for watercolors!', cat_arts, 'ACTIVE', NOW() - INTERVAL '1 day'),
    ('55555555-5555-5555-5555-555555555555', 'Drawing Lessons', 'Professional artist offering beginner drawing lessons. All ages welcome!', cat_arts, 'ACTIVE', NOW() - INTERVAL '5 days')
  ON CONFLICT DO NOTHING;

  -- Sample Wishes
  
  -- Sarah's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Lawn Mower to Borrow', 'Need to borrow a lawn mower for weekend. Will return clean and refueled!', cat_diy, 'ACTIVE', NOW() - INTERVAL '1 day'),
    ('11111111-1111-1111-1111-111111111111', 'Compost Bin', 'Looking for a spare compost bin or willing to build one together!', cat_gardening, 'ACTIVE', NOW() - INTERVAL '3 days')
  ON CONFLICT DO NOTHING;

  -- Mike's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('22222222-2222-2222-2222-222222222222', 'Vegetable Seeds', 'Looking for vegetable seeds to start a small garden. Any variety welcome!', cat_gardening, 'ACTIVE', NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;

  -- Emma's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('33333333-3333-3333-3333-333333333333', 'Baking Equipment', 'Need a stand mixer or bread machine. Happy to borrow or trade baked goods!', cat_food, 'ACTIVE', NOW() - INTERVAL '4 days')
  ON CONFLICT DO NOTHING;

  -- James's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('44444444-4444-4444-4444-444444444444', 'Guitar Lessons', 'Want to learn guitar! Looking for someone patient to teach basics.', cat_skills, 'ACTIVE', NOW() - INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  -- Lisa's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    ('55555555-5555-5555-5555-555555555555', 'Photography Tips', 'Learning photography, would love tips or to shadow someone experienced!', cat_skills, 'ACTIVE', NOW() - INTERVAL '2 days')
  ON CONFLICT DO NOTHING;

END $$;

-- Success message
SELECT 'Demo data seeded successfully! Created 5 users, 10 offers, and 6 wishes.' AS message;
