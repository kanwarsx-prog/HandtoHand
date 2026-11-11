-- HandtoHand demo seed for Neon
--
-- This seed is intentionally repeatable. It creates browseable demo profiles
-- and activity, but does not create authentication accounts or passwords.
-- All demo records use the 10000000 UUID namespace so they are easy to identify.

BEGIN;

INSERT INTO "users" (
  "id", "email", "display_name", "postcode_outward", "bio", "created_at", "updated_at", "last_active_at"
)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'aisha.khan@demo.handtohand.local', 'Aisha Khan', 'SE15', 'Community gardener and keen cook. I enjoy sharing practical skills and helping neighbours make the most of what they have.', NOW() - INTERVAL '42 days', NOW(), NOW() - INTERVAL '2 hours'),
  ('10000000-0000-0000-0000-000000000002', 'daniel.brooks@demo.handtohand.local', 'Daniel Brooks', 'SE22', 'Furniture restorer and weekend DIY enthusiast. Happy to lend tools or help with small repairs.', NOW() - INTERVAL '38 days', NOW(), NOW() - INTERVAL '5 hours'),
  ('10000000-0000-0000-0000-000000000003', 'priya.shah@demo.handtohand.local', 'Priya Shah', 'SE24', 'Home baker who loves teaching bread-making and swapping recipes with people nearby.', NOW() - INTERVAL '31 days', NOW(), NOW() - INTERVAL '1 day'),
  ('10000000-0000-0000-0000-000000000004', 'tom.wilson@demo.handtohand.local', 'Tom Wilson', 'SE23', 'Patient tech helper and amateur photographer. I can help with laptops, phones, and getting family photos organised.', NOW() - INTERVAL '27 days', NOW(), NOW() - INTERVAL '3 hours'),
  ('10000000-0000-0000-0000-000000000005', 'hannah.evans@demo.handtohand.local', 'Hannah Evans', 'SE6', 'Parent, knitter, and occasional babysitter. Always happy to pass on supplies that are no longer being used.', NOW() - INTERVAL '24 days', NOW(), NOW() - INTERVAL '8 hours'),
  ('10000000-0000-0000-0000-000000000006', 'marcus.reed@demo.handtohand.local', 'Marcus Reed', 'SE13', 'Cyclist and community volunteer with a spare set of hands for moving, assembling, and local projects.', NOW() - INTERVAL '19 days', NOW(), NOW() - INTERVAL '2 days')
ON CONFLICT ("id") DO UPDATE SET
  "email" = EXCLUDED."email",
  "display_name" = EXCLUDED."display_name",
  "postcode_outward" = EXCLUDED."postcode_outward",
  "bio" = EXCLUDED."bio",
  "status" = 'ACTIVE',
  "updated_at" = NOW(),
  "last_active_at" = EXCLUDED."last_active_at";

