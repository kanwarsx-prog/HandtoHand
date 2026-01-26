# HandtoHand - Next Steps

## ✅ Supabase Project Connected!

Your Supabase project is configured:
- **Project URL**: `https://vezbnfgtjpadksammaw.supabase.co`
- **Anon Key**: ✓ Configured

## 🔑 Get Missing Keys

You still need two more things from your Supabase dashboard:

### 1. Service Role Key (Secret!)

1. Go to: https://supabase.com/dashboard/project/vezbnfgtjpadksammaw/settings/api
2. Scroll to **Project API keys**
3. Copy the **service_role** key (keep this secret!)
4. You'll add this to your `.env.local` file

### 2. Database Password

1. Go to: https://supabase.com/dashboard/project/vezbnfgtjpadksammaw/settings/database
2. Scroll to **Connection string**
3. Click **URI** tab
4. Copy the connection string
5. Replace `[YOUR-PASSWORD]` with your actual database password

## 📝 Create Environment Files

### For Web App

Create `web/.env.local` (copy from `.env.example` and update):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://vezbnfgtjpadksammaw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlemJuZmd0anBhZGtzYW1tbmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDAzNTgsImV4cCI6MjA4NTAxNjM1OH0.XesMCQJwX7CiB5l6UL4cqwljtVEC0QIgBwSkpoemW-4
SUPABASE_SERVICE_ROLE_KEY=<paste-service-role-key-here>

# Database (paste your connection string from Supabase)
DATABASE_URL="postgresql://postgres:<your-password>@db.vezbnfgtjpadksammaw.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:<your-password>@db.vezbnfgtjpadksammaw.supabase.co:5432/postgres"

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### For Mobile App

Create `mobile/.env` (already has the right values in `.env.example`):

```env
EXPO_PUBLIC_SUPABASE_URL=https://vezbnfgtjpadksammaw.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZlemJuZmd0anBhZGtzYW1tbmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0NDAzNTgsImV4cCI6MjA4NTAxNjM1OH0.XesMCQJwX7CiB5l6UL4cqwljtVEC0QIgBwSkpoemW-4
EXPO_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Enable PostGIS in Supabase

1. Go to: https://supabase.com/dashboard/project/vezbnfgtjpadksammaw/sql/new
2. Paste this SQL:

```sql
-- Enable PostGIS for geospatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enable pg_trgm for fuzzy text search
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

3. Click **Run** (or press Ctrl+Enter)

## 🚀 Push Database Schema

Once you have the environment files set up:

```powershell
cd packages\database
npm run db:push
```

This will create all your tables in Supabase!

## ✅ Verify

After pushing the schema, check your tables:
1. Go to: https://supabase.com/dashboard/project/vezbnfgtjpadksammaw/editor
2. You should see tables like: `users`, `offers`, `wishes`, `messages`, etc.

## 🎯 Then Start Development

```powershell
# Terminal 1
npm run dev:web

# Terminal 2  
npm run dev:mobile
```

---

**Need help?** Just let me know which step you're on!
