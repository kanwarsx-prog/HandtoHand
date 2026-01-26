# HandtoHand MVP - Getting Started

This guide will help you get the HandtoHand MVP running locally.

## Prerequisites

Before you begin, ensure you have:
- ✅ Node.js 20+ installed
- ✅ Git installed
- ⬜ Docker Desktop installed (for Supabase)
- ⬜ Supabase CLI installed

## Step 1: Install Supabase CLI

### Windows (PowerShell)
```powershell
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase
```

### macOS
```bash
brew install supabase/tap/supabase
```

### Linux
```bash
brew install supabase/tap/supabase
```

## Step 2: Set Up Environment

Run the setup script to create environment files:

```powershell
.\setup.ps1
```

This will create:
- `web/.env.local` from `.env.example`
- `mobile/.env` from `mobile/.env.example`

## Step 3: Start Supabase

```powershell
supabase start
```

This will output something like:
```
API URL: http://localhost:54321
DB URL: postgresql://postgres:postgres@localhost:54322/postgres
Studio URL: http://localhost:54323
anon key: eyJ...
service_role key: eyJ...
```

**IMPORTANT**: Copy the `anon key` and `service_role key` and update your environment files:
- `web/.env.local`: Update `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `SUPABASE_SERVICE_ROLE_KEY`
- `mobile/.env`: Update `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## Step 4: Install Dependencies

```powershell
# Install root dependencies
npm install

# Install web dependencies
cd web
npm install
cd ..

# Install mobile dependencies
cd mobile
npm install
cd ..

# Install database package dependencies
cd packages/database
npm install
cd ../..
```

## Step 5: Push Database Schema

```powershell
cd packages/database
npm run db:push
```

This will:
1. Create all tables in your local Supabase database
2. Generate the Prisma client

## Step 6: Seed Initial Data (Optional)

```powershell
cd packages/database
npm run db:seed
```

## Step 7: Start Development Servers

Open 3 terminal windows:

### Terminal 1: Web App
```powershell
npm run dev:web
```
Open http://localhost:3000

### Terminal 2: Mobile App
```powershell
npm run dev:mobile
```
Scan the QR code with Expo Go app

### Terminal 3: Supabase Studio (Optional)
Already running at http://localhost:54323

## Troubleshooting

### Supabase won't start
- Make sure Docker Desktop is running
- Try `supabase stop` then `supabase start`

### Database connection errors
- Check that Supabase is running: `supabase status`
- Verify `DATABASE_URL` in `web/.env.local` matches the DB URL from `supabase start`

### Prisma errors
- Try regenerating the client: `cd packages/database && npm run db:generate`
- Reset the database: `npm run db:push -- --force-reset`

## Next Steps

Once everything is running:
1. Open Supabase Studio at http://localhost:54323
2. Explore the database tables
3. Start building features!

## Useful Commands

```powershell
# View Supabase status
supabase status

# Stop Supabase
supabase stop

# View database in Prisma Studio
cd packages/database
npm run db:studio

# Run linting
npm run lint

# Run type checking
npm run type-check
```

## Project Structure

```
HandtoHand/
├── web/                    # Next.js web app
│   ├── app/               # App router pages
│   ├── lib/               # Utilities & Supabase client
│   └── components/        # React components
├── mobile/                 # Expo mobile app
│   ├── app/               # Expo router pages
│   ├── lib/               # Utilities & Supabase client
│   └── components/        # React Native components
├── packages/
│   └── database/          # Prisma schema & client
│       ├── prisma/        # Schema definition
│       └── src/           # Prisma client export
└── supabase/              # Supabase config & migrations
    ├── config.toml        # Local config
    └── migrations/        # SQL migrations
```

## Documentation

- [Technical Design](./TECHNICAL_DESIGN.md) - Complete system architecture
- [Supabase & Vercel Setup](./SUPABASE_VERCEL_SETUP.md) - Deployment guide
- [Product Design](./local_exchange_mvp_product_design_phase_1.md) - Product requirements

Happy coding! 🚀