INSERT INTO "offers" (
  "id", "user_id", "title", "description", "category_id", "availability", "location_radius", "status", "created_at", "updated_at"
)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Surplus tomato and herb plants', 'I have spare tomato, basil, and mint plants from this year''s seedlings. Collection from SE15, and I can include simple planting tips.', (SELECT "id" FROM "categories" WHERE "slug" = 'gardening'), 'Most weekday evenings', 3, 'ACTIVE', NOW() - INTERVAL '2 days', NOW()),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'Help planning a small balcony garden', 'Happy to spend an hour helping choose containers and low-maintenance plants for a sunny or shady balcony.', (SELECT "id" FROM "categories" WHERE "slug" = 'gardening'), 'Saturday mornings', 4, 'ACTIVE', NOW() - INTERVAL '6 days', NOW()),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'Cordless drill and hand tools to borrow', 'A reliable cordless drill, bits, spirit level, and basic hand tools available for small home projects. Please return everything clean.', (SELECT "id" FROM "categories" WHERE "slug" = 'diy'), 'Weekends with notice', 5, 'ACTIVE', NOW() - INTERVAL '1 day', NOW()),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'Help putting up shelves and pictures', 'I can help measure, drill, and safely put up shelves, curtain rails, or pictures. Small jobs only, please.', (SELECT "id" FROM "categories" WHERE "slug" = 'diy'), 'Tuesday and Thursday evenings', 4, 'ACTIVE', NOW() - INTERVAL '4 days', NOW()),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000003', 'Sourdough starter and beginner tips', 'A healthy sourdough starter with a simple feeding guide. I can also answer questions about your first loaf.', (SELECT "id" FROM "categories" WHERE "slug" = 'food'), 'Sunday afternoons', 3, 'ACTIVE', NOW() - INTERVAL '3 days', NOW()),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000003', 'Small group bread-making session', 'A relaxed two-hour session covering a basic loaf, shaping, and baking. Bring an apron and a container for your dough.', (SELECT "id" FROM "categories" WHERE "slug" = 'food'), 'One Saturday each month', 5, 'ACTIVE', NOW() - INTERVAL '8 days', NOW()),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000004', 'Laptop and phone setup help', 'Patient help with updates, backups, transferring photos, and making everyday devices a little less frustrating.', (SELECT "id" FROM "categories" WHERE "slug" = 'tech'), 'Wednesday evenings', 5, 'ACTIVE', NOW() - INTERVAL '2 days', NOW()),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000004', 'Family photography walk', 'I can show you a few simple techniques for better phone photos during a relaxed walk around the local area.', (SELECT "id" FROM "categories" WHERE "slug" = 'skills'), 'Sunday mornings', 6, 'ACTIVE', NOW() - INTERVAL '5 days', NOW()),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000005', 'Knitting needles and wool bundle', 'A selection of clean spare needles and several balls of wool, suitable for scarves, hats, or beginner projects.', (SELECT "id" FROM "categories" WHERE "slug" = 'arts'), 'Collection most evenings', 3, 'ACTIVE', NOW() - INTERVAL '7 days', NOW()),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000005', 'Occasional evening babysitting', 'I have childcare experience and can help with an occasional evening when arranged in advance. References available on request.', (SELECT "id" FROM "categories" WHERE "slug" = 'skills'), 'Some Friday evenings', 4, 'ACTIVE', NOW() - INTERVAL '10 days', NOW()),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000006', 'Bicycle maintenance basics', 'I can show you how to fix a puncture, adjust brakes, clean a chain, and do a basic safety check.', (SELECT "id" FROM "categories" WHERE "slug" = 'skills'), 'Saturday mornings', 5, 'ACTIVE', NOW() - INTERVAL '9 days', NOW()),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000006', 'A pair of moving boxes and packing paper', 'Clean medium-sized boxes and packing paper left over from a recent move. Better reused than recycled early.', (SELECT "id" FROM "categories" WHERE "slug" = 'transport'), 'Collection this week', 4, 'ACTIVE', NOW() - INTERVAL '12 days', NOW())
ON CONFLICT ("id") DO UPDATE SET
  "user_id" = EXCLUDED."user_id",
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "category_id" = EXCLUDED."category_id",
  "availability" = EXCLUDED."availability",
  "location_radius" = EXCLUDED."location_radius",
  "status" = EXCLUDED."status",
  "updated_at" = NOW();

INSERT INTO "wishes" (
  "id", "user_id", "title", "description", "category_id", "open_to_suggestions", "status", "created_at", "updated_at"
)
VALUES
  ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'A spare compost bin', 'Looking for a spare compost bin or advice on making a compact one for a small garden.', (SELECT "id" FROM "categories" WHERE "slug" = 'gardening'), true, 'ACTIVE', NOW() - INTERVAL '3 days', NOW()),
  ('30000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'A reliable lawn mower for a weekend', 'I am helping an elderly neighbour tidy their garden and would be grateful to borrow a mower for a day.', (SELECT "id" FROM "categories" WHERE "slug" = 'gardening'), true, 'ACTIVE', NOW() - INTERVAL '2 days', NOW()),
  ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000003', 'A stand mixer to borrow', 'I am testing a few bread recipes and would love to borrow a stand mixer for a weekend.', (SELECT "id" FROM "categories" WHERE "slug" = 'food'), true, 'ACTIVE', NOW() - INTERVAL '5 days', NOW()),
  ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000004', 'Advice on organising old photos', 'Looking for help choosing a simple way to back up and organise several years of family photos.', (SELECT "id" FROM "categories" WHERE "slug" = 'tech'), true, 'ACTIVE', NOW() - INTERVAL '1 day', NOW()),
  ('30000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000005', 'Children''s art supplies', 'I am looking for washable paints, paper, or craft materials for a small school holiday project.', (SELECT "id" FROM "categories" WHERE "slug" = 'arts'), true, 'ACTIVE', NOW() - INTERVAL '4 days', NOW()),
  ('30000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000006', 'Help moving a bookcase', 'I need one extra pair of hands to move a bookcase from one room to another. It should take less than an hour.', (SELECT "id" FROM "categories" WHERE "slug" = 'transport'), true, 'ACTIVE', NOW() - INTERVAL '6 days', NOW()),
  ('30000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000001', 'Beginner bicycle maintenance lesson', 'I would like to learn how to look after my bike and handle basic repairs safely.', (SELECT "id" FROM "categories" WHERE "slug" = 'skills'), true, 'ACTIVE', NOW() - INTERVAL '11 days', NOW()),
  ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000005', 'A simple sewing machine', 'Looking for a working sewing machine to borrow or buy cheaply for basic alterations.', (SELECT "id" FROM "categories" WHERE "slug" = 'arts'), true, 'ACTIVE', NOW() - INTERVAL '13 days', NOW())
ON CONFLICT ("id") DO UPDATE SET
  "user_id" = EXCLUDED."user_id",
  "title" = EXCLUDED."title",
  "description" = EXCLUDED."description",
  "category_id" = EXCLUDED."category_id",
  "open_to_suggestions" = EXCLUDED."open_to_suggestions",
  "status" = EXCLUDED."status",
  "updated_at" = NOW();

-- A small amount of realistic activity makes the demo feel populated.
INSERT INTO "conversations" ("id", "offer_id", "created_at", "updated_at")
VALUES
  ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 hours'),
  ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000003', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day')
