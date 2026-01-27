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

## Updates (If you already set up DB)

### Update 1: Notifications Table
If you have already set up the database, run this SQL to add the notifications system:

```sql
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

ALTER TABLE "notifications" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON "notifications"
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert notifications" ON "notifications"
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own notifications" ON "notifications"
    FOR UPDATE USING (auth.uid() = user_id);
```
