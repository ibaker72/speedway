import PrintButton from "./PrintButton";

export const metadata = {
  title: "Platform Capabilities Overview — Speedway Motors LLC",
  robots: { index: false, follow: false },
};

const RED = "#D31119";

const sections = [
  {
    icon: "📦",
    title: "Inventory Management",
    bullets: [
      "180+ active vehicle listings with VIN, specs, mileage, colors, trim, transmission, drivetrain, and fuel type",
      "Multi-image support per vehicle — photos sourced from dealer feeds (Vauto, dealer.com, imgix, Cloudfront)",
      "Smart CSV import — new vehicles are added automatically; vehicles no longer in the feed are marked sold instantly",
      "Advanced filtering by make, body type, price range, year, mileage, transmission, drivetrain, and features",
      "Full-text PostgreSQL search across make, model, trim, and description — fast even with hundreds of vehicles",
      "Recently viewed tracking per visitor (cookie-based), grid/list view toggle, 24 vehicles per page with pagination",
      "Dedicated commercial vehicles section for fleet and work-vehicle buyers",
    ],
  },
  {
    icon: "🔍",
    title: "SEO Strategy",
    bullets: [
      "JSON-LD structured data on every page: AutoDealer schema (4.8★ rating, 120+ reviews), Car schema per vehicle listing, FAQPage schema for rich snippets, LocalBusiness schema on geo pages, BreadcrumbList site-wide",
      "Open Graph and Twitter Card metadata on all pages — every share link shows a rich preview",
      "Dynamic XML sitemap auto-generated with priority weighting: Homepage 1.0 → Inventory 0.9 → Finance/Trade 0.8 → Featured vehicles 0.9/0.85 → Standard vehicles 0.7 → Geo pages 0.7–0.8",
      "Canonical URLs on every page to prevent duplicate content penalties",
      "All pages set to index & follow — no accidental noindex leakage",
      "Automatic sitemap pinging to Google and Bing every Monday at 5 AM — search engines always see the latest inventory",
    ],
  },
  {
    icon: "📍",
    title: "GEO Landing Pages — Local SEO",
    bullets: [
      "14 city-specific landing pages targeting the NJ/NY metro area: Paterson, Newark, Jersey City, Hoboken, Clifton, Passaic, Elizabeth, Union City, Bloomfield, Hackensack (NJ) + Yonkers and The Bronx (NY)",
      "Each page has a clean URL (e.g. /locations/newark-nj), 10 SEO-targeted keywords (\"used cars near Newark NJ\", \"bad credit car loans Newark\"), and custom city-specific FAQs",
      "6 featured vehicles from live inventory are surfaced on each page, ranked by relevance to that city",
      "LocalBusiness JSON-LD schema with exact city name on every geo page",
      "Fully differentiated content per city — not duplicate pages, making each one eligible to rank independently",
    ],
  },
  {
    icon: "⚙️",
    title: "Automation — Zero Manual Effort",
    bullets: [
      "Every Monday at 4:00 AM UTC: AI (OpenClaw API) automatically regenerates all 14 geo landing pages with fresh, 400–600 word SEO copy — no human intervention needed",
      "AI generation uses live inventory data (top 8 newest vehicles per run), city keywords, dealer stats (years in business, rating, makes carried), and internal links to /inventory and /finance",
      "Every Monday at 5:00 AM UTC: platform automatically pings Google and Bing with the updated sitemap URL",
      "Vercel Cron powers both jobs — reliable, serverless, zero infrastructure to manage",
      "Admin can trigger a manual full regeneration of all 14 pages from the dashboard at any time",
    ],
  },
  {
    icon: "📋",
    title: "Lead Capture & Management",
    bullets: [
      "6 distinct lead capture types: Finance Application, Test Drive Request, Trade-In Valuation, Sell Your Car, Inventory Alert signup, and General Contact",
      "Finance application captures income, credit status, job title, residence, and down payment preference — everything a lender needs",
      "Inventory Alerts let shoppers subscribe to notifications for specific vehicles or price drops",
      "Every lead submission triggers an instant email notification to the sales team via Resend (transactional email)",
      "All leads are stored in a unified database with source tracking, full payload, and timestamps",
      "Rate limiting applied to all form endpoints (IP-based) to prevent spam and abuse",
    ],
  },
  {
    icon: "🔥",
    title: "Deal Desk — Sales Intelligence Dashboard",
    bullets: [
      "Password-protected internal dashboard at /admin/deal-desk — visible only to the sales team",
      "Engagement scoring: every visitor interaction before form submission is logged and scored (deal builder opened, test drive requested, calculator used, walkaround requested, trade-in used)",
      "Automatic lead temperature: Hot (≥60 pts), Warm (25–59 pts), Cold (<25 pts) — sales team knows who to call first",
      "Lead cards show: customer name/phone/email, preferred contact method, vehicle of interest, UTM/referral source, and full pre-submission event history",
      "Sales workflow: update lead status (new → contacted → qualified → sold), assign to a rep, set follow-up priority (1–3), add timestamped internal notes",
      "Session-based visitor behavior replay — see exactly which pages a lead visited and what they interacted with before submitting",
    ],
  },
  {
    icon: "📊",
    title: "Analytics & Tracking",
    bullets: [
      "Google Analytics — site traffic, user behavior, pageviews, session duration, bounce rate",
      "Google Tag Manager — event tracking, conversion funnels, custom triggers without code deploys",
      "Facebook Pixel — lead tracking and retargeting audience building for paid social campaigns",
      "Internal Deal Desk event log — session-level behavioral data: pages viewed, calculator opened, vehicle detail views, form submissions",
      "UTM and referral source attribution captured on every lead — know exactly which campaign or channel drove each conversion",
    ],
  },
  {
    icon: "⚡",
    title: "Performance & Infrastructure",
    bullets: [
      "Deployed on Vercel's global edge network — pages served from the nearest CDN node to every visitor worldwide",
      "Next.js Incremental Static Regeneration (ISR) — inventory pages are cached and refreshed on-demand after each import, giving static-site speed with live data",
      "PostgreSQL full-text search with GIN index — keyword search across 180+ vehicles is instant",
      "Multiple database indexes (slug, make, body type, price, year, is_featured, date_added) — filtered browsing queries return in milliseconds",
      "Next.js Image component — automatic format conversion (WebP/AVIF), lazy loading, and responsive sizing for all vehicle photos",
      "TypeScript strict mode throughout — eliminates entire classes of runtime bugs before they reach production",
    ],
  },
  {
    icon: "🌐",
    title: "Platform Overview — Technology Stack",
    bullets: [
      "Framework: Next.js 16.2.1 with React 19 — the industry-leading full-stack React framework, used by Fortune 500 companies",
      "Database: PostgreSQL via Supabase — enterprise-grade relational database with real-time capabilities and built-in auth",
      "Hosting: Vercel — zero-downtime deployments, global CDN, serverless functions, and cron jobs in one platform",
      "Email: Resend — modern transactional email with high deliverability and clean developer API",
      "AI Content: OpenClaw API — powers the weekly automated geo page regeneration",
      "Styling: Tailwind CSS 4 — utility-first CSS with zero unused styles shipped to the browser",
      "Language: TypeScript 5 strict mode — all code is fully typed, reducing bugs and improving maintainability",
    ],
  },
];

