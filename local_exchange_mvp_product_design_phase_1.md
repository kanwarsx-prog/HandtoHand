# Local Exchange Platform – MVP Product Design (Phase 1)

> **Purpose of this document**  
This MD defines the *exact* MVP we will build and test in a single local area. It intentionally prioritises trust, usefulness, and completed exchanges over growth, scale, or monetisation. This is a working product blueprint, not a pitch.

---

## 1. Product North Star

**Help neighbours turn what they already have (time, skills, goods) into something useful for each other — without money.**

### Non‑Negotiable Principles
These are design constraints, not preferences:

- ❌ No money
- ❌ No pricing or valuation
- ❌ No credits, points, or tokens
- ❌ No transaction fees
- ❌ No forced equivalence
- ❌ No scale-before-density

If any of these are compromised, the product fails by definition.

---

## 2. What Problem This MVP Solves

People under cost-of-living pressure:
- hesitate to spend
- still have spare time, skills, and unused items
- lack a *clean, trusted way* to exchange locally

Existing options fail because they are:
- money‑first (marketplaces)
- chaotic (Facebook / WhatsApp groups)
- bureaucratic (time banks)
- one‑way (gifting platforms)

This MVP creates **structured discovery + human negotiation**, nothing more.

---

## 3. Target User (Phase 1)

**Primary user**
- Lives locally (same postcode area)
- Comfortable meeting neighbours or arranging handovers
- Has *something useful* but not necessarily sellable
- Values fairness, not optimisation

**Explicitly NOT targeting (yet)**
- Professional traders trying to optimise outcomes
- People looking to monetise spare time
- National / remote users
- Ideological barter communities

---

## 4. Success Definition (90‑Day Pilot)

The MVP is successful if:

- ✅ At least **25 completed exchanges** occur
- ✅ At least **10 users complete 2+ exchanges**
- ✅ Users return without prompts
- ✅ Users would be *disappointed* if the platform shut down

Vanity metrics (downloads, sign‑ups, page views) are irrelevant.

---

## 5. MVP Scope Overview

**This is a discovery + conversation product.**

We optimise for:
- visibility of real offers
- ease of starting conversations
- social accountability
- light trust signals

We deliberately avoid:
- optimisation
- automation of value
- complex matching

---

## 6. Core MVP Features (Product + Technical Alignment)

This section incorporates the agreed High-Level Design (HLD) to ensure the MVP is build-ready while preserving the product principles.

### 6.1 Identity, Accounts & Profile

**Account & Identity (Required)**
- Email sign-up with verification
- Login / logout / password reset
- Soft-delete account

**Profile fields**
- Display name
- Profile photo (optional)
- Postcode (outward code required; full postcode optional)
- Bio (optional)
- Categories of interest (optional)

**Privacy & safety defaults**
- Coarse location only (area-level)
- No verification badges in Phase 1

**Design intent**
Profiles exist to establish human presence, not credentials or status.

---

### 6.2 Listings – Offers (“What I Have”)

Users can create listings describing what they are willing to exchange.

**Offer fields**
- Title
- Category
- Description
- Photos (0–6)
- Availability (free text)
- Location radius (local default)
- Status: active, paused, archived

**Core actions**
- Create, edit, pause, archive
- View offer detail
- View owner profile

**Design rules**
- No prices, quantities, or time valuation
- Frame usefulness, not worth

--- (“What I Have”)

Users can post things they are willing to exchange.

Examples:
- Help assembling furniture
- Gardening help
- Childcare swap
- Unused tools
- Cooking / baking

**Offer fields**
- Title (free text)
- Category (broad)
- Description (how this could help someone)
- Location radius (local only)

**Design rules**
- No quantities
- No time pricing
- No language suggesting value

---

### 6.3 Listings – Wishes (“What I’m Open To”)

Users express needs without locking equivalence.

**Wish fields**
- Title / need
- Category
- Description
- Open to suggestions toggle
- Status: active, paused, archived

**Design principle**
Wishes guide discovery; humans negotiate the rest.

--- (“What I’m Open To”)

Users express what they *might* want in return.

Examples:
- “Open to help around the house”
- “Happy to receive gardening help or something similar”
- “Open to suggestions”

**Key principle**
Needs are *directional*, not binding. Humans negotiate.

---

### 6.4 Discovery, Search & Matching

**Feed logic**
- Local proximity first
- Active listings
- Recently updated

**Filters**
- Distance
- Category
- Open to suggestions
- Newest

**Search**
- Keyword across titles, descriptions, tags

No visible match scoring.

--- & Browsing

**Primary feed logic**
- Local first (postcode proximity)
- Active users first
- Recently updated offers first

**Secondary signals**
- Category overlap
- Openness (broad needs > narrow needs)

