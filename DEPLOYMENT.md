# Deploying HandtoHand to Vercel

## Prerequisites
- GitHub repository: https://github.com/kanwarsx-prog/HandtoHand ✅
- Supabase project running
- Vercel account

## Step 1: Prepare Environment Variables

You'll need these environment variables from your Supabase project:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get them from: Supabase Dashboard → Project Settings → API

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository: `kanwarsx-prog/HandtoHand`
3. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `web`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
4. Add Environment Variables:
   - Click "Environment Variables"
   - Add `NEXT_PUBLIC_SUPABASE_URL`
   - Add `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click "Deploy"

### Option B: Via Vercel CLI

```bash
cd web
npm install -g vercel
vercel login
vercel --prod
```

When prompted:
- Set up and deploy? **Y**
- Which scope? Select your account
- Link to existing project? **N**
- Project name? **handtohand**
- Directory? **./web**
- Override settings? **N**

Then add environment variables:
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Redeploy:
```bash
vercel --prod
```

## Step 3: Configure Supabase for Production

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel domain to **Redirect URLs**:
   ```
   https://your-app.vercel.app/auth/callback
   ```
3. Add to **Site URL**:
   ```
   https://your-app.vercel.app
   ```

## Step 4: Run Database Migrations

Make sure all SQL migrations have been run in your Supabase project:

1. `enable_rls_offers.sql` ✅
2. `create_messaging.sql` ✅
3. `enable_rls_wishes.sql` ⚠️ **Run this if not done yet**
4. `complete_rls_fix.sql` (for conversations) ✅
5. `auto_create_user_profile.sql` (trigger for user creation) ⚠️ **Important!**

## Step 5: Test Production Deployment

1. Visit your Vercel URL
2. Sign up / Sign in
3. Create an offer
4. Create a wish
5. Check matches
6. Test messaging

## Troubleshooting

### Build Fails
- Check that all dependencies are in `web/package.json`
- Verify TypeScript errors locally first: `npm run build`

### Authentication Not Working
- Verify Supabase redirect URLs include your Vercel domain
- Check environment variables are set correctly

### Database Errors
- Ensure all RLS policies are enabled
- Run missing migrations in Supabase SQL Editor

## Post-Deployment

### Custom Domain (Optional)
1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update Supabase redirect URLs with custom domain

### Monitoring
- Check Vercel Analytics for traffic
- Monitor Supabase Dashboard for database usage
- Set up error tracking (optional: Sentry)

## Environment Variables Reference

| Variable | Description | Where to Find |
|----------|-------------|---------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key | Supabase → Settings → API |

---

**Your app will be live at**: `https://handtohand-[random].vercel.app`

You can customize the domain in Vercel settings!
