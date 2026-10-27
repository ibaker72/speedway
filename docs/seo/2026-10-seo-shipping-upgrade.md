# SEO, Nationwide Shipping & Lead-Capture Upgrade — Implementation Report

Branch: `ccr-9785576c-jn8rs8` · Prepared: 2026-10-26 · Site: https://www.speedwaymotorsllc.com

This is an upgrade of the existing Next.js 16 / Supabase / Vercel site, not a redesign. Layout, navigation, dark theme, and branding are unchanged; new UI reuses the existing components (`PageHero`, `SectionWrapper`, `SectionHeading`, `Button`, `card-glass`, `input-dark`).

---

## A. Executive summary

The audit found several problems that were costing leads and search visibility today, beyond the planned SEO work:

1. **Most lead forms could not save leads.** The production Supabase project has no `leads` table (the migration in the repo was never applied). Contact, finance, test-drive, trade-in, sell-your-car, and inventory-alert submissions wrote to that table *before* sending the email, so a failed insert returned an error and **skipped the email too**. Lead routes now email the sales team even if the insert fails, and an idempotent migration is ready to apply (needs your approval — it changes the production database).
2. **The sitemap was frozen at build time.** Production's `sitemap.xml` was last generated on Aug 14, 2026, so ~10 weeks of new arrivals were missing and sold vehicles stayed listed. It now regenerates hourly with real inventory timestamps.
3. **Every page shared the homepage's Open Graph URL and title**, and most titles repeated the brand twice ("… | Speedway Motors | Speedway Motors — Paterson, NJ"). Every public page now has its own canonical, title, description, and social card.
4. **Trust problems:** a fake "N people viewed this week" counter (computed from a hash), a "saves you $X vs. similar vehicles" claim based on three unrelated cars, unverified 4.8★/120-review rating markup, invented "2,000+ shoppers / 847 alerts this month" figures in a popup, and a team page with named staff profiles. All removed.

New capability: a nationwide-shipping inquiry experience (homepage promo, `/nationwide-car-shipping` landing page, secure inquiry form and API, vehicle-page CTA), crawlable make landing pages, and PII-free conversion tracking.

**Before publishing:** the shipping copy is deliberately inquiry-based ("ask our team about shipping options"), but the dealership still needs to confirm that it arranges shipping. If not, set `features.nationwideShipping` to `false` in `dealer.config.ts` — every shipping surface (page, API, promo, CTA, FAQ, footer link, sitemap entry) turns off together.

---

## B. Audit results

Evidence came from the code, the live sitemap/robots (fetched through the Vercel deployment), Vercel runtime errors (7-day window), Vercel domain settings, and read-only queries against the production Supabase project.

