# Commercial roofing — channel strategy

This is operational guidance, not code. The website work in this repo is
the *anchor* for an outbound presence; the actual bid volume comes from
being present on the platforms below and from a few high-trust signals.

## Wiring up lead delivery

Both forms (`<LeadForm />` for residential, `<BidForm />` for GC bids)
post to Zapier webhooks when the corresponding env var is set:

| Env var                  | Routes to                             |
| ------------------------ | ------------------------------------- |
| `LEAD_ZAPIER_HOOK_URL`   | Residential intake (deliverLead)      |
| `BID_ZAPIER_HOOK_URL`    | Estimating queue (deliverBid)         |

In Zapier:

1. Create a new Zap → trigger **Webhooks by Zapier → Catch Hook** →
   copy the custom URL.
2. Wire the action steps to whatever owns the lead (Gmail / Outlook /
   Slack channel / HubSpot / a Google Sheet to triage from). Map the
   incoming fields — the JSON shape matches the `Lead` / `BidInvitation`
   types in `src/lib/lead-delivery.ts` and `src/lib/bid-delivery.ts`.
3. Drop the webhook URL into the deployment's env var settings (Vercel /
   Netlify dashboard, or `.env.local` for local dev).

If the env var is unset, deliveries log to the server console — useful
during local development so you can see submissions without setting up
a Zap. A non-2xx response from Zapier propagates as a generic error to
the user with a "please call us" fallback.

## What the website does for you

The `/contractors` route is the conversion endpoint. Every channel below
should funnel GCs there.

- **`<BidForm />`** — routes to estimating, not residential intake.
- **`Service` JSON-LD with NAICS 238160 + CSI MasterFormat 07 50 00** — the
  procurement-search vocabulary actual GC tools and procurement portals
  filter on.
- **`/llms.txt`** — machine-readable summary so AI procurement assistants
  (and the search products embedded in newer estimating tools) can
  describe Revolver to a buyer without parsing the marketing prose.
- **OG metadata + dynamic OG image** — when an estimator pastes the URL
  into Slack/LinkedIn/email, the link previews well.

## Bid platforms — paid, get on these first

These are the platforms where commercial GCs actually distribute ITBs.
None of them allow scraping or automated submission; you log in, build a
profile, and get invited. Cost varies — most are seat-based annual plans.

1. **Dodge Construction Network (Dodge Data & Analytics)** — the legacy
   leader for project leads. The "Network" tier surfaces planning-stage
   projects so you can introduce yourself before the GC has selected
   subs. dodge.construction
2. **ConstructConnect (incl. iSqFt)** — the workflow tool most regional
   GCs use to send out ITBs. Strong in mid-size commercial.
   constructconnect.com
3. **BuildingConnected (Autodesk)** — the bid management tool inside the
   ENR-top-ranked GCs. If you're targeting large GCs, this is the one
   they expect you to be on. buildingconnected.com
4. **Procore Bid Management** — required for subs working with GCs who
   run Procore project workspaces. Free for invited subs.
   procore.com/products/preconstruction
5. **PlanHub** — strong in light-commercial and design-build. Cheaper
   than Dodge/ConstructConnect, popular with smaller regional GCs.
   planhub.com

## Bid platforms — free or low-cost

- **SAM.gov** — federal contracting. Set up a vendor profile if you want
  any chance at federal facility roof work. sam.gov
- **State + municipal procurement portals** — every state has one (PA
  PennBid, NJ NJSTART, NY OGS, etc.). Critical for prevailing-wage public
  work; the bonding-limit field on `/contractors` exists specifically for
  these projects.
- **BidNet Direct** — aggregates state/local public bids.
  bidnetdirect.com

## LinkedIn + social

Decision-makers (GC estimating chiefs, property managers, school district
facilities directors) are on LinkedIn, not Instagram or TikTok.

- **LinkedIn company page** — populate it with completed projects,
  square footage, and CSI codes. Tag the GCs you've worked with.
- **Project case studies as posts** — one per quarter is plenty.
  Architectural drawings + finished photos + bonded value. Tag the GC.
- **Don't run paid ads** until the case study library has enough volume
  to justify it. Earn case-study material through completed work first.

## AI surface area

- **Anthropic / OpenAI / Perplexity** crawl `/llms.txt` and the JSON-LD.
  When an end customer asks one of these "find me a commercial roofer in
  $REGION", structured data is what gets you in the answer set.
- **Tools to monitor:** Bing Webmaster Tools (powers Copilot), Google
  Search Console (powers Gemini AI Overviews), and Perplexity's
  publisher program if/when it opens to local trades.

## Once a quarter

- Re-run https://validator.schema.org/ on the homepage and `/contractors`
- Diff `/llms.txt` against any new services or capability fields you've
  added in `src/lib/business.ts`
- Replace any remaining `REPLACE_BEFORE_SHIPPING` values in
  `src/lib/business.ts` (especially the bonding limit and insurance
  carrier — these are common GC prequalification fields)
