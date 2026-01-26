-- Demo data with multiple realistic users
-- This creates demo users directly in the users table (bypassing auth for demo purposes)
-- These users won't be able to log in, but will appear in the app as offer/wish creators

DO $$
DECLARE
  user_sarah UUID := gen_random_uuid();
  user_mike UUID := gen_random_uuid();
  user_emma UUID := gen_random_uuid();
  user_james UUID := gen_random_uuid();
  user_lisa UUID := gen_random_uuid();
BEGIN
  -- Create demo users
  INSERT INTO users (id, email, display_name, postcode_outward, created_at)
  VALUES 
    (user_sarah, 'sarah.green@demo.local', 'Sarah Green', 'SW1', NOW() - INTERVAL '30 days'),
    (user_mike, 'mike.builder@demo.local', 'Mike Builder', 'SW1', NOW() - INTERVAL '25 days'),
    (user_emma, 'emma.baker@demo.local', 'Emma Baker', 'SW2', NOW() - INTERVAL '20 days'),
    (user_james, 'james.tech@demo.local', 'James Tech', 'SW2', NOW() - INTERVAL '15 days'),
    (user_lisa, 'lisa.artist@demo.local', 'Lisa Artist', 'SW3', NOW() - INTERVAL '10 days')
  ON CONFLICT (id) DO NOTHING;

  -- Sarah's Offers (Gardening enthusiast)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_sarah, 'Tomato Seedlings', 'I have 20+ tomato seedlings ready to transplant. Cherry and beefsteak varieties. Free to good homes!', 
     (SELECT id FROM categories WHERE slug = 'gardening'), 'ACTIVE', NOW() - INTERVAL '2 days'),
    (user_sarah, 'Garden Tools to Borrow', 'Happy to lend out my spade, rake, and hand tools. Just return them clean!', 
     (SELECT id FROM categories WHERE slug = 'gardening'), 'ACTIVE', NOW() - INTERVAL '5 days');

  -- Mike's Offers (DIY expert)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_mike, 'Power Drill Available', 'Cordless drill with various bits. Can lend for weekend projects.', 
     (SELECT id FROM categories WHERE slug = 'diy'), 'ACTIVE', NOW() - INTERVAL '1 day'),
    (user_mike, 'Help with Small Repairs', 'Experienced with basic home repairs. Happy to help neighbors with fixing things!', 
     (SELECT id FROM categories WHERE slug = 'diy'), 'ACTIVE', NOW() - INTERVAL '3 days');

  -- Emma's Offers (Food lover)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_emma, 'Sourdough Starter', 'Active sourdough starter, over 5 years old! Includes feeding instructions.', 
     (SELECT id FROM categories WHERE slug = 'food'), 'ACTIVE', NOW() - INTERVAL '4 days'),
    (user_emma, 'Baking Lessons', 'Love to teach bread making! Can show you how to make artisan loaves.', 
     (SELECT id FROM categories WHERE slug = 'food'), 'ACTIVE', NOW() - INTERVAL '6 days');

  -- James's Offers (Tech person)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_james, 'Computer Help', 'Can help with basic computer issues, software installation, virus removal.', 
     (SELECT id FROM categories WHERE slug = 'tech'), 'ACTIVE', NOW() - INTERVAL '2 days'),
    (user_james, 'Old Laptop for Parts', 'Non-working laptop, good for parts or learning to repair electronics.', 
     (SELECT id FROM categories WHERE slug = 'tech'), 'ACTIVE', NOW() - INTERVAL '7 days');

  -- Lisa's Offers (Arts & Crafts)
  INSERT INTO offers (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_lisa, 'Art Supplies Swap', 'Have extra acrylic paints and canvases. Happy to swap for watercolors!', 
     (SELECT id FROM categories WHERE slug = 'arts'), 'ACTIVE', NOW() - INTERVAL '1 day'),
    (user_lisa, 'Drawing Lessons', 'Professional artist offering beginner drawing lessons. All ages welcome!', 
     (SELECT id FROM categories WHERE slug = 'arts'), 'ACTIVE', NOW() - INTERVAL '5 days');

  -- Sarah's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_sarah, 'Lawn Mower to Borrow', 'Need to borrow a lawn mower for weekend. Will return clean and refueled!', 
     (SELECT id FROM categories WHERE slug = 'diy'), 'ACTIVE', NOW() - INTERVAL '1 day'),
    (user_sarah, 'Compost Bin', 'Looking for a spare compost bin or willing to build one together!', 
     (SELECT id FROM categories WHERE slug = 'gardening'), 'ACTIVE', NOW() - INTERVAL '3 days');

  -- Mike's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_mike, 'Vegetable Seeds', 'Looking for vegetable seeds to start a small garden. Any variety welcome!', 
     (SELECT id FROM categories WHERE slug = 'gardening'), 'ACTIVE', NOW() - INTERVAL '2 days');

  -- Emma's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_emma, 'Baking Equipment', 'Need a stand mixer or bread machine. Happy to borrow or trade baked goods!', 
     (SELECT id FROM categories WHERE slug = 'food'), 'ACTIVE', NOW() - INTERVAL '4 days');

  -- James's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_james, 'Guitar Lessons', 'Want to learn guitar! Looking for someone patient to teach basics.', 
     (SELECT id FROM categories WHERE slug = 'skills'), 'ACTIVE', NOW() - INTERVAL '1 day');

  -- Lisa's Wishes
  INSERT INTO wishes (user_id, title, description, category_id, status, created_at)
  VALUES 
    (user_lisa, 'Photography Tips', 'Learning photography, would love tips or to shadow someone experienced!', 
     (SELECT id FROM categories WHERE slug = 'skills'), 'ACTIVE', NOW() - INTERVAL '2 days');

  RAISE NOTICE 'Demo data created successfully!';
  RAISE NOTICE 'Created 5 demo users, 10 offers, and 6 wishes';
END $$;
