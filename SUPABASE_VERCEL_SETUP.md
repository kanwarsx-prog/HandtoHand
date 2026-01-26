# HandtoHand MVP - Supabase & Vercel Setup Guide

## Quick Start

This guide walks through setting up the HandtoHand MVP using Supabase (database, auth, storage) and Vercel (web hosting).

---

## Prerequisites

- Node.js 20+ installed
- Git installed
- GitHub account
- Supabase account (free tier to start)
- Vercel account (free tier to start)

---

## 1. Supabase Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project"
3. Create new organization (if needed)
4. Create new project:
   - **Name**: `handtohand-dev` (for development)
   - **Database Password**: Generate strong password (save securely)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier for development

### 1.2 Enable PostGIS Extension

```sql
-- Run in Supabase SQL Editor
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS pg_trgm;
```

### 1.3 Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional customization)
4. Set **Site URL**: `http://localhost:3000` (development)
5. Add **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (production)

### 1.4 Create Storage Buckets

```sql
-- Run in Supabase SQL Editor or use Dashboard

-- Create buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('avatars', 'avatars', true),
  ('offer-photos', 'offer-photos', true);

-- Set up RLS policies for avatars
CREATE POLICY "Users can upload own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- Set up RLS policies for offer photos
CREATE POLICY "Users can upload offer photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'offer-photos' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Anyone can view offer photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'offer-photos');
```

### 1.5 Get API Keys

1. Go to **Project Settings** → **API**
2. Copy the following (save in `.env.local`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## 2. Local Development Setup

### 2.1 Install Supabase CLI

```bash
# macOS
brew install supabase/tap/supabase

# Windows (PowerShell)
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

### 2.2 Initialize Supabase in Project

```bash
# Navigate to project root
cd HandtoHand

# Initialize Supabase
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Pull remote schema (if exists)
supabase db pull
```

### 2.3 Start Local Supabase

```bash
# Start local Supabase (Docker required)
supabase start

# This will output:
# - API URL: http://localhost:54321
# - DB URL: postgresql://postgres:postgres@localhost:54322/postgres
# - Studio URL: http://localhost:54323
# - Anon key: eyJ...
# - Service role key: eyJ...
```

### 2.4 Environment Variables

Create `.env.local`:

```bash
# Supabase (use local values for development)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... # from supabase start output
SUPABASE_SERVICE_ROLE_KEY=eyJ... # from supabase start output

# For production, use your Supabase project values
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
# SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Redis (Upstash for serverless)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Email (Resend)
RESEND_API_KEY=re_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Database Schema Setup

### 3.1 Install Dependencies

```bash
npm install @prisma/client @supabase/supabase-js
npm install -D prisma
```

### 3.2 Initialize Prisma

```bash
npx prisma init
```

### 3.3 Configure Prisma

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations
}

generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}
```

Update `.env`:

```bash
# Local development
DATABASE_URL="postgresql://postgres:postgres@localhost:54322/postgres"
DIRECT_URL="postgresql://postgres:postgres@localhost:54322/postgres"

# Production (from Supabase dashboard)
# DATABASE_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
# DIRECT_URL="postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres"
```

### 3.4 Create Schema

Copy the Prisma schema from `TECHNICAL_DESIGN.md` Section 3.1 into `prisma/schema.prisma`.

### 3.5 Push Schema to Database

```bash
# Push schema to local Supabase
npx prisma db push

# Generate Prisma client
npx prisma generate
```

### 3.6 Create Migration

```bash
# Generate migration SQL
npx supabase db diff -f create_initial_schema

# This creates: supabase/migrations/[timestamp]_create_initial_schema.sql
```

### 3.7 Add RLS Policies

Create `supabase/migrations/[timestamp]_enable_rls.sql`:

```sql
-- Copy RLS policies from TECHNICAL_DESIGN.md Section 3.2
```

### 3.8 Apply Migrations

```bash
# Apply to local
npx supabase db reset

# Apply to remote (staging/production)
npx supabase db push --linked
```

---

## 4. Vercel Setup

### 4.1 Install Vercel CLI

```bash
npm install -g vercel
```

### 4.2 Login to Vercel

```bash
vercel login
```

### 4.3 Link Project

```bash
# From project root
vercel link

# Follow prompts:
# - Set up and deploy? No (we'll configure first)
# - Which scope? Your account
# - Link to existing project? No
# - Project name? handtohand
# - Directory? ./
```

### 4.4 Configure Environment Variables

```bash
# Add environment variables to Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add RESEND_API_KEY

# Or use Vercel dashboard: Project Settings → Environment Variables
```

### 4.5 Deploy

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 5. Mobile App Setup (Expo)

### 5.1 Create Expo Project

```bash
npx create-expo-app@latest mobile --template blank-typescript
cd mobile
```

### 5.2 Install Dependencies

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage
npx expo install expo-router react-native-safe-area-context react-native-screens
npx expo install @tanstack/react-query zustand
npx expo install react-hook-form zod
npx expo install expo-image-picker expo-location
```

