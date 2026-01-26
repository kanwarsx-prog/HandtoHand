# 🎯 Run This SQL in Supabase

## Step 1: Open Supabase SQL Editor

Go to: https://supabase.com/dashboard/project/vezbnfgtjpadksammaw/sql/new

## Step 2: Copy & Paste the SQL

1. Open the file: `supabase/schema.sql`
2. Copy ALL the contents (Ctrl+A, Ctrl+C)
3. Paste into the Supabase SQL Editor
4. Click **Run** (or press Ctrl+Enter)

This will create:
- ✅ 6 Enums (UserStatus, OfferStatus, etc.)
- ✅ 15 Tables (users, offers, messages, exchanges, etc.)
- ✅ All indexes for performance
- ✅ Foreign key relationships
- ✅ Triggers for updated_at timestamps

## Step 3: Verify Tables Created

After running the SQL, go to:
https://supabase.com/dashboard/project/vezbnfgtjpadksammaw/editor

You should see all these tables:
- users
- categories
- user_categories
- offers
- offer_photos
- wishes
- conversations
- conversation_participants
- messages
- exchanges
- feedback
- blocks
- reports
- analytics_events

## Step 4: Generate Prisma Client

Once the tables are created, run:

```powershell
cd packages\database
npx prisma db pull
npx prisma generate
```

This will:
1. Pull the schema from Supabase into Prisma
2. Generate the TypeScript client for type-safe database access

## Step 5: Start Development! 🚀

```powershell
# Terminal 1: Web app
npm run dev:web

# Terminal 2: Mobile app
npm run dev:mobile
```

---

**That's it!** Your database is ready to use.

The SQL file is at: `supabase/schema.sql`
