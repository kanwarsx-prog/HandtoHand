-- Quick demo data seed
-- Step 1: First, find your user ID by running this query:
-- SELECT id, email FROM auth.users;
-- Copy your user ID and replace 'YOUR_USER_ID_HERE' below

-- Step 2: Replace YOUR_USER_ID_HERE with your actual UUID from step 1
-- Then run this entire script

DO $$
DECLARE
  my_user_id UUID := 'YOUR_USER_ID_HERE'; -- REPLACE THIS WITH YOUR ACTUAL USER ID
BEGIN
  -- Sample Offers
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  SELECT 
    my_user_id,
    title,
    description,
    (SELECT id FROM categories WHERE slug = category_slug),
    'ACTIVE',
    created_at
  FROM (VALUES
    ('Tomato Seedlings', 'I have 20+ tomato seedlings ready to transplant. Cherry and beefsteak varieties. Free to good homes!', 'gardening', NOW() - INTERVAL '2 days'),
    ('Power Drill Available', 'Cordless drill with various bits. Can lend for weekend projects.', 'diy', NOW() - INTERVAL '1 day'),
    ('Sourdough Starter', 'Active sourdough starter, over 5 years old! Includes feeding instructions.', 'food', NOW() - INTERVAL '4 days'),
    ('Computer Help', 'Can help with basic computer issues, software installation, virus removal.', 'tech', NOW() - INTERVAL '2 days'),
    ('Art Supplies Swap', 'Have extra acrylic paints and canvases. Happy to swap for watercolors!', 'arts', NOW() - INTERVAL '1 day'),
    ('Garden Tools to Borrow', 'Happy to lend out my spade, rake, and hand tools. Just return them clean!', 'gardening', NOW() - INTERVAL '5 days'),
    ('Baking Lessons', 'Love to teach bread making! Can show you how to make artisan loaves.', 'food', NOW() - INTERVAL '6 days'),
    ('Drawing Lessons', 'Professional artist offering beginner drawing lessons. All ages welcome!', 'arts', NOW() - INTERVAL '5 days')
  ) AS t(title, description, category_slug, created_at);

  -- Sample Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  SELECT 
    my_user_id,
    title,
    description,
    (SELECT id FROM categories WHERE slug = category_slug),
    'ACTIVE',
    created_at
  FROM (VALUES
    ('Lawn Mower to Borrow', 'Need to borrow a lawn mower for weekend. Will return clean and refueled!', 'diy', NOW() - INTERVAL '1 day'),
    ('Vegetable Seeds', 'Looking for vegetable seeds to start a small garden. Any variety welcome!', 'gardening', NOW() - INTERVAL '2 days'),
    ('Baking Equipment', 'Need a stand mixer or bread machine. Happy to borrow or trade baked goods!', 'food', NOW() - INTERVAL '4 days'),
    ('Guitar Lessons', 'Want to learn guitar! Looking for someone patient to teach basics.', 'skills', NOW() - INTERVAL '1 day'),
    ('Photography Tips', 'Learning photography, would love tips or to shadow someone experienced!', 'skills', NOW() - INTERVAL '2 days')
  ) AS t(title, description, category_slug, created_at);

  RAISE NOTICE 'Demo data created! Added 8 offers and 5 wishes.';
END $$;