No “best match” scoring is shown to users.

---

### 6.5 Messaging

- 1:1 message threads
- Context always linked to offer or profile

**Safety**
- Block user
- Report message

Messaging is where value negotiation lives.

---

- Simple 1:1 messaging
- No templates
- No automation

**UI nudges**
- Encourage explaining *why* the offer is useful
- Encourage flexibility

Messaging is where value negotiation lives — do not over-design it.

---

### 6.6 Exchange Handshake

**Propose exchange**
- Initiated in chat
- Free text or linked listings

**Agree**
- Both confirm
- Status moves to Agreed

**Complete**
- Both confirm completion

No enforcement or penalties.

--- Acknowledgement (“Handshake”)

When both parties agree:
- Either user can tap **“Agree Exchange”**
- The other confirms

This creates:
- Social commitment
- Visibility of intent

No enforcement. No penalties.

---

### 6.7 Completion, Reputation & Trust

After completion:
- Optional feedback (rating + comment)

**Profile shows**
- Completed exchanges count
- Aggregate trust signal

No public rankings.

--- & Light Feedback

After completion:
- Either user can mark **“Completed”**
- Optional 1–2 prompt feedback:
  - “Would exchange again” (Yes / No)
  - Optional short comment

**No star ratings**
Trust is binary at this stage.

---

## 7. Safety, Moderation & Compliance

**User actions**
- Report user, listing, message
- Block user

**Automated safeguards**
- Money-language detection
- Friendly rewrite prompts

**Admin (minimal)**
- Review reports
- Warn, remove listing, suspend, ban

--- & Reputation (MVP Level)

Displayed on profile:
- Number of completed exchanges
- “Would exchange again” count

Not displayed:
- Detailed reviews
- Negative scoring
- Rankings

The goal is *reassurance*, not competition.

---

## 8. Notifications & Analytics (Internal)

**Notifications**
- Email verification
- New message
- Exchange proposed / agreed / completed

**Analytics (internal only)**
- Signups and activations
- Listings created
- Messages sent
- Exchanges proposed / completed

--- & UX Tone

**Every word matters.**

UI copy should:
- sound neighbourly
- avoid optimisation language
- frame exchanges as usefulness, not fairness

Examples:
- ❌ “Get value”
- ❌ “Earn credits”
- ✅ “Be useful”
- ✅ “Help each other locally”

---

## 9. Enforcement of “No Money”

**Design-based enforcement only**

- No fields for price or time value
- Automated blocking of £, $, “per hour”, “cash”
- Gentle copy reminders

**Escalation**
- Repeated offenders see reduced visibility
- No public shaming
- No heavy moderation in Phase 1

---

## 10. What We Explicitly Will NOT Build (Phase 1)

- Payments or escrow
- Credits / tokens
- Valuation engines
- Rankings
- Logistics or delivery
- Dispute resolution
- Monetisation

--- (Phase 1)

- Payments or escrow
- Credits / points / tokens
- Ratings or reviews
- Verification badges
- Logistics or delivery
- Dispute resolution
- Monetisation features

If a feature doesn’t help *local trust* or *completed exchanges*, it’s out.

---

## 11. Technical Architecture (MVP)

**Clients**
- Mobile: React Native (Expo)
- Web: Next.js

**Backend**
- Node.js or Python API
- PostgreSQL
- Redis
- Object storage

**Auth**
- Email + JWT or managed auth

---

## 12. Pilot Strategy (Operational)

**Location**: Single local area

**Launch**
- Soft pilot
- Manual seeding
- Founder onboarding

--- (Operational)

**Location**: Single local area (e.g. Orpington)

**Launch approach**
- Soft pilot, not public launch
- Manual seeding of 30–50 offers
- Founder‑led onboarding

**Early users**
- Tradespeople
- Parents
- Retirees
- Community organisers

---

## 13. Metrics We Track (Internally Only)

- Completed exchanges
- Repeat users
- Time to handshake

--- We Track (Internally Only)

- Completed exchanges per week
- Repeat exchangers
- Time from message → handshake
- Drop‑off points

We do **not** show metrics publicly.

---

## 13. Post‑MVP Guardrails

Before *any* expansion or monetisation, we must prove:

- Organic repeat behaviour
- Trust stability
- No pressure to introduce value systems

If pressure appears to monetise too early — pause.

---

## 15. Final Note to Ourselves

This product fails the moment we try to make it clever.

Our job is not to optimise exchange.
Our job is to get out of the way of neighbours helping each other.

Build less. Listen more. Stay local longer than feels comfortable.
 to Ourselves

This product fails the moment we try to make it clever.

Our job is not to optimise exchange.
Our job is to **get out of the way of neighbours helping each other**.

Build less. Listen more. Stay local longer than feels comfortable.

