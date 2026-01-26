# HandtoHand Local Exchange Platform – Technical Design Document

> **Document Purpose**  
> This is a comprehensive technical architecture and implementation guide for the HandtoHand MVP. It translates the product requirements into a buildable system while preserving the core principles: no money, no forced equivalence, trust-first, local-first.

---

## Table of Contents

1. [System Architecture Overview](#1-system-architecture-overview)
2. [Technology Stack](#2-technology-stack)
3. [Data Models & Database Schema](#3-data-models--database-schema)
4. [API Design & Endpoints](#4-api-design--endpoints)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Search & Discovery Engine](#7-search--discovery-engine)
8. [Messaging System](#8-messaging-system)
9. [Safety & Moderation](#9-safety--moderation)
10. [Notifications](#10-notifications)
11. [File Storage & Media](#11-file-storage--media)
12. [Analytics & Monitoring](#12-analytics--monitoring)
13. [Security & Privacy](#13-security--privacy)
14. [Deployment & Infrastructure](#14-deployment--infrastructure)
15. [Testing Strategy](#15-testing-strategy)
16. [Performance Considerations](#16-performance-considerations)
17. [Development Roadmap](#17-development-roadmap)

---

## 1. System Architecture Overview

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                          │
├──────────────────────────┬──────────────────────────────────┤
│   Mobile App (Expo)      │      Web App (Next.js)           │
│   - React Native         │      - React 18+                 │
│   - Expo Router          │      - App Router                │
│   - React Query          │      - React Query               │
└──────────────┬───────────┴──────────────┬───────────────────┘
               │                          │
               └──────────┬───────────────┘
                          │ HTTPS/WSS
               ┌──────────▼──────────────────────────────────┐
               │         API GATEWAY / LOAD BALANCER         │
               │         (nginx / Cloudflare)                │
               └──────────┬──────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
┌───────▼────────┐ ┌─────▼──────┐ ┌───────▼────────┐
│   REST API     │ │  WebSocket │ │  Background    │
│   Server       │ │  Server    │ │  Workers       │
│   (Node.js)    │ │  (Socket.io│ │  (Bull Queue)  │
└───────┬────────┘ └─────┬──────┘ └───────┬────────┘
        │                │                │
        └────────┬───────┴────────┬───────┘
                 │                │
        ┌────────▼────────────────▼────────┐
        │      APPLICATION LAYER            │
        │  - Business Logic                 │
        │  - Service Layer                  │
        │  - Validation                     │
        └────────┬──────────────────────────┘
                 │
        ┌────────┼──────────────────┐
        │        │                  │
┌───────▼────┐ ┌▼──────────┐ ┌────▼─────────┐
│ PostgreSQL │ │   Redis    │ │ Object Store │
│  Primary   │ │  - Cache   │ │   (S3/R2)    │
│  Database  │ │  - Sessions│ │  - Images    │
│            │ │  - Queues  │ │  - Avatars   │
└────────────┘ └────────────┘ └──────────────┘
```

### 1.2 Design Principles

- **Simplicity First**: No over-engineering, no premature optimization
- **Local-First**: Data locality and proximity are core features
- **Privacy by Design**: Minimal data collection, coarse location only
- **Fail-Safe**: Graceful degradation, no critical dependencies on real-time features
- **Monolith-First**: Start with a well-structured monolith, extract services only when needed

---

## 2. Technology Stack

### 2.1 Frontend

**Mobile (Primary)**
- **Framework**: React Native with Expo SDK 50+
- **Navigation**: Expo Router (file-based routing)
- **State Management**: React Query v5 + Zustand (minimal global state)
- **UI Components**: Custom components + React Native Paper (Material Design)
- **Forms**: React Hook Form + Zod validation
- **Maps**: react-native-maps (for location selection)

**Web (Secondary)**
- **Framework**: Next.js 14+ (App Router)
- **State Management**: React Query v5 + Zustand
- **UI Components**: Shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod validation
- **Maps**: Mapbox GL JS

### 2.2 Backend

**API Server**
- **Runtime**: Node.js 20 LTS
- **Framework**: Express.js or Fastify (for performance)
- **Language**: TypeScript (strict mode)
- **Validation**: Zod (shared schemas with frontend)
- **ORM**: Prisma (type-safe database access)

**Real-Time**
- **WebSocket**: Socket.io (for messaging)
- **Fallback**: Long polling for unreliable connections

**Background Jobs**
- **Queue**: Bull (Redis-backed)
- **Scheduler**: node-cron
- **Use Cases**: Email sending, image processing, analytics aggregation

### 2.3 Data Layer

**Primary Database**
- **System**: PostgreSQL 15+ (Supabase)
- **Extensions**: PostGIS (geospatial), pg_trgm (fuzzy search)
- **Hosting**: Supabase (fully managed)
- **Benefits**: Built-in auth, real-time subscriptions, auto-generated REST API

**Cache & Session Store**
- **System**: Redis 7+ (Upstash)
- **Use Cases**: Session storage, rate limiting, caching, job queues
- **Integration**: Serverless-friendly, works with Vercel Edge

**Object Storage**
- **System**: Supabase Storage (S3-compatible)
- **Use Cases**: User photos, listing images, profile avatars
- **Benefits**: Integrated with Supabase auth, automatic image transformations

### 2.4 Infrastructure

**Hosting**
- **API**: Vercel Serverless Functions (Node.js)
- **Web**: Vercel (Next.js)
- **Mobile**: Expo EAS (build and updates)
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Storage**: Supabase Storage

**Monitoring**
- **APM**: Sentry (error tracking)
- **Logs**: Vercel Logs + Supabase Logs
- **Metrics**: Internal analytics (no third-party tracking)

**Email**
- **Provider**: Resend (built for Vercel)
- **Use Cases**: Verification, notifications, password reset

---

## 3. Data Models & Database Schema

### 3.1 Core Entities

#### User
```typescript
model User {
  id                String      @id @default(uuid())  // Matches Supabase auth.users.id
  email             String      @unique
  displayName       String
  profilePhoto      String?     // URL to Supabase Storage
  postcodeOutward   String      // e.g., "BR6" (required)
  postcodeFull      String?     // Full postcode (optional, for precise matching)
  bio               String?     @db.Text
  location          Geometry?   @type("geography(Point,4326)") // PostGIS
  
  // Note: email, emailVerified, and password managed by Supabase Auth
  // Link to auth.users via: auth.uid() = users.id
  
  // Privacy
  showFullPostcode  Boolean     @default(false)
  
  // Status
  status            UserStatus  @default(ACTIVE)
  deletedAt         DateTime?
  
  // Metadata
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt
  lastActiveAt      DateTime    @default(now())
  
  // Relations
  offers            Offer[]
  wishes            Wish[]
  messagesSent      Message[]   @relation("SentMessages")
  conversations     ConversationParticipant[]
  exchanges         Exchange[]  @relation("UserExchanges")
  blockedUsers      Block[]     @relation("Blocker")
  blockedBy         Block[]     @relation("Blocked")
  reports           Report[]
  feedback          Feedback[]  @relation("FeedbackGiven")
  receivedFeedback  Feedback[]  @relation("FeedbackReceived")
  categories        UserCategory[]
}

enum UserStatus {
  ACTIVE
  SUSPENDED
  BANNED
  DELETED
}
```

#### Offer (What I Have)
```typescript
model Offer {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  
  title           String
  description     String        @db.Text
  categoryId      String
  category        Category      @relation(fields: [categoryId], references: [id])
  
  // Media
  photos          OfferPhoto[]
  
  // Availability
  availability    String?       @db.Text // Free text: "Weekends", "Flexible", etc.
  
  // Location
  locationRadius  Int           @default(5) // km
  location        Geometry?     @type("geography(Point,4326)")
  
  // Status
  status          OfferStatus   @default(ACTIVE)
  
  // Metadata
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
  viewCount       Int           @default(0)
  
  // Relations
  exchanges       Exchange[]
  reports         Report[]
  
  @@index([userId, status])
  @@index([categoryId, status])
  @@index([status, updatedAt])
  @@index([location]) @map("idx_offer_location") @type("gist")
}

enum OfferStatus {
  ACTIVE
  PAUSED
  ARCHIVED
  REMOVED
}

model OfferPhoto {
  id        String   @id @default(cuid())
  offerId   String
  offer     Offer    @relation(fields: [offerId], references: [id], onDelete: Cascade)
  url       String
  order     Int
  createdAt DateTime @default(now())
  
  @@index([offerId, order])
}
```

#### Wish (What I'm Open To)
```typescript
model Wish {
  id                  String      @id @default(cuid())
  userId              String
  user                User        @relation(fields: [userId], references: [id])
  
  title               String
  description         String      @db.Text
  categoryId          String?
  category            Category?   @relation(fields: [categoryId], references: [id])
  
  openToSuggestions   Boolean     @default(true)
  
  status              WishStatus  @default(ACTIVE)
  
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  
  @@index([userId, status])
  @@index([categoryId, status])
}

enum WishStatus {
  ACTIVE
  PAUSED
  ARCHIVED
}
```

#### Category
```typescript
model Category {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  icon        String?   // Icon name or emoji
  order       Int       @default(0)
  
  offers      Offer[]
  wishes      Wish[]
  users       UserCategory[]
  
  @@index([slug])
}

model UserCategory {
  userId     String
  categoryId String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@id([userId, categoryId])
}
```

#### Messaging
```typescript
model Conversation {
  id            String                    @id @default(cuid())
  
  // Context
  offerId       String?
  offer         Offer?                    @relation(fields: [offerId], references: [id])
  
  createdAt     DateTime                  @default(now())
  updatedAt     DateTime                  @updatedAt
  
  participants  ConversationParticipant[]
  messages      Message[]
  
  @@index([offerId])
}

model ConversationParticipant {
  conversationId  String
  userId          String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  user            User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  lastReadAt      DateTime      @default(now())
  joinedAt        DateTime      @default(now())
  
  @@id([conversationId, userId])
  @@index([userId])
}

model Message {
  id              String        @id @default(cuid())
  conversationId  String
  conversation    Conversation  @relation(fields: [conversationId], references: [id], onDelete: Cascade)
  
  senderId        String
  sender          User          @relation("SentMessages", fields: [senderId], references: [id])
  
  content         String        @db.Text
  
  // Metadata
  createdAt       DateTime      @default(now())
  editedAt        DateTime?
  
  // Moderation
  flagged         Boolean       @default(false)
  flagReason      String?
  
  @@index([conversationId, createdAt])
  @@index([senderId])
}
```

#### Exchange
```typescript
model Exchange {
  id              String          @id @default(cuid())
  
  // Participants
  initiatorId     String
  initiator       User            @relation("UserExchanges", fields: [initiatorId], references: [id])
  responderId     String
  responder       User            @relation("UserExchanges", fields: [responderId], references: [id])
  
  // What's being exchanged (free text or linked offers)
  initiatorOffer  String?         @db.Text
  responderOffer  String?         @db.Text
  initiatorOfferId String?
  responderOfferId String?
  
  // Lifecycle
  status          ExchangeStatus  @default(PROPOSED)
  
  proposedAt      DateTime        @default(now())
  agreedAt        DateTime?
  completedAt     DateTime?
  
  // Completion confirmation
  initiatorConfirmed Boolean      @default(false)
  responderConfirmed Boolean      @default(false)
  
  // Relations
  feedback        Feedback[]
  
  @@index([initiatorId, status])
  @@index([responderId, status])
  @@index([status, completedAt])
}

enum ExchangeStatus {
  PROPOSED
  AGREED
  COMPLETED
  CANCELLED
}
```

#### Feedback & Trust
```typescript
model Feedback {
  id              String    @id @default(cuid())
  exchangeId      String
  exchange        Exchange  @relation(fields: [exchangeId], references: [id])
  
  fromUserId      String
  fromUser        User      @relation("FeedbackGiven", fields: [fromUserId], references: [id])
  toUserId        String
  toUser          User      @relation("FeedbackReceived", fields: [toUserId], references: [id])
  
  wouldExchangeAgain Boolean
  comment         String?   @db.Text
  
  createdAt       DateTime  @default(now())
  
  @@unique([exchangeId, fromUserId])
  @@index([toUserId])
}
```

#### Safety & Moderation
```typescript
model Block {
  id          String    @id @default(cuid())
  blockerId   String
  blocker     User      @relation("Blocker", fields: [blockerId], references: [id], onDelete: Cascade)
  blockedId   String
  blocked     User      @relation("Blocked", fields: [blockedId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  
  @@unique([blockerId, blockedId])
  @@index([blockerId])
  @@index([blockedId])
}

model Report {
  id            String      @id @default(cuid())
  reporterId    String
  reporter      User        @relation(fields: [reporterId], references: [id])
  
  // What's being reported
  targetType    ReportTarget
  targetId      String
  
  reason        String
  details       String?     @db.Text
  
  // Moderation
  status        ReportStatus @default(PENDING)
  reviewedBy    String?
  reviewedAt    DateTime?
  resolution    String?     @db.Text
  
  createdAt     DateTime    @default(now())
  
  @@index([status, createdAt])
  @@index([targetType, targetId])
}

enum ReportTarget {
  USER
  OFFER
  MESSAGE
}

enum ReportStatus {
  PENDING
  REVIEWED
  ACTIONED
  DISMISSED
}
```

### 3.2 Supabase Row Level Security (RLS)

**Enable RLS on all tables** for security:

```sql
-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Offers are publicly readable, but only owner can modify
CREATE POLICY "Offers are publicly readable"
ON offers FOR SELECT
USING (true);

CREATE POLICY "Users can create own offers"
ON offers FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own offers"
ON offers FOR UPDATE
USING (auth.uid() = user_id);

-- Messages: only conversation participants can read
CREATE POLICY "Participants can read messages"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants
    WHERE conversation_id = messages.conversation_id
    AND user_id = auth.uid()
  )
);

-- Blocks: users can only see their own blocks
CREATE POLICY "Users can manage own blocks"
ON blocks FOR ALL
USING (auth.uid() = blocker_id);
```

### 3.3 Indexes & Performance

**Critical Indexes**
- Geospatial index on `User.location` and `Offer.location` (GiST)
- Composite indexes on `(status, updatedAt)` for feed queries
- Full-text search indexes on `Offer.title` and `Offer.description` using `pg_trgm`

**Materialized Views** (for analytics)
```sql
CREATE MATERIALIZED VIEW user_stats AS
SELECT 
  u.id,
  COUNT(DISTINCT e.id) FILTER (WHERE e.status = 'COMPLETED') as completed_exchanges,
  COUNT(DISTINCT f.id) FILTER (WHERE f."wouldExchangeAgain" = true) as positive_feedback_count,
  COUNT(DISTINCT f.id) as total_feedback_count
FROM users u
LEFT JOIN exchanges e ON (e."initiatorId" = u.id OR e."responderId" = u.id)
LEFT JOIN feedback f ON f."toUserId" = u.id
GROUP BY u.id;

CREATE UNIQUE INDEX ON user_stats (id);
```

---

## 4. API Design & Endpoints

### 4.1 API Principles

- **RESTful**: Resource-oriented URLs
- **Versioned**: `/api/v1/...`
- **Consistent**: Standard response format
- **Paginated**: Cursor-based pagination for feeds
- **Rate Limited**: Per-user and per-IP limits

### 4.2 Standard Response Format

```typescript
// Success
{
  "success": true,
  "data": { ... },
  "meta": {
    "cursor": "...",
    "hasMore": boolean
  }
}

// Error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

### 4.3 Authentication Endpoints

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
POST   /api/v1/auth/verify-email
POST   /api/v1/auth/resend-verification
POST   /api/v1/auth/forgot-password
POST   /api/v1/auth/reset-password
```

### 4.4 User Endpoints

```
GET    /api/v1/users/me
PATCH  /api/v1/users/me
DELETE /api/v1/users/me
GET    /api/v1/users/:id
GET    /api/v1/users/:id/stats
POST   /api/v1/users/me/categories
DELETE /api/v1/users/me/categories/:categoryId
```

### 4.5 Offer Endpoints

```
GET    /api/v1/offers              # Feed (with filters)
GET    /api/v1/offers/:id
POST   /api/v1/offers
PATCH  /api/v1/offers/:id
DELETE /api/v1/offers/:id
POST   /api/v1/offers/:id/photos
DELETE /api/v1/offers/:id/photos/:photoId
PATCH  /api/v1/offers/:id/status  # pause, archive, activate
GET    /api/v1/offers/mine
```

**Feed Query Parameters**
```typescript
{
  cursor?: string;
  limit?: number; // max 50
  category?: string;
  distance?: number; // km
  lat?: number;
  lng?: number;
  search?: string;
  sortBy?: 'recent' | 'nearest';
}
```

### 4.6 Wish Endpoints

```
GET    /api/v1/wishes
GET    /api/v1/wishes/:id
POST   /api/v1/wishes
PATCH  /api/v1/wishes/:id
DELETE /api/v1/wishes/:id
GET    /api/v1/wishes/mine
```

### 4.7 Messaging Endpoints

```
GET    /api/v1/conversations
GET    /api/v1/conversations/:id
POST   /api/v1/conversations        # Start conversation
POST   /api/v1/conversations/:id/messages
GET    /api/v1/conversations/:id/messages
PATCH  /api/v1/conversations/:id/read
```

### 4.8 Exchange Endpoints

```
POST   /api/v1/exchanges            # Propose exchange
PATCH  /api/v1/exchanges/:id/agree
PATCH  /api/v1/exchanges/:id/complete
PATCH  /api/v1/exchanges/:id/cancel
GET    /api/v1/exchanges/mine
```

### 4.9 Feedback Endpoints

```
POST   /api/v1/feedback
GET    /api/v1/feedback/received
```

### 4.10 Safety Endpoints

```
POST   /api/v1/blocks
DELETE /api/v1/blocks/:userId
GET    /api/v1/blocks

POST   /api/v1/reports
```

### 4.11 Category Endpoints

```
GET    /api/v1/categories
```

### 4.12 Rate Limiting

```typescript
const rateLimits = {
  auth: {
    login: '5 per 15 minutes',
    register: '3 per hour',
    verifyEmail: '5 per hour'
  },
  api: {
    read: '100 per minute',
    write: '30 per minute',
    upload: '10 per hour'
  },
  messaging: {
    send: '20 per minute'
  }
};
```

---

## 5. Frontend Architecture

### 5.1 Mobile App Structure (Expo)

```
app/
├── (auth)/
│   ├── login.tsx
│   ├── register.tsx
│   ├── verify-email.tsx
│   └── forgot-password.tsx
├── (tabs)/
│   ├── index.tsx              # Feed/Discover
│   ├── offers.tsx             # My Offers
│   ├── messages.tsx           # Conversations
│   └── profile.tsx            # Profile
├── offer/
│   ├── [id].tsx               # Offer detail
│   ├── create.tsx             # Create offer
│   └── edit/[id].tsx          # Edit offer
├── wish/
│   ├── create.tsx
│   └── edit/[id].tsx
├── user/[id].tsx              # User profile
├── conversation/[id].tsx      # Chat
└── _layout.tsx                # Root layout
```

### 5.2 Component Architecture

**Atomic Design Pattern**

```
components/
├── atoms/
│   ├── Button.tsx
│   ├── Input.tsx
│   ├── Avatar.tsx
│   ├── Badge.tsx
│   └── Card.tsx
├── molecules/
│   ├── OfferCard.tsx
│   ├── UserCard.tsx
│   ├── MessageBubble.tsx
│   ├── CategoryPill.tsx
│   └── LocationPicker.tsx
├── organisms/
│   ├── OfferFeed.tsx
│   ├── ConversationList.tsx
│   ├── OfferForm.tsx
│   ├── UserProfile.tsx
│   └── ExchangeProposal.tsx
└── templates/
    ├── FeedLayout.tsx
    └── ChatLayout.tsx
```

### 5.3 State Management Strategy

**Server State** (React Query)
- All API data
- Automatic caching and revalidation
- Optimistic updates for mutations

**Client State** (Zustand)
- Auth state (user, token)
- UI state (modals, filters)
- Draft forms

**Local State** (useState/useReducer)
- Component-specific state

### 5.4 Key React Query Hooks

```typescript
// Offers
useOfferFeed(filters)
useOffer(id)
useCreateOffer()
useUpdateOffer()
useMyOffers()

// Messaging
useConversations()
useConversation(id)
useSendMessage()

// User
useCurrentUser()
useUser(id)
useUserStats(id)

// Exchanges
useMyExchanges()
useProposeExchange()
useAgreeExchange()
```

---

## 6. Authentication & Authorization

### 6.1 Authentication Flow (Supabase Auth)

**Registration**
1. User submits email + password + display name
2. Supabase Auth creates user account
3. Supabase sends verification email automatically
4. User clicks link → email verified
5. Additional profile data stored in `users` table (linked by `auth.uid()`)

**Login**
1. User submits email + password to Supabase Auth
2. Supabase validates credentials
3. Supabase issues JWT access token (1 hour) + refresh token (30 days)
4. Tokens stored in secure storage (mobile) or httpOnly cookies (web)
5. Client uses `@supabase/supabase-js` for automatic token management

**Token Refresh**
- Supabase client automatically refreshes tokens
- Built-in session management and persistence

### 6.2 JWT Payload (Supabase)

```typescript
{
  sub: string;              // Supabase auth.users.id (UUID)
  email: string;
  iat: number;
  exp: number;
  role: 'authenticated';    // Supabase role
  aal: 'aal1';             // Authentication assurance level
  app_metadata: {};
  user_metadata: {         // Custom user data
    display_name: string;
  };
}
```

### 6.3 Authorization Rules

**Public** (no auth required)
- View offers feed
- View offer details
- View user profiles (limited info)
- View categories

**Authenticated**
- Create/edit/delete own offers and wishes
- Send messages
- Propose/agree/complete exchanges
- Give feedback
- Block users
- Report content

**Resource Ownership**
- Users can only edit/delete their own offers, wishes
- Users can only mark their own side of exchange as complete

---

## 7. Search & Discovery Engine

### 7.1 Feed Algorithm

**Primary Sort: Local Proximity + Recency**

```sql
SELECT o.*,
  ST_Distance(
    o.location::geography,
    ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326)::geography
  ) / 1000 as distance_km,
  EXTRACT(EPOCH FROM (NOW() - o."updatedAt")) / 3600 as hours_since_update
FROM offers o
WHERE o.status = 'ACTIVE'
  AND o."userId" != :currentUserId
  AND o."userId" NOT IN (SELECT "blockedId" FROM blocks WHERE "blockerId" = :currentUserId)
  AND ST_DWithin(
    o.location::geography,
    ST_SetSRID(ST_MakePoint(:userLng, :userLat), 4326)::geography,
    :radiusMeters
  )
ORDER BY 
  (distance_km * 0.3 + hours_since_update * 0.7) ASC
LIMIT :limit;
```

**Scoring Factors**
- Distance (30% weight)
- Recency (70% weight)
- Category match (boost if user has interest)
- User activity (boost active users)

### 7.2 Search

**Full-Text Search** (PostgreSQL `pg_trgm`)

```sql
CREATE INDEX idx_offer_search ON offers 
USING gin(to_tsvector('english', title || ' ' || description));

CREATE INDEX idx_offer_trigram ON offers 
USING gin(title gin_trgm_ops, description gin_trgm_ops);
```

**Search Query**
```sql
SELECT o.*,
  ts_rank(to_tsvector('english', o.title || ' ' || o.description), 
          plainto_tsquery('english', :query)) as rank,
  similarity(o.title, :query) as title_similarity
FROM offers o
WHERE o.status = 'ACTIVE'
  AND (
    to_tsvector('english', o.title || ' ' || o.description) @@ plainto_tsquery('english', :query)
    OR o.title % :query
    OR o.description % :query
  )
ORDER BY rank DESC, title_similarity DESC;
```

### 7.3 Filters

- **Distance**: 1km, 3km, 5km, 10km, 20km
- **Category**: Single or multiple
- **Open to suggestions**: Boolean
- **Sort**: Recent, Nearest

---

## 8. Messaging System

### 8.1 Architecture

**Hybrid Approach**
- REST API for message history
- WebSocket (Socket.io) for real-time delivery
- Fallback to polling if WebSocket unavailable

### 8.2 WebSocket Events

**Client → Server**
```typescript
'message:send' → { conversationId, content }
'conversation:join' → { conversationId }
'conversation:leave' → { conversationId }
'typing:start' → { conversationId }
'typing:stop' → { conversationId }
```

**Server → Client**
```typescript
'message:new' → { message, conversationId }
'message:read' → { conversationId, userId, timestamp }
'typing:user' → { conversationId, userId, isTyping }
'conversation:updated' → { conversationId }
```

### 8.3 Message Validation

**Content Moderation** (automated)
- Detect money-related terms: `£`, `$`, `€`, `per hour`, `cash`, `payment`
- Detect contact info: phone numbers, emails (warn, don't block)
- Profanity filter (warn only)

**Gentle Nudges**
```typescript
const moneyTerms = ['£', '$', '€', 'per hour', '/hr', 'cash', 'payment', 'pay'];

function validateMessage(content: string): ValidationResult {
  const lowerContent = content.toLowerCase();
  const foundTerms = moneyTerms.filter(term => lowerContent.includes(term));
  
  if (foundTerms.length > 0) {
    return {
      allowed: false,
      warning: "HandtoHand is money-free. Try describing what you can offer instead!"
    };
  }
  
  return { allowed: true };
}
```

### 8.4 Unread Count

**Efficient Unread Tracking**
```sql
SELECT c.id, COUNT(m.id) as unread_count
FROM conversations c
JOIN conversation_participants cp ON cp."conversationId" = c.id
LEFT JOIN messages m ON m."conversationId" = c.id 
  AND m."createdAt" > cp."lastReadAt"
  AND m."senderId" != :userId
WHERE cp."userId" = :userId
GROUP BY c.id;
```

---

## 9. Safety & Moderation

### 9.1 Automated Safeguards

**Money Language Detection**
- Regex patterns for currency symbols and pricing terms
- Block message sending with friendly explanation
- Log attempts for pattern analysis

**Contact Info Detection**
- Detect phone numbers, emails
- Warn but allow (people need to coordinate meetups)

**Spam Detection**
- Rate limiting on message sending
- Duplicate message detection
- New account restrictions (can't message until email verified)

### 9.2 User-Initiated Safety

**Blocking**
- Blocked users can't see each other's offers
- Blocked users can't message each other
- Existing conversations hidden

**Reporting**
- Report user, offer, or message
- Required fields: reason (dropdown), optional details
- Reports go to admin queue

### 9.3 Admin Moderation Tools

**Admin Dashboard** (simple web interface)
```
/admin/reports          # Pending reports
/admin/users/:id        # User details + action history
/admin/offers/:id       # Offer details
/admin/messages/:id     # Message context
```

**Admin Actions**
- Warn user (email notification)
- Remove listing
- Suspend user (temporary)
- Ban user (permanent)
- Dismiss report

**Audit Log**
- All admin actions logged
- Immutable record

---

## 10. Notifications

### 10.1 Notification Types

**Email Notifications** (transactional only)
- Email verification
- Password reset
- New message (digest, not real-time)
- Exchange proposed
- Exchange agreed
- Exchange completed
- Feedback received

**Push Notifications** (mobile only)
- New message
- Exchange status change
- Feedback received

### 10.2 Email Templates

**Design Principles**
- Plain text + simple HTML
- No marketing language
- Clear call-to-action
- Unsubscribe link (except transactional)

**Example: New Message Notification**
```
Subject: New message from [Display Name]

Hi [User],

[Display Name] sent you a message about "[Offer Title]":

"[First 100 chars of message]..."

Reply: [Link to conversation]

---
You can adjust your notification settings here: [Link]
```

### 10.3 Notification Preferences

**User Settings**
```typescript
{
  email: {
    newMessage: 'instant' | 'digest' | 'off',
    exchangeUpdates: boolean,
    feedbackReceived: boolean
  },
  push: {
    newMessage: boolean,
    exchangeUpdates: boolean
  }
}
```

**Default**: Email digest (daily), push enabled

---

## 11. File Storage & Media

### 11.1 Image Upload Flow (Supabase Storage)

**Client-Side Upload**
1. User selects image
2. Client validates (size < 5MB, format: jpg/png/webp)
3. Client uploads directly to Supabase Storage using `@supabase/storage-js`
4. Supabase Storage automatically enforces RLS policies
5. Client receives public URL and saves to database

**Example Code**
```typescript
// Upload to Supabase Storage
const { data, error } = await supabase.storage
  .from('offer-photos')
  .upload(`${userId}/${offerId}/${photoId}.webp`, file, {
    cacheControl: '3600',
    upsert: false
  });

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('offer-photos')
  .getPublicUrl(data.path);

// Save to database
await supabase.from('offer_photos').insert({
  offer_id: offerId,
  url: publicUrl,
  order: 0
});
```

**Storage Buckets**
- `avatars` - User profile photos (public)
- `offer-photos` - Offer images (public)
- RLS policies enforce user can only upload to their own folders

### 11.2 Image Processing (Supabase Storage Transformations)

**On-the-Fly Image Transformations**
Supabase Storage provides automatic image transformations via URL parameters:

```typescript
// Original image
https://{project}.supabase.co/storage/v1/object/public/offer-photos/image.jpg

// Thumbnail (150x150)
https://{project}.supabase.co/storage/v1/render/image/public/offer-photos/image.jpg?width=150&height=150

// Medium (400x400, optimized)
https://{project}.supabase.co/storage/v1/render/image/public/offer-photos/image.jpg?width=400&height=400&quality=80

// Large (800x800)
https://{project}.supabase.co/storage/v1/render/image/public/offer-photos/image.jpg?width=800&height=800
```

**Benefits**
- No background jobs needed for thumbnails
- Automatic WebP conversion
- Automatic compression
- Cached at CDN edge

**Folder Structure**
```
avatars/
  {userId}/
    profile.jpg

offer-photos/
  {userId}/
    {offerId}/
      {photoId}.jpg
```

### 11.3 CDN Strategy

**Supabase CDN**
- Built-in global CDN (Cloudflare-backed)
- Automatic edge caching
- Cache-Control headers: `public, max-age=31536000`
- Image transformations cached at edge
- No additional CDN setup required

---

## 12. Analytics & Monitoring

### 12.1 Internal Analytics

**Key Metrics** (tracked in database)
- Daily active users (DAU)
- Weekly active users (WAU)
- Offers created
- Messages sent
- Exchanges proposed / agreed / completed
- Feedback given
- Retention cohorts

**Analytics Tables**
```typescript
model AnalyticsEvent {
  id        String   @id @default(cuid())
  userId    String?
  eventType String
  metadata  Json
  createdAt DateTime @default(now())
  
  @@index([eventType, createdAt])
  @@index([userId, createdAt])
}
```

**Event Types**
- `user.signup`
- `user.login`
- `offer.created`
- `offer.viewed`
- `message.sent`
- `exchange.proposed`
- `exchange.agreed`
- `exchange.completed`
- `feedback.given`

### 12.2 Application Monitoring

**Error Tracking** (Sentry)
- Automatic error capture
- Source maps for stack traces
- User context (anonymized)

**Performance Monitoring**
- API endpoint latency (p50, p95, p99)
- Database query performance
- WebSocket connection stability

**Logging**
- Structured JSON logs
- Log levels: error, warn, info, debug
- Correlation IDs for request tracing

---

## 13. Security & Privacy

### 13.1 Security Measures

**Authentication**
- Bcrypt password hashing (cost factor 12)
- JWT with short expiry (15 min access, 7 day refresh)
- Refresh token rotation
- Email verification required

**API Security**
- Rate limiting (per user, per IP)
- CORS configuration (whitelist origins)
- Input validation (Zod schemas)
- SQL injection prevention (parameterized queries via Prisma)
- XSS prevention (sanitize user input, CSP headers)

**Data Security**
- HTTPS only (TLS 1.3)
- Encrypted database connections
- Encrypted object storage
- Secrets in environment variables (never in code)

### 13.2 Privacy by Design

**Minimal Data Collection**
- No tracking pixels
- No third-party analytics
- No social media integrations
- No email marketing

**Location Privacy**
- Coarse location by default (postcode outward)
- Full postcode optional
- Never show exact location on map (fuzzy radius)

**Data Retention**
- Soft delete users (retain for 30 days, then hard delete)
- Anonymize deleted user data in exchanges/feedback
- Purge old messages after 1 year (configurable)

**GDPR Compliance**
- Data export (JSON format)
- Right to deletion
- Privacy policy
- Cookie consent (minimal cookies)

---

## 14. Deployment & Infrastructure

### 14.1 Environments

**Development**
- Supabase local development (`supabase start` - Docker-based)
- Vercel dev server (`vercel dev`)
- Hot reload enabled

**Staging**
- Separate Supabase project (staging instance)
- Vercel preview deployments (automatic per PR)
- Test data seeding scripts
- Environment variables synced via Vercel CLI

**Production**
- Supabase production project (auto-scaled, multi-region)
- Vercel production deployment (edge network)
- Automated backups (Supabase built-in: daily + PITR)
- Zero-downtime deployments (Vercel automatic)

### 14.2 CI/CD Pipeline

**GitHub Actions Workflow**
```yaml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run test
      - run: npm run test:integration
  
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      - name: Run Supabase migrations
        run: npx supabase db push --linked
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
```

**Vercel Automatic Deployments**
- Every push to `main` → production deployment
- Every PR → preview deployment with unique URL
- Environment variables managed in Vercel dashboard

### 14.3 Database Migrations

**Supabase + Prisma Approach**
- Use Prisma for schema definition and type generation
- Use Supabase CLI for migrations (includes RLS policies)
- Version-controlled migrations in `supabase/migrations/`

**Development Workflow**
```bash
# 1. Update Prisma schema
npx prisma db push --skip-generate

# 2. Generate migration from changes
npx supabase db diff -f migration_name

# 3. Apply to local
npx supabase db reset

# 4. Generate Prisma client
npx prisma generate
```

**Production Deployment**
```bash
# Automatic via CI/CD
npx supabase db push --linked
```

**Migration Checklist**
- [ ] Test migration on local Supabase instance
- [ ] Test migration on staging Supabase project
- [ ] Review migration SQL for RLS policies
- [ ] Backup production (automatic, but verify)
- [ ] Run migration via CI/CD
- [ ] Verify data integrity
- [ ] Monitor error rates in Supabase dashboard

### 14.4 Backup Strategy

**Database (Supabase)**
- **Pro Plan**: Daily backups (retained 7 days), PITR (7 days)
- **Paid Plans**: Daily backups (retained 30 days), PITR (30 days)
- Manual backups via Supabase dashboard or CLI
- Backup verification: Monthly restore test to staging

**Object Storage (Supabase Storage)**
- No automatic versioning (S3-compatible, can enable if needed)
- Critical images: Consider periodic export to external backup
- Future: Cross-region replication when scaling

### 14.5 Monitoring & Alerts

**Health Checks**
- API endpoint: `/health`
- Database connectivity
- Redis connectivity
- Object storage connectivity

**Alerts** (PagerDuty or similar)
- API error rate > 5%
- API latency p95 > 1s
- Database connection pool exhausted
- Disk space > 80%

---

## 15. Testing Strategy

### 15.1 Unit Tests

**Backend** (Jest + Supertest)
- Service layer logic
- Validation functions
- Utility functions
- Target: 80% coverage

**Frontend** (Jest + React Testing Library)
- Component rendering
- User interactions
- Form validation
- Custom hooks

### 15.2 Integration Tests

**API Tests**
- End-to-end API flows
- Authentication flows
- Database interactions
- File uploads

**Example Test**
```typescript
describe('Offer Creation Flow', () => {
  it('should create offer with photos', async () => {
    const user = await createTestUser();
    const token = await loginUser(user);
    
    // Request upload URL
    const { uploadUrl, photoId } = await request(app)
      .post('/api/v1/offers/photos/upload-url')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    
    // Upload image (mock)
    await uploadToStorage(uploadUrl, testImage);
    
    // Create offer
    const response = await request(app)
      .post('/api/v1/offers')
      .set('Authorization', `Bearer ${token}`)
      .send({
        title: 'Test Offer',
        description: 'Test Description',
        categoryId: testCategory.id,
        photoIds: [photoId]
      })
      .expect(201);
    
    expect(response.body.data.photos).toHaveLength(1);
  });
});
```

### 15.3 E2E Tests

**Mobile** (Detox or Maestro)
- Critical user flows
- Registration → Create offer → Send message

**Web** (Playwright)
- Same critical flows
- Cross-browser testing

### 15.4 Manual Testing Checklist

**Pre-Launch**
- [ ] Registration flow
- [ ] Email verification
- [ ] Create offer with photos
- [ ] Search and filter
- [ ] Send message
- [ ] Propose exchange
- [ ] Complete exchange
- [ ] Give feedback
- [ ] Block user
- [ ] Report content
- [ ] Mobile responsiveness
- [ ] Offline behavior

---

## 16. Performance Considerations

### 16.1 Database Optimization

**Connection Pooling**
```typescript
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Connection pool
  pool: {
    min: 2,
    max: 10,
    idleTimeoutMillis: 30000,
  },
});
```

**Query Optimization**
- Use `select` to fetch only needed fields
- Use `include` judiciously (avoid N+1)
- Implement cursor-based pagination
- Use database indexes strategically

**Caching Strategy**
```typescript
// Cache user stats (updated on exchange completion)
async function getUserStats(userId: string) {
  const cacheKey = `user:${userId}:stats`;
  const cached = await redis.get(cacheKey);
  
  if (cached) return JSON.parse(cached);
  
  const stats = await prisma.userStats.findUnique({
    where: { id: userId }
  });
  
  await redis.setex(cacheKey, 3600, JSON.stringify(stats));
  return stats;
}
```

### 16.2 API Performance

**Response Time Targets**
- p50: < 100ms
- p95: < 300ms
- p99: < 1s

**Optimization Techniques**
- Compress responses (gzip/brotli)
- ETags for conditional requests
- Batch requests where possible
- Lazy load images

### 16.3 Frontend Performance

**Mobile App**
- Image lazy loading
- Virtualized lists (FlatList)
- Memoization (React.memo, useMemo)
- Code splitting (dynamic imports)

**Web App**
- Next.js automatic code splitting
- Image optimization (next/image)
- Prefetch links on hover
- Service worker for offline support

---

## 17. Development Roadmap

### Phase 1: Foundation (Weeks 1-4)

**Week 1-2: Backend Core**
- [ ] Set up project structure
- [ ] Database schema + migrations
- [ ] Authentication system
- [ ] User CRUD
- [ ] Offer CRUD
- [ ] Basic API tests

**Week 3-4: Frontend Core**
- [ ] Mobile app setup (Expo)
- [ ] Authentication screens
- [ ] Profile screen
- [ ] Offer creation flow
- [ ] Offer feed

### Phase 2: Discovery & Messaging (Weeks 5-8)

**Week 5-6: Search & Discovery**
- [ ] Geospatial search
- [ ] Feed algorithm
- [ ] Filters and sorting
- [ ] Category system

**Week 7-8: Messaging**
- [ ] Conversation system
- [ ] WebSocket integration
- [ ] Message validation
- [ ] Push notifications

### Phase 3: Exchanges & Trust (Weeks 9-12)

**Week 9-10: Exchange Flow**
- [ ] Propose exchange
- [ ] Agree exchange
- [ ] Complete exchange
- [ ] Exchange history

**Week 11-12: Feedback & Safety**
- [ ] Feedback system
- [ ] User stats
- [ ] Block functionality
- [ ] Report system
- [ ] Admin dashboard (basic)

### Phase 4: Polish & Launch (Weeks 13-16)

**Week 13-14: Polish**
- [ ] UI/UX refinement
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Onboarding flow

**Week 15: Testing**
- [ ] Integration tests
- [ ] E2E tests
- [ ] Manual testing
- [ ] Bug fixes

**Week 16: Launch Prep**
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Analytics verification
- [ ] Soft launch (50 users)

---

## Appendix A: Technology Alternatives Considered

### Backend Hosting
- **Chosen**: Vercel Serverless Functions
- **Alternatives**: Railway (containerized), Render (containerized), Fly.io (more complex)
- **Rationale**: Seamless integration with Next.js, zero-config deployments, excellent DX

### Database & Backend Services
- **Chosen**: Supabase (PostgreSQL + Auth + Storage)
- **Alternatives**: 
  - Self-managed PostgreSQL + custom auth (more work)
  - Firebase (no PostGIS, vendor lock-in)
  - PlanetScale (no PostGIS support)
- **Rationale**: Built-in auth, PostGIS support, RLS, storage, real-time subscriptions

### Mobile Framework
- **Chosen**: React Native (Expo)
- **Alternatives**: Flutter (different language), Native (2x development)
- **Rationale**: Code sharing with web, faster development, OTA updates

### Object Storage
- **Chosen**: Supabase Storage
- **Alternatives**: Cloudflare R2, AWS S3, Backblaze B2
- **Rationale**: Integrated with Supabase auth/RLS, automatic image transformations, included in plan

---

## Appendix B: Open Questions

1. **Email Provider**: Resend (recommended for Vercel) vs Postmark?
2. **Mobile Testing**: Expo Go vs Development Build for internal testing?
3. **Maps**: Mapbox vs Google Maps (cost vs features)?
4. **Supabase Plan**: Start with Pro ($25/mo) or Team ($599/mo) for production?
5. **Redis Provider**: Upstash (serverless) vs Supabase's built-in Redis (when available)?

---

## Appendix C: Future Considerations (Post-MVP)

- Multi-language support
- Accessibility improvements (screen readers, high contrast)
- Advanced matching algorithm
- Community features (local groups)
- Verified badges (manual verification)
- Integration with local community centers
- Android/iOS native optimizations

---

**Document Version**: 1.0  
**Last Updated**: 2026-01-26  
**Author**: Senior Technical Architect  
**Status**: Ready for Implementation