ON CONFLICT ("id") DO UPDATE SET "offer_id" = EXCLUDED."offer_id", "updated_at" = EXCLUDED."updated_at";

INSERT INTO "conversation_participants" ("conversation_id", "user_id")
VALUES
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001'),
  ('40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002'),
  ('40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003')
ON CONFLICT ("conversation_id", "user_id") DO NOTHING;

INSERT INTO "messages" ("id", "conversation_id", "sender_id", "content", "created_at")
VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000004', 'Hi Aisha, are any of the herb plants still available?', NOW() - INTERVAL '5 hours'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Yes, I have basil and mint left. They are ready to collect this week.', NOW() - INTERVAL '3 hours'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', 'Daniel, I would love to borrow the drill for a small shelf project next weekend.', NOW() - INTERVAL '2 days'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'That should be fine. Let me know which day works best for you.', NOW() - INTERVAL '1 day')
ON CONFLICT ("id") DO UPDATE SET
  "conversation_id" = EXCLUDED."conversation_id",
  "sender_id" = EXCLUDED."sender_id",
  "content" = EXCLUDED."content";

INSERT INTO "exchanges" (
  "id", "initiator_id", "responder_id", "initiator_offer", "responder_offer", "status", "proposed_at", "agreed_at", "completed_at", "initiator_confirmed", "responder_confirmed"
)
VALUES
  ('60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 'A batch of sourdough rolls', 'Cordless drill for one weekend', 'COMPLETED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '14 days', true, true),
  ('60000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000005', 'Help assembling a wardrobe', 'Knitting wool bundle', 'AGREED', NOW() - INTERVAL '4 days', NOW() - INTERVAL '3 days', NULL, true, false)
ON CONFLICT ("id") DO UPDATE SET
  "initiator_id" = EXCLUDED."initiator_id",
  "responder_id" = EXCLUDED."responder_id",
  "initiator_offer" = EXCLUDED."initiator_offer",
  "responder_offer" = EXCLUDED."responder_offer",
  "status" = EXCLUDED."status",
  "agreed_at" = EXCLUDED."agreed_at",
  "completed_at" = EXCLUDED."completed_at",
  "initiator_confirmed" = EXCLUDED."initiator_confirmed",
  "responder_confirmed" = EXCLUDED."responder_confirmed";

INSERT INTO "feedback" ("id", "exchange_id", "from_user_id", "to_user_id", "would_exchange_again", "comment", "created_at")
VALUES
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', true, 'Daniel was friendly, punctual, and took great care of the drill.', NOW() - INTERVAL '13 days'),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003', true, 'The bread was excellent and the exchange was very easy to arrange.', NOW() - INTERVAL '13 days')
ON CONFLICT ("id") DO UPDATE SET
  "would_exchange_again" = EXCLUDED."would_exchange_again",
  "comment" = EXCLUDED."comment";

COMMIT;