### 5.3 Configure Supabase Client

Create `lib/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### 5.4 Environment Variables

Create `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

---

## 6. Development Workflow

### 6.1 Start Development Servers

```bash
# Terminal 1: Start local Supabase
supabase start

# Terminal 2: Start Next.js web app
cd web
npm run dev

# Terminal 3: Start Expo mobile app
cd mobile
npx expo start
```

### 6.2 Database Changes

```bash
# 1. Update Prisma schema
# Edit prisma/schema.prisma

# 2. Push to database
npx prisma db push

# 3. Generate migration
npx supabase db diff -f migration_name

# 4. Apply migration
npx supabase db reset

# 5. Regenerate Prisma client
npx prisma generate
```

### 6.3 Testing Locally

```bash
# Run tests
npm run test

# Run integration tests (requires local Supabase)
npm run test:integration

# Type check
npm run type-check

# Lint
npm run lint
```

---

## 7. Deployment Checklist

### 7.1 Pre-Production

- [ ] Create production Supabase project
- [ ] Enable PostGIS extension
- [ ] Configure auth providers
- [ ] Create storage buckets with RLS
- [ ] Run migrations on production database
- [ ] Verify RLS policies
- [ ] Set up production environment variables in Vercel
- [ ] Configure custom domain in Vercel
- [ ] Set up Sentry for error tracking
- [ ] Configure Resend for emails

### 7.2 Production Deployment

```bash
# Deploy to Vercel production
vercel --prod

# Run production migrations
npx supabase db push --linked --db-url "postgresql://..."

# Verify deployment
curl https://yourdomain.com/api/health
```

### 7.3 Post-Deployment

- [ ] Verify auth flow works
- [ ] Test file uploads to Supabase Storage
- [ ] Check email delivery
- [ ] Monitor error rates in Sentry
- [ ] Verify database performance in Supabase dashboard
- [ ] Test mobile app against production API

---

## 8. Useful Commands

### Supabase

```bash
# Start local instance
supabase start

# Stop local instance
supabase stop

# Reset database (destructive!)
supabase db reset

# Generate migration from changes
supabase db diff -f migration_name

# Push migrations to remote
supabase db push --linked

# Pull remote schema
supabase db pull

# View local Studio
open http://localhost:54323
```

### Vercel

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod

# View logs
vercel logs

# List deployments
vercel ls

# Pull environment variables
vercel env pull .env.local
```

### Prisma

```bash
# Generate client
npx prisma generate

# Push schema (dev only)
npx prisma db push

# Open Prisma Studio
npx prisma studio

# Format schema
npx prisma format
```

---

## 9. Troubleshooting

### Supabase Connection Issues

```bash
# Check if Supabase is running
supabase status

# Restart Supabase
supabase stop
supabase start

# Check Docker containers
docker ps
```

### Prisma Issues

```bash
# Clear Prisma cache
rm -rf node_modules/.prisma

# Regenerate client
npx prisma generate

# Reset database
npx prisma db push --force-reset
```

### Vercel Deployment Failures

```bash
# Check build logs
vercel logs [deployment-url]

# Test build locally
vercel build

# Check environment variables
vercel env ls
```

---

## 10. Cost Estimates

### Supabase (MVP Phase)

- **Free Tier**: 500MB database, 1GB storage, 2GB bandwidth
  - Good for initial development and testing
- **Pro Plan ($25/mo)**: 8GB database, 100GB storage, 250GB bandwidth
  - Recommended for production launch
  - Includes daily backups, 7-day PITR

### Vercel (MVP Phase)

- **Hobby (Free)**: 100GB bandwidth, serverless functions
  - Good for development and small-scale testing
- **Pro ($20/mo)**: 1TB bandwidth, advanced analytics
  - Recommended for production launch

### Upstash Redis

- **Free Tier**: 10,000 commands/day
  - Sufficient for MVP
- **Pay-as-you-go**: $0.2 per 100K commands
  - Scale as needed

### Resend Email

- **Free Tier**: 100 emails/day
  - Good for testing
- **Pro ($20/mo)**: 50,000 emails/month
  - Recommended for production

**Total Estimated Cost (Production MVP)**: ~$65-85/month

---

## 11. Next Steps

1. Follow this guide to set up local development
2. Implement authentication flow (see `TECHNICAL_DESIGN.md` Section 6)
3. Build core features following `implementation_plan.md`
4. Test thoroughly on staging environment
5. Deploy to production
6. Monitor and iterate

---

**Last Updated**: 2026-01-26  
**Version**: 1.0
