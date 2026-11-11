INSERT INTO categories (name, slug, icon, "order") VALUES
  ('Food & Cooking', 'food', '🍳', 1),
  ('Gardening', 'gardening', '🌱', 2),
  ('DIY & Tools', 'diy', '🔨', 3),
  ('Skills & Teaching', 'skills', '📚', 4),
  ('Transport', 'transport', '🚗', 5),
  ('Childcare', 'childcare', '👶', 6),
  ('Tech & Repair', 'tech', '💻', 7),
  ('Arts & Crafts', 'arts', '🎨', 8)
ON CONFLICT (slug) DO NOTHING;
