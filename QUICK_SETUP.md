# HandtoHand - Quick Setup with Cloud Supabase

This guide will get you running with a cloud Supabase project (no Docker needed!).

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click **"New Project"**
4. Fill in:
   - **Name**: `handtohand-dev`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: Free tier is fine for development
5. Click **"Create new project"**
6. Wait ~2 minutes for provisioning

## Step 2: Get Your API Keys

Once your project is ready:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## Step 3: Set Up Environment Variables

### For Web App (`web/.env.local`)

Create `web/.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database (for Prisma)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

**To get the DATABASE_URL:**
1. Go to **Project Settings** → **Database**
2. Scroll to **Connection string** → **URI**
3. Copy and replace `[YOUR-PASSWORD]` with your database password

### For Mobile App (`mobile/.env`)

Create `mobile/.env` with:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# App
EXPO_PUBLIC_APP_URL=http://localhost:3000
```

## Step 4: Enable PostGIS Extension

1. Go to **SQL Editor** in Supabase dashboard
2. Click **"New query"**
3. Paste and run:

```sql
-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

4. Click **"Run"** (or press Ctrl+Enter)

## Step 5: Push Database Schema

```powershell
cd packages\database
npm install
npm run db:push
```

This will create all your tables in Supabase!

## Step 6: Verify in Supabase

1. Go to **Table Editor** in Supabase dashboard
2. You should see all your tables:
   - users
   - offers
   - wishes
   - categories
   - conversations
   - messages
   - exchanges
   - feedback
   - blocks
   - reports
   - analytics_events

## Step 7: Install Dependencies

```powershell
# Web app
cd web
npm install

# Mobile app
cd ..\mobile
npm install
```

## Step 8: Start Development

```powershell
# Terminal 1: Web app
npm run dev:web

# Terminal 2: Mobile app
npm run dev:mobile
```

**Web**: Open http://localhost:3000
**Mobile**: Scan QR code with Expo Go app

## Next Steps

### Set Up Storage Buckets

1. Go to **Storage** in Supabase dashboard
2. Click **"Create bucket"**
3. Create two buckets:
   - **Name**: `avatars`, **Public**: ✓
   - **Name**: `offer-photos`, **Public**: ✓

### Set Up Row Level Security (RLS)

See `SUPABASE_VERCEL_SETUP.md` for RLS policy examples, or we can add them as we build features.

## Troubleshooting

### "Can't reach database"
- Check your `DATABASE_URL` has the correct password
- Verify your IP is allowed (Supabase → Project Settings → Database → Connection pooling)

### Prisma errors
```powershell
cd packages\database
npm run db:generate
```

### Need to reset database?
```powershell
cd packages\database
npm run db:push -- --force-reset
```

## Advantages of Cloud Supabase

✅ No Docker required
✅ No local setup
✅ Accessible from anywhere
✅ Built-in database backups
✅ Supabase Studio UI
✅ Real-time subscriptions ready
✅ Storage buckets ready
✅ Auth ready to use

## Cost

**Free tier includes:**
- 500MB database
- 1GB file storage
- 2GB bandwidth
- Unlimited API requests

Perfect for development! Upgrade to Pro ($25/mo) when you launch.

---

**Total setup time**: ~10 minutes 🚀