export default function ProposalPage() {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          @page { margin: 18mm 15mm; size: A4; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break-avoid { break-inside: avoid; }
          .page-break-before { break-before: page; }
        }
      `}</style>

      <div
        style={{
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          color: "#1a1a1a",
          background: "#fff",
          maxWidth: "860px",
          margin: "0 auto",
          padding: "48px 40px 64px",
          lineHeight: 1.6,
        }}
      >
        {/* COVER */}
        <div
          style={{
            borderBottom: `4px solid ${RED}`,
            paddingBottom: "36px",
            marginBottom: "48px",
          }}
          className="page-break-avoid"
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                width: "10px",
                height: "48px",
                background: RED,
                borderRadius: "3px",
                flexShrink: 0,
              }}
            />
            <div>
              <div
                style={{ fontSize: "11px", letterSpacing: "2px", color: "#888", textTransform: "uppercase", marginBottom: "4px" }}
              >
                Confidential Platform Overview
              </div>
              <h1
                style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "#111" }}
              >
                Speedway Motors LLC
              </h1>
            </div>
          </div>

          <h2
            style={{
              margin: "0 0 16px",
              fontSize: "22px",
              fontWeight: 600,
              color: "#333",
            }}
          >
            Custom Digital Platform — Capabilities & Feature Overview
          </h2>

          <p style={{ margin: "0 0 20px", color: "#555", maxWidth: "640px", fontSize: "15px" }}>
            A comprehensive look at the technology, automation, and growth systems powering
            SpeedwayMotorsLLC.com — built from the ground up for your dealership.
          </p>

          <div style={{ fontSize: "13px", color: "#888" }}>
            Prepared: {today} &nbsp;·&nbsp; Paterson, NJ
          </div>
        </div>

        {/* EXECUTIVE SUMMARY */}
        <div
          style={{
            background: "#fafafa",
            border: "1px solid #eee",
            borderLeft: `5px solid ${RED}`,
            borderRadius: "6px",
            padding: "24px 28px",
            marginBottom: "48px",
          }}
          className="page-break-avoid"
        >
          <h2
            style={{
              margin: "0 0 14px",
              fontSize: "18px",
              fontWeight: 700,
              color: RED,
              letterSpacing: "0.3px",
            }}
          >
            Executive Summary
          </h2>
          <p style={{ margin: "0 0 12px", fontSize: "15px", color: "#333" }}>
            Speedway Motors LLC now runs on a fully custom, proprietary digital platform — built specifically for
            your dealership, not adapted from a generic template. The platform combines a high-performance
            inventory showcase, aggressive local SEO across 14 New Jersey and New York cities, and a fully
            automated content engine that updates every week without lifting a finger.
          </p>
          <p style={{ margin: "0 0 12px", fontSize: "15px", color: "#333" }}>
            Every lead — whether from a finance application, test drive request, trade-in inquiry, or general
            contact — is captured, scored by engagement level, and surfaced in an internal sales dashboard
            purpose-built for your team. Salespeople see exactly how interested each prospect is before
            picking up the phone.
          </p>
          <p style={{ margin: 0, fontSize: "15px", color: "#333" }}>
            The result is a platform that actively works to rank in local search, convert more visitors into
            qualified leads, and give your sales team the intelligence they need to close deals faster — all
            running on enterprise-grade infrastructure with zero ongoing maintenance overhead.
          </p>
        </div>

        {/* FEATURE SECTIONS */}
        {sections.map((section, i) => (
          <div
            key={section.title}
            style={{ marginBottom: "36px" }}
            className={`page-break-avoid${i === 3 ? " page-break-before" : ""}`}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "14px",
                paddingBottom: "10px",
                borderBottom: `2px solid ${RED}`,
              }}
            >
              <span style={{ fontSize: "20px" }}>{section.icon}</span>
              <h2
                style={{
                  margin: 0,
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "#111",
                  letterSpacing: "0.2px",
                }}
              >
                {section.title}
              </h2>
            </div>
            <ul
              style={{
                margin: 0,
                paddingLeft: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              {section.bullets.map((bullet) => (
                <li
                  key={bullet.slice(0, 40)}
                  style={{ fontSize: "14px", color: "#333", lineHeight: 1.65 }}
                >
                  {bullet}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* CLOSING */}
        <div
          style={{
            marginTop: "56px",
            padding: "28px 32px",
            background: "#111",
            borderRadius: "8px",
            color: "#fff",
          }}
          className="page-break-avoid page-break-before"
        >
          <h2
            style={{
              margin: "0 0 12px",
              fontSize: "18px",
              fontWeight: 700,
              color: RED,
            }}
          >
            Built for Speedway Motors — Nothing Off the Shelf
          </h2>
          <p style={{ margin: "0 0 12px", fontSize: "14px", color: "#ccc", lineHeight: 1.7 }}>
            Every line of code in this platform was written for your business, your market, and your customers.
            There are no recurring SaaS licensing fees for a third-party inventory tool, no locked-in lead
            providers, and no shared infrastructure. You own the platform and the data.
          </p>
          <p style={{ margin: "0 0 20px", fontSize: "14px", color: "#ccc", lineHeight: 1.7 }}>
            The weekly automation alone — 14 AI-refreshed city pages + search engine pinging every Monday —
            would require a full-time SEO team to replicate manually. It runs automatically, every week, in the
            background.
          </p>
          <div
            style={{
              borderTop: "1px solid #333",
              paddingTop: "16px",
              fontSize: "13px",
              color: "#888",
            }}
          >
            speedwaymotorsllc.com &nbsp;·&nbsp; Paterson, NJ &nbsp;·&nbsp; {today}
          </div>
        </div>

        {/* Print button — hidden in print */}
        <div className="no-print">
          <PrintButton />
        </div>
      </div>
    </>
  );
}
