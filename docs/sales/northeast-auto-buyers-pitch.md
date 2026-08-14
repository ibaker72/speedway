# Northeast Auto Buyers — Sales Call Script

**Use:** Discovery + pitch call (45–60 min, screen share strongly preferred)
**Proof asset:** speedwaymotorsllc.com (live, in production)
**Goal of the call:** Get a signed agreement or a scheduled second call with the decision-maker present.

> **How to read this doc**
> - `SAY:` = deliver close to word-for-word.
> - `ASK:` = discovery question. Stop talking. Write the answer down.
> - `→` = coaching note, not something you say out loud.
> - `[BRACKETS]` = fill in before the call.
> - Everything in the Fact Sheet (Section 11) is verified against the live Speedway codebase. Anything **not** on that list, do not claim.

---

## 0. Pre-Call Prep (15 minutes, do not skip)

Do this before you dial. Half the pitch is showing them things about their own business they don't know.

| Check | Where | What you're looking for | Write it here |
|---|---|---|---|
| Their website | Their site | Platform (Dealer.com? Wix? DealerCarSearch?), load speed, mobile look | |
| Google search: `"Northeast Auto Buyers"` | Google | Do they own their own brand result? GBP filled out? | |
| Google search: `used cars [their city]` | Google | Where do they rank? Who beats them? | |
| Google search: `we buy cars [their city]` | Google | Their acquisition keyword — this is their money term | |
| ChatGPT prompt: `"Where can I sell my car near [their city]?"` | ChatGPT | Are they mentioned? (Usually: no) | |
| ChatGPT prompt: `"Best used car dealership in [their city]"` | ChatGPT | Are they mentioned? Who is? | |
| View source → search `application/ld+json` | Their site | Do they have structured data at all? | |
| `[theirsite]/sitemap.xml` | Their site | Does it exist? Is it stale? | |
| Google Reviews | GBP | Star count + review count (you'll quote it back) | |
| Their inventory count | Their site | How many vehicles listed | |

→ **Screenshot the ChatGPT results.** That single screenshot is the most persuasive thing in this entire call. Nothing else lands like showing an owner that the AI everyone now uses does not know their business exists.

---

## 1. Opening (60 seconds)

**SAY:**
> "[NAME], thanks for making the time. I'll keep this tight — I've got about 45 minutes blocked and I don't want to burn it on a slide deck.
>
> Here's how I'd like to run it: first 10 minutes I ask you questions about how Northeast Auto Buyers actually gets customers today — where they come from, what's working, what's frustrating. Then I'll show you a live platform we built for a dealership in Paterson, and you tell me which pieces would move the needle for you. If it's not a fit, I'll say so and we'll both get our afternoon back. Fair?"

→ Wait for the yes. Get permission to run the call, then run the call.

**SAY:**
> "One thing before I start asking — did you get a chance to look at speedwaymotorsllc.com?"

→ If yes: "What stood out?" — let them talk, it tells you what they value.
→ If no: "No problem, pull it up in a second tab, I'll walk you through it."

---

## 2. Discovery (10–12 minutes)

→ **Do not pitch during this section.** Every answer becomes ammunition later. Take literal notes — you'll quote them back.

### Business model

**ASK:** "Walk me through the business — are you primarily retailing cars off the lot, buying cars from the public, or both?"

→ The name says "Auto Buyers," so acquisition is likely a big piece. That's important: most dealer web vendors only build for *selling*. Nobody builds for *acquiring*. That is your wedge.

**ASK:** "Roughly how many cars are you moving a month right now? And how many are you buying in?"

**ASK:** "What's your average front-end gross? Ballpark is fine."

→ You need this number. It's the entire ROI conversation later.

### Lead flow

**ASK:** "Where do your leads come from today — percentage-wise? Cars.com, CarGurus, Facebook Marketplace, walk-ins, referrals, your website?"

**ASK:** "What are you spending a month on the third-party lead sites — CarGurus, Cars.com, Autotrader, all of it?"

→ Write this number down and circle it. This is the budget you're competing with, and it's the budget you're going to reframe.

**ASK:** "And of the leads that come off your own website — how many a month? Are those good leads or junk?"

→ Common answers: "barely any," "I don't really know," "they go to an email nobody checks." All three are gold.

**ASK:** "When a lead comes in, what happens? Walk me through it literally — it hits an inbox, then what?"

→ Listen for: no CRM, shared inbox, someone checks it "when they get a chance," no idea which lead is serious.

### Pain

**ASK:** "What's the most frustrating part of your marketing right now?"

**ASK:** "If I could fix one thing about how customers find you — one thing — what would it be?"

→ Their answer to this is the headline of your proposal. Use their exact words.

### Website

**ASK:** "Who built and runs your current site? Are you paying monthly for it?"

**ASK:** "If you wanted to change something on it tomorrow — add a page, change your financing copy — could you? Or do you have to file a ticket and wait?"

**ASK:** "Do you own that site, or are you renting it? Meaning — if you stopped paying them next month, what do you keep?"

→ Most dealer platforms: they keep nothing. Not the site, not the URLs, sometimes not even the leads. Let that sink in on its own. Don't editorialize yet.

### Inventory

**ASK:** "How does inventory get onto your site now? Somebody typing it in, or does it feed automatically?"

**ASK:** "When a car sells, how fast does it come off the site?"

→ If it's manual: they have sold cars live on their site right now, and they're paying to advertise cars they don't have. That's a lead-quality problem *and* a customer-trust problem.

### Decision process

**ASK:** "If this makes sense, who else needs to be in the room?"

**ASK:** "Have you looked at anything like this before? What happened?"

---

## 3. The Transition — Naming the Three Leaks (3 minutes)

→ Bridge from their answers into the framework. Use their words.

**SAY:**
> "Okay. So let me play back what I heard, and tell me if I've got it wrong.
>
> You're spending about [$X] a month with CarGurus and Cars.com. Those leads are hit or miss and you're renting them — the second you stop paying, the phone stops. Your own site brings in [almost nothing / a handful]. Inventory is [manual / semi-automatic]. And when a lead does come in, it lands in an inbox and whoever gets to it first works it, with no real way to tell a tire-kicker from someone who's ready to buy today.
>
> That about right?"

→ Get the yes. Now name it.

**SAY:**
> "What you've got is three leaks, and they're separate problems that most people lump together.
>
> **Leak one is visibility.** You're invisible in the places people actually search now. Not just Google page two — I mean when someone in [their city] opens ChatGPT and types 'where can I sell my car near me,' you're not in the answer. I checked before this call. I'll show you.
>
> **Leak two is conversion.** Whatever traffic you do get, the site isn't built to turn it into a phone number. It's a brochure. It shows cars, it doesn't capture people.
>
> **Leak three is intelligence.** Leads come in, but you have no idea which ones are hot. Your guys are calling them in the order they arrived instead of in the order of who's actually about to buy.
>
> What I want to show you is a platform that plugs all three, and then runs itself every week without you or anyone on your team touching it. Let me share my screen."

---

## 4. Leak One: Visibility — SEO, GEO and AEO (10 minutes)

→ Screen share. Live site, not slides.

### 4a. The AI search moment

→ Open your prepped ChatGPT screenshot first. Lead with this. It is the strongest 60 seconds of the call.

**SAY:**
> "Before I show you the dealership site, look at this. I asked ChatGPT this morning: 'Where can I sell my car near [their city]?' Here's what came back. [Read the names.] You're not on it.
>
> That's not a Google ranking problem. That's a different game entirely, and it has a name — it's called AEO, answer engine optimization. Google, ChatGPT, Perplexity, Gemini — they don't crawl your site the way the old search engines did. They're pulling structured facts about businesses and assembling an answer. If your site doesn't publish those facts in a format the machine can read, you don't exist in the answer. Doesn't matter how nice the site looks."

**SAY:**
> "Now here's what that looks like when it's done right."

→ Open speedwaymotorsllc.com, right-click → View Page Source, Ctrl+F for `ld+json`.

**SAY:**
> "This block right here is the part customers never see and the part that decides everything. It's called structured data. It's a machine-readable file that says: this is an auto dealer, here's the exact address, here's the phone, here are the hours, here's the rating and the review count, here are the payment methods, and here are the 24 cities it serves.
>
> That's what gets read when someone asks an AI for a dealership recommendation. That's what feeds the Google map pack. That's the difference between being a website and being a *known entity*.
>
> And it's not just the business. Every single vehicle on this site publishes its own block — VIN, year, make, model, mileage, price, and whether it's still in stock or already sold. Every FAQ on the site publishes as a question-and-answer pair. Every page publishes its breadcrumb trail. That's five different types of structured data running across the whole site."

→ Verified schema types on Speedway: `AutoDealer`, `Car`, `ItemList`, `FAQPage`, `LocalBusiness`, `BreadcrumbList`.

### 4b. GEO — the city pages

**SAY:**
> "Second piece. Everyone knows they should 'do SEO for their town.' Almost nobody does the math on it.
>
> Speedway is physically in Paterson. But their customers come from Newark, Clifton, Passaic, Jersey City, Hoboken, Elizabeth, Hackensack, Union City, Bloomfield, Yonkers, the Bronx. Somebody in Newark is not searching 'used cars Paterson.' They're searching 'used cars near Newark.' Different search, different results page, and if you don't have a page built for that search, you're not in it."

→ Navigate to `/locations`, then click into `/locations/newark-nj`.

**SAY:**
> "So there's a real page for each city. Twelve of them live right now. Not a template where we swapped the city name — look at the actual content. This page targets ten specific search phrases for Newark: 'used cars near Newark NJ,' 'bad credit car loans Newark NJ,' 'trade in car near Newark NJ.' It has FAQs written for a Newark buyer — how far is the drive, what documents do I bring. It pulls six live vehicles from real inventory, ranked for that market. It has its own local-business structured data with Newark's name in it. Its own clean URL. Its own canonical tag so Google never sees these as duplicates.
>
> Twelve cities, twelve independent shots at page one instead of one."

→ Click to `/locations/yonkers-ny` to show the copy is genuinely different, not swapped.

**SAY:**
> "Here's Yonkers. Completely different copy, different keywords, different featured makes — Yonkers skews luxury so it's leading with BMW, Mercedes, Audi. Newark leads Honda, Toyota, Nissan. That's not decoration. Duplicate city pages get filtered out by Google. Genuinely different ones each get to rank."

### 4c. The other half of SEO — the technical floor

**SAY:**
> "And then there's the plumbing that has to be right or none of the above matters. On this site: every page has a canonical URL so you never get penalized for duplicate content. The sitemap generates itself and re-weights automatically — homepage highest, inventory next, featured vehicles above standard vehicles, city pages in the middle. Every new car that hits inventory is in the sitemap that same day without anyone adding it. Social preview cards on every page, so when someone texts a link to a car it shows the photo and the price instead of a naked URL.
>
> None of that is glamorous. All of it is the reason the glamorous part works."

---

## 5. Leak Two: Conversion — Turning Traffic Into Phone Numbers (7 minutes)

**SAY:**
> "Second leak. Getting found is half. The other half is what the site does with the person once they're on it.
>
> Most dealer sites have one contact form buried on a contact page. This site has seven separate ways to capture someone, and each one is built for a different mindset."

→ Walk the site as you list them.

| Flow | Who it catches | Why it exists |
|---|---|---|
| Finance application | Ready to buy, worried about credit | Captures income, credit status, job, residence, down payment — everything a lender needs |
| Test drive request | Ready to come in | Tied to a specific vehicle |
| Trade-in valuation | Has a car, wants to upgrade | Highest-intent lead in the business |
| Sell your car | Wants out, no purchase | **Your acquisition channel** |
| Inventory alert | Not ready yet | Captures the "just looking" crowd you'd otherwise lose forever |
| Contact | General | The catch-all |
| Deal builder | Payment shopper | Captures them mid-calculation |

**SAY:**
> "Look at that fourth one specifically, because for Northeast Auto Buyers it might be the whole ballgame. 'Sell your car' is a separate flow from 'trade in your car.' Most dealer sites collapse those into one form. They're completely different customers. The trade-in guy wants a car from you. The sell-my-car guy just wants a check. If you're buying units from the public — and your name says you are — that's a dedicated acquisition funnel on your website, feeding you cars, that costs you nothing per unit once it's built.
>
> Right now, where do you think that customer goes? Carvana. CarMax. They buy that search term all day. There is no reason it should be them and not you in [their city]."

→ Then show the payment calculator on a vehicle page.

**SAY:**
> "And the payment estimator on every vehicle page. This is a conversion tool disguised as a convenience. The number one reason someone leaves a car page is 'I don't know if I can afford this.' Answer it on the page and they stay. And when they play with it, the system is watching — which brings me to the part I actually think you'll care about most."

---

## 6. Leak Three: Intelligence — The Deal Desk (8 minutes)

→ This is the emotional peak of the call. Slow down here.

**SAY:**
> "You told me leads land in an inbox and your guys work them in whatever order. Let me show you the alternative.
>
> There's a private dashboard — password protected, only your team gets in. Every lead from every one of those seven forms lands here. But that's not the interesting part. The interesting part is what happens *before* they submit the form."

**SAY:**
> "The platform is scoring behavior. Every meaningful thing a visitor does gets logged with points attached:
>
> - Opened the deal builder — 8 points
> - Changed a number in it — 2 points
> - Used the trade-in tool — 10 points
> - Saved the deal — 20 points
> - Requested a walkaround video — 20 points
> - Submitted contact info — 25 points
> - **Requested a test drive — 30 points**
>
> Add it up. Sixty or more, the lead comes in labeled **Hot**. Twenty-five to fifty-nine, **Warm**. Under twenty-five, **Cold**.
>
> So your salesperson opens the dashboard Monday morning and doesn't see twelve identical names. They see: this guy is Hot, he ran the payment calculator four times on the same Silverado, put in his trade, and asked for a test drive. Call him first. That name at the bottom filled out a form and did nothing else. Call him after lunch.
>
> Same twelve leads. Completely different day."

**SAY:**
> "And each lead card carries the full picture: name, phone, email, how they prefer to be contacted, which exact vehicle, and where they came from — which ad, which campaign, which platform. So at the end of the month you're not guessing whether Facebook is working. You know."

**SAY:**
> "Then it's a workflow, not just a list. Status moves new → contacted → appointment booked → sold or lost. Assign it to a rep. Set follow-up priority one through three. Add timestamped notes so when the customer calls back and gets somebody else, that person has the whole history.
>
> And every single lead also fires an instant email to your phone the second it's submitted. You're not waiting to check a dashboard. You get pinged, and the email already has the vehicle, the payment they were quoted, the engagement score and the temperature in it."

**ASK:**
> "How would that change how your floor runs on a Saturday?"

→ Shut up and let them picture it. This is where they sell themselves.

---

## 7. The Automation — "It Runs Without You" (5 minutes)

**SAY:**
> "Now the part that I think separates this from every proposal you've ever gotten. Everything I just showed you keeps working when nobody's at the keyboard. There are three automated jobs running on a clock.
>
> **Every day at 7 AM**, the platform connects to the inventory feed, pulls the daily file, and syncs the entire lot. New cars go live automatically with photos, specs, VIN, mileage, the whole listing. And here's the important half — any car that's no longer in the feed gets marked sold and pulled off the site automatically. No stale listings. No customer driving 40 minutes for a car that sold Tuesday. No employee spending an hour a day on data entry.
>
> **Every Monday at 4 AM**, an AI job — running on Anthropic's Claude API — regenerates the written content on all twelve city pages. It gets fed that city's keyword profile plus a live snapshot of what's actually on the lot right now, and it writes fresh copy: intro, inventory section, financing section, trade-in section, closing. Then that copy goes through an automated sanitizer that checks spacing, formatting, and proper nouns before it's ever allowed on the site, and the page cache rebuilds itself.
>
> Think about what that means. Your city pages are never stale. They reference cars you actually have, this week. Search engines see a site that's genuinely updating instead of sitting there.
>
> **Every Monday at 5 AM**, right after the content refresh, the sitemap regenerates and search engines get notified there's new content to crawl.
>
> Nobody clicks anything. Nobody remembers to do it. It happened this morning while you were asleep and it'll happen next Monday."

**SAY:**
> "If you hired an agency to write twelve fresh, locally-targeted city pages every single week, what do you think that costs a month? This is a line of configuration."

---

## 8. Ownership and Infrastructure (3 minutes)

→ Short section, but it's the trust close. Especially if they said they're renting their current site.

**SAY:**
> "Last thing on the what-it-is, then let's talk about you.
>
> You said [their current vendor] charges you [$X] a month and you don't really own it. This is the opposite. Custom code, built for your business. You own the code, you own the database, you own the domain, you own every lead record. If you and I stopped working together, you'd keep all of it.
>
> Underneath it's the same stack real software companies use — Next.js and React for the front end, PostgreSQL for the database, deployed on Vercel's global edge network so pages load from a server near the customer instead of one box somewhere. Pages are pre-rendered, which means Google sees finished HTML instead of having to run JavaScript to find your content. That's a real ranking factor and most dealer platforms fail it.
>
> No per-lead fees. No 'upgrade your package to unlock that feature.' No third-party inventory tool holding your data hostage."

---

## 9. Objection Handling

→ Handle the objection, then **always ask a question back**. Never end on a defensive note.

**"How much?"** *(when it comes early)*
> "I'll give you real numbers in a minute, and I want to — but if I quote you before I know whether you need all twelve city pages or four, and whether you've got a clean inventory feed or we're building the import from scratch, I'd just be making up a number. Two more questions and I'll be able to price it accurately. Fair?"

**"That's more than I'm paying now."**
> "Compared to the website, yes. Compare it to the whole bill. You told me you're at [$X] a month on CarGurus and Cars.com. That's [$X × 12] a year renting other people's traffic — and the day you stop, it all stops. This is [$Y] to build an asset you own that keeps producing. Twelve months from now, one of those two is worth something."

**"I already have a website."**
> "You do, and it looks fine. But I pulled it up before this call — [specific finding: no structured data / sitemap hasn't updated since March / eleven seconds to load on mobile]. A site's job isn't to look fine, it's to get found and to capture. Yours is doing one job. What did you pay for it?"

**"My nephew/guy handles our marketing."**
> "Good, keep him — I'm not trying to take that. He's doing the posting and the ads, which is real work. What I'm describing is infrastructure: structured data, automated inventory sync, engagement scoring, weekly content generation. Different discipline. He'd have more to work with, not less. Honestly the two things stack."

**"How long until I see results?"**
> "Different answers for different pieces, and I'd rather be straight with you.
> Day one: site's live, faster, capturing leads through seven flows instead of one, and the Deal Desk is scoring behavior immediately. That's the part you feel right away.
> Week one: inventory syncing daily, search engines crawling structured data, city pages indexed.
> Local search rankings: typically 60 to 120 days before real movement. Anybody who tells you 30 days is selling you something. Local SEO builds.
> The reason I'm comfortable saying that is that the lead capture and the Deal Desk pay for themselves while the SEO matures."

**"Can you guarantee I'll rank number one?"**
> "No. Nobody can, and anyone who does is lying to you — Google doesn't sell rankings and doesn't take requests. What I can guarantee is that every technical thing Google and the AI engines say they want is implemented, correctly, and maintained automatically. That's the controllable part, and most of your competitors don't do it. Then you win on execution."

**"What if it doesn't work?"**
> "Define what 'work' means to you and let's write that into the agreement. If it's 'more leads off my own site than I get now,' that's measurable and we'll measure it monthly. I'd rather agree on the number now than argue about it in six months."

**"I need to think about it."**
> "Of course. What specifically do you want to think through — the money, the timing, or whether it'll actually work? Because those are three different conversations and I can probably help with the one you're actually stuck on."

**"Send me some information."**
> "Happy to. Before I do — what would you need to see in it to say yes? I'd rather send you the two pages that answer that than a twelve-page deck you'll skim."

**"We're too small for this."**
> "You're moving [X] cars a month at about [$Y] gross. That's [X × Y] a month in front-end. If this brings you two extra units a month, it's paid for itself. It's not an enterprise product — it's the same system, configured for your lot."

**"AI writing my content? Is Google going to penalize that?"**
> "Great question, and the answer's specific. Google's policy is about *unhelpful* content, not automated content — their own guidance says how it's produced isn't the issue, whether it's useful is. Two things keep this on the right side. First, it's grounded in real facts — your actual inventory, your actual location, your actual reviews — not invented. Second, every generated page runs through an automated quality check before it can publish. It's not a bot spraying junk pages; it's twelve real pages kept current."

**"What happens if you disappear?"**
> "You own the code and the database. It's standard, widely-used technology — not something only I can touch. Any competent developer can pick it up. That's deliberate, and it's the opposite of what your current vendor is doing."

**"Can I see it working for a dealership like mine?"**
> "That's exactly what speedwaymotorsllc.com is — independent used car dealer, one location, competing against franchise stores and the big online players. Same fight you're in. [Then be honest about what performance data you do and don't have. Do not invent numbers.]"

---

## 10. Close

**SAY:**
> "So here's where I think you are. You've got [restate their #1 pain in their exact words]. Everything I showed you — the city pages, the structured data, the seven capture flows, the Deal Desk scoring, the daily inventory sync — exists and is running today for a dealership 20 minutes from you. It's not a concept.
>
> The build takes [X weeks]. The investment is [$X] to build and [$Y] a month to run and maintain, which covers hosting, the automation, the AI content generation, and support.
>
> What I'd like to do is [SPECIFIC NEXT STEP].
>
> How does that sound?"

→ **Then stop talking.** Whoever speaks first loses. Let it be silent for as long as it takes.

**Next steps, best to worst:**
1. Sign today, deposit, kickoff scheduled
2. Second call this week with the partner/spouse/GM present — *put it in the calendar on this call*
3. Written proposal sent within 24 hours **with a specific review call booked** — never send a proposal without a scheduled follow-up
4. Follow-up in 30 days (this is a soft no — mark it as such and move on)

**If they say yes:**
> "Great. I'll send the agreement within the hour. To start I'll need three things from you: access to your inventory feed or a CSV export from your DMS, your Google Business Profile access, and the top five cities you want to own. Can you get me those by [day]?"

---

## 11. Fact Sheet — Verified Claims Only

Every line here is confirmed in the live Speedway Motors codebase. **Do not go beyond this list.**

### Automation (exact schedules)
- Daily 7:00 AM UTC — inventory sync from the dealer feed over SFTP; parses the CSV, upserts vehicles by VIN, marks anything missing from the feed as inactive
- Monday 4:00 AM UTC — AI regeneration of all 12 city landing pages via the Anthropic Claude API, grounded in a live inventory snapshot, output passed through an automated sanitizer, page caches rebuilt
- Monday 5:00 AM UTC — sitemap regenerated and search engines notified
- All three run on Vercel Cron; all three are secret-authenticated

### Local / GEO
- 12 live city landing pages: Paterson, Newark, Jersey City, Clifton, Passaic, Hoboken, Elizabeth, Hackensack, Union City, Bloomfield (NJ); Yonkers, Bronx (NY)
- 10 targeted keywords per city, city-specific FAQs, city-specific featured makes, 6 live vehicles ranked per city
- 24 cities declared in the dealer's `areaServed` structured data
- 14 service-area profiles for the immediate Passaic/Bergen County radius

### Structured data / AEO
- `AutoDealer` (address, geo coordinates, hours, phone, payment methods, price range, 4.8★ / 120+ reviews, services offered, social profiles)
- `Car` on every vehicle (VIN, mileage, price, in-stock vs sold, seller)
- `ItemList` of Car offers on the inventory page
- `FAQPage` site-wide and per city page
- `LocalBusiness` per city page
- `BreadcrumbList` site-wide
- Open Graph + Twitter Card metadata on every page
- Canonical URLs site-wide; auto-generated priority-weighted XML sitemap; admin and API routes excluded from crawling

### Lead capture (7 flows)
Finance application · Test drive request · Trade-in valuation · Sell your car · Inventory alerts · General contact · Deal builder save
All are rate-limited against spam, all write to one unified lead database, all fire an instant email notification.

### Deal Desk
- Password-protected internal dashboard
- Engagement scoring: deal builder opened 8 · value changed 2 · trade-in used 10 · deal saved 20 · walkaround requested 20 · contact submitted 25 · test drive requested 30
- Temperature: Hot ≥ 60 · Warm 25–59 · Cold < 25
- Lead statuses: new → contacted → appointment booked → sold / lost
- Per lead: contact details, preferred contact method, vehicle, quoted monthly payment, out-the-door estimate, UTM/referral source, full pre-submission event history, assigned rep, follow-up priority 1–3, timestamped notes

### Inventory engine
- SFTP feed ingestion with parser diagnostics (row counts, missing headers, skip reasons)
- Upsert by VIN with stable URL slugs — a car's URL never changes and never collides
- Automatic sold/inactive marking for anything absent from the feed
- PostgreSQL full-text search across make, model, trim, description
- Filtering by make, body type, price, year, mileage, transmission, drivetrain
- Automatic image format conversion (WebP/AVIF), lazy loading, responsive sizing

### Stack
Next.js 16 / React 19 · TypeScript strict mode · Tailwind CSS 4 · PostgreSQL via Supabase · Vercel edge hosting + cron · Resend transactional email · Anthropic Claude API for content generation · Google Analytics, Google Tag Manager, Facebook Pixel

### Never say
- ❌ Any traffic, ranking, or revenue figure you haven't personally verified
- ❌ "Guaranteed number one" / "guaranteed first page"
- ❌ A named client's private performance data without their permission
- ❌ That a feature exists when it's on the roadmap — say "that's in the next phase" instead
- ❌ A competitor teardown you didn't actually run

---

## 12. Follow-Up Email (send within 2 hours)

> **Subject:** Northeast Auto Buyers — the three things we talked through
>
> [NAME],
>
> Good conversation. Recapping so you have it in writing:
>
> **What you told me:**
> - [$X]/month going to third-party lead sites for leads you rent
> - Your own site produces [X] leads a month
> - Inventory is [manual/automatic]; sold cars stay live for [X] days
> - Leads land in an inbox with no way to tell who's ready to buy
>
> **What we'd build:**
> 1. **Get found** — [X] city landing pages, refreshed automatically every week, plus the structured data that puts you in Google's map results and in AI answers when someone asks where to sell or buy a car near [city]
> 2. **Convert** — seven lead capture flows including a dedicated *sell your car* funnel that feeds you acquisition units directly
> 3. **Close faster** — Deal Desk dashboard that scores every visitor's behavior and tells your team who to call first
>
> Plus daily automatic inventory sync, so a sold car is off the site the next morning without anyone touching it.
>
> Live example: https://www.speedwaymotorsllc.com — same kind of dealership, 20 minutes from you. Worth clicking /locations/newark-nj to see what a city page actually looks like.
>
> Investment: [$X] build, [$Y]/month. You own the code, the database, and every lead.
>
> Next step: [SPECIFIC — date and time].
>
> [YOUR NAME]
> [PHONE]
</content>
</invoke>
