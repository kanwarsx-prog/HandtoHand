# HandtoHand - Local Exchange MVP

A money-free local exchange platform built with Supabase and Vercel.

## Project Structure

```
HandtoHand/
├── web/                    # Next.js web app
├── mobile/                 # Expo React Native app
├── packages/
│   ├── database/          # Prisma schema & migrations
│   ├── shared/            # Shared types & utilities
│   └── api-client/        # API client library
├── supabase/              # Supabase config & migrations
└── docs/                  # Documentation
```

## Quick Start

### Prerequisites

- Node.js 20+
- Supabase account (free tier)

### Setup (10 minutes)

**See [QUICK_SETUP.md](./QUICK_SETUP.md) for detailed instructions.**

Quick version:

1. **Create Supabase project** at [supabase.com](https://supabase.com)

2. **Set up environment variables**
   ```powershell
   # Copy your Supabase URL and keys to:
   # - web/.env.local
   # - mobile/.env
   ```

3. **Enable PostGIS** (run in Supabase SQL Editor)
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

4. **Push database schema**
   ```powershell
   cd packages\database
   npm install
   npm run db:push
   ```

5. **Start development**
   ```powershell
   npm run dev:web     # Terminal 1
   npm run dev:mobile  # Terminal 2
   ```

### Alternative: Local Supabase

If you prefer local development with Docker, see [GETTING_STARTED.md](./GETTING_STARTED.md).

## Documentation

- **[Quick Setup](./QUICK_SETUP.md)** - Get running in 10 minutes (cloud Supabase)
- **[Getting Started](./GETTING_STARTED.md)** - Local development with Docker
- **[Project Summary](./PROJECT_SUMMARY.md)** - What's been built
- [Technical Design](./TECHNICAL_DESIGN.md) - Complete architecture
- [Supabase & Vercel Setup](./SUPABASE_VERCEL_SETUP.md) - Production deployment
- [Product Design](./local_exchange_mvp_product_design_phase_1.md) - Product requirements

## Tech Stack

- **Frontend**: Next.js 14 (web), Expo (mobile)
- **Backend**: Vercel Serverless Functions
- **Database**: Supabase (PostgreSQL + PostGIS)
- **Auth**: Supabase Auth
- **Storage**: Supabase Storage
- **Cache**: Upstash Redis
- **Email**: Resend

## Development

```bash
# Run linting
npm run lint

# Run type checking
npm run type-check

# Run tests
npm run test

# Open Prisma Studio
npm run db:studio

# View Supabase Studio
npm run supabase:status
# Then open the Studio URL
```

## Deployment

See [SUPABASE_VERCEL_SETUP.md](./SUPABASE_VERCEL_SETUP.md) for deployment instructions.

## License

Private - All Rights Reserved
