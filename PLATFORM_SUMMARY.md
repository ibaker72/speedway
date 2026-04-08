# Speedway Motors — Platform Capabilities & Delivery Summary

**Prepared for:** Speedway Motors LLC  
**Platform:** SpeedwayMotorsLLC.com  
**Built on:** Next.js 16 / Supabase / Vercel

---

## What You're Getting

This is a fully custom, production-grade used car dealership platform — not a template, not a SaaS subscription with someone else's branding. Every line of code is purpose-built for your dealership and is yours to own.

---

## Core Website Features

- **Full inventory browsing** — 180+ vehicles with filters by make, body type, price, year, mileage, drivetrain, and transmission. Grid and list view. 24 vehicles per page with pagination.
- **Vehicle detail pages** — Full specs (VIN, mileage, transmission, colors, features), image gallery, payment estimator, and direct contact actions on every listing.
- **Payment calculator** — Monthly estimate shown on every vehicle page to drive financing inquiries.
- **Finance application** — Online application form for buyers with all credit types ("bad credit welcome" messaging baked in).
- **Trade-in valuation tool** — Captures sellers who want to trade or sell their vehicle directly.
- **Test drive scheduling** — Request form tied to specific vehicles.
- **Inventory alerts** — Visitors can sign up to be notified when specific vehicles or price drops happen.
- **Sell your car form** — Separate flow for customers who want to sell outright (not trade-in).
- **Commercial vehicles section** — Dedicated page for vans, trucks, and fleet buyers.
- **Testimonials section** — Social proof displayed on the homepage.
- **FAQ section** — Structured Q&A covering financing, trade-ins, documentation, and more.
- **Recently viewed vehicles** — Cookie-based tracking so visitors can pick up where they left off.

---

## Lead Management & Deal Desk

This is where the platform separates itself from anything off-the-shelf.

### Multi-Channel Lead Capture

Every lead form (finance, test drive, trade-in, sell your car, inventory alerts, contact) feeds into a unified lead management database. Each lead is stored with full context: which vehicle, what they submitted, when, and how they found you.

### Deal Desk — Internal Sales Dashboard

The Deal Desk is a private dashboard only accessible to your team. It tracks:

- Every lead with name, phone, email, vehicle of interest, and source
- **Engagement scoring** — The platform tracks how a visitor behaves before they submit: did they open the calculator? View multiple vehicles? Request a test drive? Each action adds to an engagement score. Leads are labeled by intent level (cold, warm, hot).
- Event history per lead (page views, calculator opens, test drive requests, contact submissions)
- Follow-up priority, assigned rep, preferred contact method, customer notes
- UTM/referral source tracking so you know which ads or platforms are driving leads

Email notifications are sent instantly to your inbox on every new lead via a professional email delivery system.

---

## SEO — Built for Google

The platform is wired for search engine performance from the ground up:

- **Structured data (JSON-LD)** — Every page includes machine-readable schema that Google uses for rich results:
  - `AutoDealer` schema — tells Google your business type, hours, payment methods, rating (4.8/5 from 120+ reviews), area served across 24+ cities
  - `Car` schema on every vehicle listing — VIN, mileage, price, real-time availability (in stock / sold)
  - `FAQPage` schema — FAQ content surfaced directly in Google search results
  - `LocalBusiness` schema on each city landing page
  - `BreadcrumbList` schema — helps Google understand site structure
- **Open Graph & Twitter Cards** — Every page has proper social sharing metadata so links shared on Facebook, Instagram, and iMessage look professional with a preview image.
- **Dynamic sitemap** — Automatically generated and updated to include every vehicle, every location page, and every static page. Priority-weighted (homepage highest, inventory high, locations medium).
- **Canonical URLs** — Prevents duplicate content penalties across location pages.
- **Robots directives** — All pages set to index and follow.
- **Automated sitemap pinging** — Every Monday morning, the platform automatically notifies both Google and Bing with the updated sitemap URL, prompting immediate crawling of any new vehicles or content.

---

## GEO Landing Pages — AI-Powered, Auto-Refreshed

This is the most technically advanced feature of the platform and one of the biggest differentiators for local SEO.

### 14 City-Specific Landing Pages

The platform generates dedicated landing pages for 14 cities in your target market:

**New Jersey:** Paterson (home), Clifton, Passaic, Newark, Jersey City, Hoboken, Union City, Elizabeth, Bloomfield, Hackensack