| # | Finding | Severity | Business impact | Resolution | Status |
|---|---|---|---|---|---|
| 1 | `leads` table missing in production; lead insert failure also skipped the email | **Critical** | Inquiries from 6 forms lost | `lib/leads/submit.ts` emails even when storage fails; `db/migrations/20261026_leads_table_rls.sql` ready | Code fixed · **migration awaiting approval** |
| 2 | Resend errors treated as success (SDK returns `{ error }`, doesn't throw) | High | Silent email failures | `notifyLead` returns `true` only when Resend accepts the message | Fixed |
| 3 | Sitemap static since 2026-08-14 build | **Critical** | New inventory undiscoverable; sold cars listed | `revalidate = 3600`, real `lastmod`, image entries | Fixed |
| 4 | Homepage `og:url`/title leaked to all pages; doubled brand in titles; `metadataBase` unset | High | Poor snippets and social cards | `lib/seo/metadata.ts` on every public page; template `%s \| Speedway Motors` | Fixed |
| 5 | Layout canonical (`/`) inherited by pages without their own | High | Utility pages canonicalized to homepage | Removed from layout; set per page | Fixed |
| 6 | Team page with named owner/staff profiles | High (dealer request) | Unapproved names public | Page deleted, `/team` → `/about` (308), footer link removed, "Why Choose Speedway Motors" section added | Fixed |
| 7 | Fake "people viewed this week" counter; "saves you $X" claim | High | Deceptive urgency/pricing | Removed | Fixed |
| 8 | `aggregateRating` (4.8/120), `numberOfEmployees`, Paterson-centroid geo, review schema with anonymous authors | High | Unverifiable; self-served review stars aren't shown by Google | Removed; AutoDealer built from `dealer.config.ts` | Fixed |
| 9 | Site-wide `FAQPage` markup on every page | Medium | Markup not matching visible content | Only on pages that show the FAQ (`/faq`, shipping, city pages) | Fixed |
| 10 | Per-city `LocalBusiness` entities with their own `@id` | Medium | Implied locations in cities without one | Removed; single AutoDealer entity | Fixed |
| 11 | Removed/sold vehicles returned **200 + noindex** (soft 404) because `loading.tsx` streamed before `notFound()` | Medium | Search Console soft-404s | Loading UI scoped to the listing via route group; real 404 for vehicles, makes, cities; helpful "no longer available" page | Fixed |
| 12 | `/inventory?page=N` past the end → PostgREST 416 → logged error + empty page (11 occurrences, 6 users) | Medium | Broken pagination links | 416 handled as an empty page with the real total; noindex past the end | Fixed |
| 13 | Filtered/sorted inventory URLs indexable with canonical to `/inventory`, including `?page=2` | Medium | Duplicate URLs; deep pages unindexed | Filters → `noindex,follow`; pages → self-canonical | Fixed |
| 14 | No crawlable make-level pages (make filter is a `<select>`) | Medium | Brand searches have no landing page | `/inventory/make/[make]` for makes with ≥2 in stock + "Browse by Make" links | Fixed |
| 15 | Production also served on `speedway-cqob.vercel.app` | Medium | Duplicate host | `X-Robots-Tag: noindex` for `*.vercel.app` | Fixed |
| 16 | Hardcoded "180+ vehicles" in ~10 places; live stock is 102 | Medium | Inaccurate claim | Live count (`getLiveInventoryCount`) or no number | Fixed |
| 17 | Broken asset refs: `/og-image.jpg`, `/logo.png`, `/apple-icon.png`, `/icon-192.png`, `/icon-512.png` | Medium | Broken social images/manifest | Pointed to generated `/opengraph-image`, `/apple-icon`, `/icon` | Fixed |
| 18 | Empty `/blog` (0 posts), `/commercial` (no vehicles flagged commercial), `/specials` listed in sitemap | Medium | Thin/soft-404 pages | Noindex + excluded while empty | Fixed |
| 19 | Location pages: fabricated drive times (miles × 3 min), "just 0 miles from Paterson", "under 20 minutes" | Medium | Inaccurate local claims | Distances labeled approximate; live-directions links | Fixed |
| 20 | Email modal auto-opened after 7s on mobile with invented stats; no alert-sending job exists | Medium | Intrusive interstitial; false promise | Desktop exit-intent only; invented figures removed | Fixed |
| 21 | Google/Bing sitemap ping endpoints retired (Google 404, Bing 410) | Low | Dead cron | Cron now only refreshes the sitemap; requires `CRON_SECRET` | Fixed |
| 22 | No rate limiting/honeypot on contact/finance/trade/sell/test-drive/alerts; no length caps; arbitrary `source` accepted | Medium | Spam, oversized payloads | `lib/leads/guard.ts` on all public lead routes | Fixed |
| 23 | JSON-LD built with `JSON.stringify` inside `<script>` (feed text with `</script>` could break out) | Medium | XSS vector via inventory feed | `serializeJsonLd` escapes `<`, `>`, `&` | Fixed |
| 24 | No conversion events for leads, calls, or CTAs | Medium | No measurement | `lib/analytics/track.ts` + `SiteTracking` | Fixed |
| 25 | Homepage and city pages rendered on every request (`force-dynamic`) | Medium | Slower TTFB | ISR: home 5 min, cities 1 h, About 1 h | Fixed |
| 26 | `$0` vehicle (1 in stock) shown as "$0" with a $0 offer in schema | Low | Looks like an error | "Call for Price"; no offer markup | Fixed |
| 27 | No nationwide shipping content anywhere | — | Missed out-of-state buyers | Built (section C) | Done |
| 28 | `is_commercial` is false for all 102 vehicles (23 vans, box trucks in stock) | Medium | `/commercial` shows "0 vehicles" | Page noindexed while empty; **importer/business rule needed** | Open |
| 29 | Weekly AI geo-page regeneration writes to `geo_landing_pages`, but pages never read it | Low | API spend with no effect | Recommend disabling or adding human review before ever publishing it | Open |
| 30 | Cron routes `sync-autofunds` / `refresh-geo-pages` are open if `CRON_SECRET` is unset | Low | Unauthenticated sync trigger | Left unchanged (can't verify env); confirm `CRON_SECRET` is set | Open |
| 31 | Analytics scripts load before cookie consent (banner is notice-only) | Low | Privacy expectations | Documented; consent model is a business/legal decision | Open |

---

## C. Nationwide shipping implementation

| Piece | Location |
|---|---|
| Feature flag | `dealer.config.ts` → `features.nationwideShipping` |
| Homepage promo ("Shop Locally. Buy From Anywhere.") | `components/home/ShippingPromoSection.tsx`, rendered after the trust badges in `app/page.tsx` |
| Landing page `/nationwide-car-shipping` | `app/nationwide-car-shipping/page.tsx`; copy in `lib/data/shipping-content.ts` |
| Inquiry form | `components/forms/ShippingInquiryForm.tsx` |
| Shared validation (client + server) | `lib/shipping/inquiry.ts` |
| API | `app/api/shipping-inquiry/route.ts` |
| Vehicle-page CTA | `components/inventory/VehicleShippingCta.tsx` → `/nationwide-car-shipping?vehicle=<slug>#shipping-inquiry` |
| Other links | Footer quick link, general FAQ entry, About "Why Choose" card, make pages |

**Landing page content:** buying from out of state, 5-step journey, what's needed for an estimate, payment & documentation, before pickup, delivery coordination, 8-question FAQ (with matching `FAQPage` markup), breadcrumbs. Copy rules are written at the top of `lib/data/shipping-content.ts`: no prices, flat rates, "free shipping", transit times, guarantees, or claims about who physically transports the vehicle.

**Form fields:** name, email, phone, vehicle of interest (pre-filled from `?vehicle=`), delivery ZIP, delivery state (50 states + DC), optional message, required consent checkbox. Visible labels, `aria-invalid`/`aria-describedby` errors, focus moves to the first invalid field, success state is announced and focused.

**Server side:** JSON-only body, honeypot (`website`), per-IP rate limit (5 per 10 min per instance), field caps, control-character stripping, ZIP/state/phone validation, required consent. The vehicle is re-resolved on the server so the stored association (title, stock #, VIN, price, URL) comes from the real listing; a sold listing is recorded with a note instead of failing. Stored with source `shipping`, consent text and timestamp, and first-touch attribution (UTM source/medium/campaign, landing page, referrer host, form page) — covered by the existing privacy policy, which now lists shipping inquiry forms. The lead email includes a readable vehicle/delivery block.

---

## D. Technical SEO changes

- **Metadata:** `lib/seo/metadata.ts` (`pageMetadata`) sets title, description, canonical, Open Graph, Twitter, and robots for every public page. Root template is `%s | Speedway Motors`; the homepage uses an absolute title. `metadataBase` is set from `NEXT_PUBLIC_SITE_URL` (default `https://www.speedwaymotorsllc.com`).
- **Sitemap (`app/sitemap.ts`):** hourly ISR; static pages, make pages (≥2 in stock), in-stock vehicles with `lastmod` from `date_modified`/`date_added` and up to 5 image URLs each, shipping page, city pages; `/commercial` and `/specials` only when they have vehicles; blog only when enabled with posts. Excludes `/team`, `/admin`, `/api`, `/proposal`, `/compare`, `/alerts`, query-string URLs, sold vehicles. Static pages omit `lastmod` rather than reporting the build time.
- **Robots:** only `/api/` and `/admin/` are blocked; everything else uses `noindex` where needed so crawlers can see it.
- **Canonicalization & redirects:** `/team` → `/about` (permanent). `*.vercel.app` → `X-Robots-Tag: noindex`. Apex → www is configured in Vercel (status code unset in the API response — confirm it is 308/301, see checklist). Trailing slashes already redirect (Next default). Filter/sort/search views are `noindex,follow` with canonical `/inventory`; `?page=N` is self-canonical.
- **Structured data (`lib/seo/schema.ts`):** one `AutoDealer` entity (`@id …/#organization`) from `dealer.config.ts` + `HOURS`; `Car` on vehicle pages; `BreadcrumbList`; `ItemList` on listing/make pages; `FAQPage` only where visible. Validated on rendered pages (all blocks parse; FAQ questions present in the HTML; no rating/review markup). Note: Google retired the dedicated vehicle-listing rich result in June 2025, so `Car` markup describes listings for search/AI systems but won't produce a special result on its own.

## E. Inventory SEO changes

- Vehicle titles: `<Year> <Make> <Model> <Trim> for Sale | Speedway Motors`; descriptions include real mileage, price (or "call for price"), location, financing, and the shipping prompt.
- H1 now includes the trim; mileage and stock number shown under it; visible breadcrumb (Inventory / Used <Make> / vehicle).
- Make landing pages `/inventory/make/<make>`: unique title/H1, live count, models in stock, grid, financing/trade/shipping links, links to other makes.
- "Browse by Make" crawlable links on `/inventory`; "See all used <Make>" on vehicle pages.
- Sold/removed vehicles: real 404 with a "no longer available" page linking to inventory and a call button (never redirected to the homepage).
- Alt text: `<year> <make> <model> <trim>` on cards; `… — photo N of M` in the gallery (replaces the repeated "for sale in Paterson NJ — Speedway Motors" string).
- `$0` prices display "Call for Price"; no payment estimate or "Save" badge for those.

## F. Local SEO — remaining work

**Google Business Profile checklist (requires dealership account access; nothing was changed externally):**

- [ ] Primary category "Used car dealer"; review secondary categories (e.g., "Car finance and loan company" only if they apply).
- [ ] Name exactly "Speedway Motors LLC" (or the registered name) — no keywords.
- [ ] Address 302-304 22nd Ave, Paterson, NJ 07513; pin placed on the actual lot.
- [ ] Hours Mon–Sat 9:30 AM–7:00 PM, Sunday closed (match the site); add holiday hours.
- [ ] Phone (862) 264-2777; website `https://www.speedwaymotorsllc.com/` (add UTM `?utm_source=google&utm_medium=organic&utm_campaign=gbp` to measure GBP clicks).
- [ ] Appointment link → `/contact`; consider a "Financing" link → `/finance`.
- [ ] Vehicle inventory in GBP (via Google's dealer inventory program / Merchant Center vehicle ads feed) if eligible.
- [ ] Photos: storefront, lot, office, staff-free showroom shots; refresh monthly.
- [ ] Services/products: used car sales, financing, trade-ins, sell-your-car, commercial vehicles; vehicle shipping inquiries **only after confirmation**.
- [ ] Attributes accurately set (e.g., financing available, wheelchair accessibility, payment types).
- [ ] Reply to every review; request reviews after each sale with a direct review link. Keep `googleRating`/`totalReviews` in `dealer.config.ts` in sync by hand.
- [ ] If the commercial department (198 East Railway Ave) and branch (84-88 Illinois Ave) are real, public locations, decide whether each gets its own verified GBP listing; otherwise remove them from `lib/data/locations.ts` and the About page.

**City pages:** they're improved but still largely templated (12 pages). Over the next 90 days, either add genuinely local content (real customer-area notes, directions, and inventory relevant to that market) or consolidate the weakest pages into `/locations`. Don't publish the AI-generated `geo_landing_pages` content without human review.

## G. Performance results

Lab measurements on a local production build (fixture inventory, no Supabase latency), Playwright, Pixel 5 emulation with 4× CPU throttle, median of 5 runs. Before = untouched base commit built in a separate worktree; after = this branch. Scripts: see section H.

| Route | LCP ms (before → after) | CLS (before → after) | First-load JS gz KB (before → after) | Server response ms (before → after) |
|---|---|---|---|---|
| `/` | 744 → 700 | 0 → 0 | 218.0 → 218.9 | 332 → 18 |
| `/inventory` | 1388 → 1420 | 0.046 → 0.038 | 210.9 → 211.6 | 96 → 78 |
| `/inventory/2022-toyota-camry-se` | 896 → 288 | 0 → 0 | 216.9 → 217.7 | 133 → 9 |
| `/locations/newark-nj` | 1168 → 1216 | 0 → 0 | 208.5 → 209.2 | 50 → 8 |
| `/finance` | 1040 → 1096 | 0 → 0 | 204.3 → 205.1 | 15 → 6 |

Reading these honestly: the clear wins are server response time (homepage and city pages are now served from the ISR cache instead of rendered per request — the production gain should be larger because production also waits on Supabase) and the vehicle page. Differences of ~±50 ms LCP are within run-to-run noise. Client JS grew by under 1 KB gzipped. Field data (CrUX / Search Console Core Web Vitals) should be reviewed 28 days after release.

## H. Testing results

Commands executed on this branch (all passing at the time of writing):

```bash
npm ci                         # install
npm run typecheck              # next typegen && tsc --noEmit  → exit 0
npx eslint                     # → 0 errors, 0 warnings
npx vitest run                 # → 11 files, 108 tests passed (34 existing + 74 new)
npx next build                 # → exit 0
```

Baseline before changes: lint 0 errors/1 warning; tests 34/34; build passed; `tsc --noEmit` failed on `RouteContext` because route types weren't generated — `typecheck` now runs `next typegen` first.

New test files and coverage of the requested areas:

| Area | Test file |
|---|---|
| Homepage shipping CTA; shipping page; vehicle→shipping association (UI); accessibility of new components (axe-core) | `tests/shipping-ui.test.tsx` |
| Shipping validation; lead submission; vehicle association (API); honeypot; rate limit; storage-failure fallback | `tests/shipping-inquiry.test.ts` |
| Dynamic inventory metadata; canonicals; sitemap; robots; `/team` redirect; vercel.app noindex | `tests/seo-technical.test.ts` |
| Vehicle & dealership structured data; FAQ/breadcrumb markup; JSON-LD escaping | `tests/structured-data.test.ts` |
| Mobile navigation; existing contact and financing forms (validation, submit, PII-free tracking) | `tests/existing-forms-and-nav.test.tsx` |
| Removed team-profile content; lead hardening; analytics privacy; 416 pagination fix | `tests/content-and-security.test.ts` |

Additional manual verification against `next start`: status codes (vehicle/make/city 404s are real 404s; `/team` 308), rendered titles/canonicals/robots per page, all JSON-LD blocks parse, screenshots of the promo band, shipping page (desktop + mobile), vehicle sidebar, and About section.

Not run: Lighthouse CI against production (the sandbox cannot reach the production domain), Google Rich Results Test (external service — run after deploy), end-to-end submission against the real Supabase/Resend (needs the migration and env confirmation).

## I. Business information required from the dealership

1. **Nationwide shipping:** Is it offered today? How is it arranged (dealer-arranged through a carrier/broker, buyer-arranged, or both)? Any states or vehicle types excluded? Who pays and when? Is the vehicle insured in transit? (Gate for release; flag in `dealer.config.ts`.)
2. **Google rating and review count** currently shown (4.8 / 120+), plus "5,000+ customers" and "20+ brands".
3. **Locations:** `dealer.config.ts` lists one showroom, but `lib/data/locations.ts` and the About page list three (adds 198 East Railway Ave and 84-88 Illinois Ave). Which are real and public?
4. **(862) 264-2778:** config calls it a fax; the header shows it as "Service". Which is correct?
5. **Exact coordinates** of 302-304 22nd Ave (geo was removed from schema because the old value was Paterson's city center).
6. **Trust badges:** "AAA Approved", "NAPA Service", "NJ Trusted Dealer", "CARFAX Reports" — verify each or remove. Also "Same-Day Decisions" (finance page), "Quality inspected vehicle" (vehicle pages), warranty page claims.
7. **Testimonials** are labeled "Verified Google Review" — confirm they are real Google reviews you may quote.
8. **Commercial vehicles:** which inventory should count as commercial (e.g., cargo vans, box trucks)? The importer currently never sets `is_commercial`.
9. **Inventory alerts:** who follows up on alert/price-drop signups? There is no automated alert email.
10. **Lead notifications:** confirm `RESEND_API_KEY`, `LEAD_NOTIFICATION_EMAIL`, and a verified `LEAD_FROM_EMAIL` domain are set in Vercel production (could not be checked from here).
11. **Footer credit** "Powered by Tweak & Build": keep or remove? (Not a profile, so it was left in place.)
12. **Legal review** of the shipping consent text and the privacy-policy line added for shipping inquiries.

## J. Deployment checklist

1. **Confirm shipping** with the dealership (item I-1). If not confirmed, set `features.nationwideShipping: false` in `dealer.config.ts` before merging.
2. **Apply the leads migration** to the production Supabase project (approval required). Follow `docs/db/2026-10-27-leads-migration-readiness.md`: backup, pre-check, run `db/migrations/20261026_leads_table_rls.sql` in the SQL editor, post-check, anonymous-access check, smoke test. (The project has no Supabase CLI migration history, so `supabase db push` does not apply.) The migration is independent of this deploy and can go first.
3. **Verify Vercel env vars** (production): `RESEND_API_KEY`, `LEAD_NOTIFICATION_EMAIL`, `LEAD_FROM_EMAIL`, `CRON_SECRET`, `NEXT_PUBLIC_SITE_URL=https://www.speedwaymotorsllc.com`, and only one GA4 path (`NEXT_PUBLIC_GA_ID` *or* GTM forwarding to GA4). The homepage, city pages, and About now pre-render at build time, so **Preview** must also have `INVENTORY_SOURCE`, `NEXT_PUBLIC_SUPABASE_URL`, and a Supabase key (or leave `INVENTORY_SOURCE` unset there to build with fixture data) — with `INVENTORY_SOURCE=supabase` and no URL/key, the build stops on purpose.
4. **Run checks locally:** `npm ci && npm run typecheck && npm run lint && npm test && npm run build`.
5. **Open a PR** from `ccr-9785576c-jn8rs8`; review the Vercel preview (previews are `noindex`).
6. **Smoke-test on the preview:** submit contact, finance, and shipping forms (from a vehicle page) → confirm rows in `leads` and the notification emails; check `/team` redirects; check a fake `/inventory/does-not-exist` returns 404.
7. **Merge** to deploy production.
8. **Post-deploy checks:**
   ```bash
   curl -sI https://www.speedwaymotorsllc.com/team                      # 308 → /about
   curl -sI https://speedwaymotorsllc.com/ | grep -i -E "^HTTP|location" # apex → www, should be 308/301
   curl -sI https://speedway-cqob.vercel.app/ | grep -i x-robots-tag     # noindex
   curl -s  https://www.speedwaymotorsllc.com/sitemap.xml | grep -c "<url>"
   curl -sI https://www.speedwaymotorsllc.com/inventory/not-a-real-car  # 404
   ```
   In Vercel → Project → Domains, set the apex redirect to **308 Permanent** if it isn't already (the API reported no explicit status code).
9. **Search Console:** submit `https://www.speedwaymotorsllc.com/sitemap.xml`; inspect and request indexing for `/`, `/inventory`, `/nationwide-car-shipping`, and 2–3 make pages; watch Pages → "Not found (404)" for sold vehicles (expected) and "Soft 404" (should trend to zero).
10. **Rich Results Test / Schema validator:** one vehicle page, `/nationwide-car-shipping`, `/faq`.
11. **GA4:** mark `generate_lead` as a key event; register custom dimensions `lead_type`, `cta_id`, `link_location`; mark `click_to_call` as a key event if calls are a goal.
12. **Monitor** Vercel runtime logs for `[leads]` messages for the first week.

**Rollback:** revert the merge commit (Vercel → Deployments → promote the previous deployment for an instant rollback). The shipping feature alone can be switched off with the flag.

## K. Next 90 days

**Days 1–30 — technical foundation & indexing**
- Ship this branch; apply the migration; complete the deployment checklist.
- Resolve business items I-1 through I-8; remove or confirm every unverified claim.
- Set up the reporting below; establish baselines in Search Console and GA4.
- Fix `is_commercial` in the importer (or replace `/commercial` with a body-type page for vans/trucks).
- Decide on the weekly AI geo-page job (disable, or add human review).
- Add a Vercel WAF rate-limit rule for `POST /api/*` (in-memory limits are per instance).

**Days 31–60 — inventory SEO & high-intent content**
- Body-type landing pages (used SUVs / trucks / vans / sedans in Paterson) using the make-page pattern, only where stock supports them.
- Buyer guides built from real dealership process: "How to buy a used car from out of state", "How vehicle shipping estimates work", "Questions to ask before buying a used car", "How dealer financing works", "What to know about trading in". One solid page each, linked from the shipping page and FAQ — not a volume play.
- Vehicle descriptions: work with the DMS/feed to get dealer-written condition notes and highlights into `description` (never generated claims about condition or history).
- Enrich or consolidate city pages.
- If eligible, Google vehicle ads / free vehicle listings via Merchant Center using the same inventory feed.

**Days 61–90 — analysis, refinement, conversion**
- Review queries/pages in Search Console: improve titles/descriptions for high-impression, low-CTR pages; expand content where impressions show intent (e.g., specific makes, "car shipping NJ").
- Review the lead funnel by `lead_type` and landing page; A/B the vehicle-page CTA order if data supports it.
- Review field Core Web Vitals; optimize the hero slideshow and vehicle images if LCP is weak on mobile.
- Revisit consent: move analytics to a consent-gated loader if the dealership adopts an opt-in policy.

### Reporting specification

| Metric | Source | Definition / segment | Cadence |
|---|---|---|---|
| Organic clicks & impressions | Search Console → Performance | Web search, all pages; trend vs. 28-day baseline | Weekly |
| Non-branded visibility | Search Console | Queries excluding regex `speedway` | Weekly |
| Indexed inventory pages | Search Console → Pages | Indexed URLs under `/inventory/` vs. in-stock count in sitemap | Weekly |
| Qualified leads | `leads` table + `deal_desk_leads` | Count by `source`, excluding test/spam | Weekly |
| Shipping inquiries | `leads` where `source = 'shipping'`; GA4 `generate_lead` with `lead_type = shipping` | Count, delivery state mix, % from vehicle pages | Weekly |
| Conversion rate | GA4 | `generate_lead` ÷ sessions, by landing page and default channel group (Organic Search) | Monthly |
| Calls | GA4 `click_to_call` | By `page_path`, `link_location` | Monthly |
| CTA engagement | GA4 `cta_click` | By `cta_id` (e.g., `home_shipping_promo_inquiry`, `vdp_shipping_inquiry`) | Monthly |
| Core Web Vitals | Search Console CWV report / CrUX | LCP, INP, CLS for mobile and desktop | Monthly |

Event reference (all events carry no personal data; parameter names that look like personal fields are dropped in `lib/analytics/track.ts`):

| Event | Fired when | Parameters |
|---|---|---|
| `generate_lead` (+ Meta `Lead`) | A lead form returns success | `lead_type` (`contact`, `finance`, `test_drive`, `trade_in`, `sell_car`, `shipping`, `inventory_alert`, `deal_desk`), `page_path`, optional `vehicle_slug` |
| `click_to_call` | Any `tel:` link is clicked | `page_path`, optional `link_location` |
| `click_email` | Any `mailto:` link is clicked | `page_path` |
| `cta_click` | Element with `data-track-cta` is clicked | `cta_id`, `page_path` |

If Google account access is not available to the developer, the dealership's Google admin needs to: add the developer as a Search Console user (Full), add them to the GA4 property (Editor), and confirm which GA4/GTM IDs are live.

---

## Files changed (summary)

- **New:** `lib/seo/{site,metadata,schema}.ts`, `components/seo/JsonLdScript.tsx`, `lib/leads/{guard,sanitize,submit}.ts`, `lib/shipping/inquiry.ts`, `lib/data/{faqs,shipping-content}.ts`, `lib/analytics/track.ts`, `components/analytics/SiteTracking.tsx`, `lib/inventory/make-pages.ts`, `app/nationwide-car-shipping/page.tsx`, `app/api/shipping-inquiry/route.ts`, `app/inventory/make/[make]/page.tsx`, `app/inventory/[slug]/not-found.tsx`, `components/home/ShippingPromoSection.tsx`, `components/forms/ShippingInquiryForm.tsx`, `components/inventory/VehicleShippingCta.tsx`, `db/migrations/20261026_leads_table_rls.sql`, 6 test files.
- **Removed:** `app/team/page.tsx`, `components/seo/LocalBusinessJsonLd.tsx`, `app/inventory/[slug]/loading.tsx`, `app/locations/[city]/loading.tsx`.
- **Moved:** `app/inventory/{page,loading}.tsx` → `app/inventory/(listing)/` (same URL).
- **Updated:** layout, sitemap, robots, manifest, `next.config.ts`, `dealer.config.ts`, all public page metadata, vehicle page, inventory listing, location pages, lead API routes, lead notification, FAQ, footer, About, home sections, image alt text, form tracking hooks, privacy policy line, `package.json` (`typecheck` script, `axe-core` dev dependency).

Notes: `PLATFORM_SUMMARY.md` and `/proposal` (noindexed sales material) still describe the old rating markup and sitemap pings; update them if they're shared again.