**New York:** Yonkers, Bronx

Each city page lives at a clean URL — for example: `/locations/newark-nj`, `/locations/yonkers-ny`.

### What Makes Each Page Unique

Each location page is individually configured with:

- 10 city-specific SEO keywords (e.g., "used cars near Newark NJ", "bad credit car loans Newark NJ")
- Custom intro text that references the specific city
- City-specific FAQs (distance from Paterson, financing options, trade-in, required documents)
- Featured car makes popular in that area's market
- A "Nearby Inventory" section showing 6 vehicles ranked by relevance to that city
- Local Business structured data with the specific city name
- Canonical URL and breadcrumb navigation for each page

### OpenClaw AI Integration

Every city page's written content (meta title, H1 heading, and body copy) is **automatically generated by AI** using the OpenClaw platform:

- The system sends each city's profile plus a snapshot of 8 current vehicles in inventory to OpenClaw
- OpenClaw returns a 400–600 word SEO-optimized page with internal links to the inventory and finance pages
- The content is stored in the database and served instantly on page load
- **Every Monday at 4 AM**, a scheduled job automatically regenerates all 14 pages with fresh content — keeping the copy current, avoiding stale content penalties, and reflecting any changes in your inventory

This means the platform is actively working to rank in 14 different cities every week, fully automatically, with no manual effort required.

---

## Inventory Management

- **CSV import script** — Upload a CSV export from your DMS or spreadsheet. The system handles flexible column naming, parses prices with dollar signs and commas, and maps features automatically.
- **Automatic sync logic** — Any vehicle NOT in the new import gets automatically marked as sold and removed from public view. No manual cleanup.
- **PostgreSQL database with full-text search** — Search across make, model, trim, and description in real time.
- **Sitemap update on import** — After every inventory sync, the platform automatically notifies Google so new vehicles get indexed without delay.
- **Flexible inventory source** — Can pull from the database, a dealer feed API, or a local file depending on your setup.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2 (latest) with React 19 |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| Hosting | Vercel (global CDN, edge network) |
| Email delivery | Resend |
| AI content generation | OpenClaw API |
| Analytics | Google Analytics, Google Tag Manager, Facebook Pixel |
| Scheduling | Vercel Cron Jobs |

Next.js 16 with the App Router gives you server-side rendering, static generation, and incremental static regeneration — meaning pages load fast and Google sees real HTML content, not JavaScript that has to be executed first. This is the same architecture used by enterprise companies.

---

## What Runs Automatically (No Effort Required)

Every week, without anyone touching anything:

1. All 14 city landing pages get refreshed with new AI-generated SEO copy
2. Google and Bing are notified with the updated sitemap
3. Inventory stays current with whatever your latest CSV export contains

---

## Deliverables Included

- Full Next.js 16 source code (TypeScript, strict mode)
- Supabase database schema and migrations
- Vercel deployment configuration with cron job scheduling
- 14 configured geo city landing pages
- All lead capture forms (finance, trade-in, test drive, sell your car, inventory alerts)
- Deal Desk admin dashboard with engagement scoring
- CSV inventory import script
- Environment variable documentation
- Deployment walkthrough

---

## Pricing Options

### Option A — Flat Sale

**$8,000 – $12,000** (one-time)

You own the full codebase outright. Ongoing costs (Vercel, Supabase, Resend, OpenClaw API) run approximately $80–150/month and are paid directly by you to those providers.

Best for: buyers who want full ownership and control, or who have their own developer to maintain it.

### Option B — Flat Sale + Monthly Support *(Recommended)*

**$6,000 upfront + $300/month**

Includes the platform delivery plus ongoing support: hosting management, API cost coverage, bug fixes, minor updates, and inventory sync assistance.

Best for: dealers who want the platform managed for them without a large upfront.

### Option C — Monthly License

**$600 – $1,200/month** (no large upfront)

The codebase is licensed on a monthly basis. Includes hosting, APIs, and support. Full ownership can be negotiated separately.

Best for: a lower barrier to entry; good if you want to evaluate before committing.

---

### Why This Is Worth It

A generic dealer website from a SaaS provider runs $500–$2,000/month — and you're renting their platform with their branding and their limitations.

This platform is custom-built for your dealership, AI-powered, and designed to rank in 14 separate markets simultaneously. If it generates even **one additional sale per month** from a geo landing page ranking in Newark or Yonkers, that's $2,000–$5,000 in gross profit — many times the monthly cost.
