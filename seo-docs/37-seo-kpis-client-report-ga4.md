---
title: "SEO KPIs to Put in Every Client Report (With GA4 Sources)"
description: "The SEO KPIs that belong in client reports, where each one lives in GA4 or Search Console, and how to explain them to someone who isn't an SEO."
keyword: "seo kpis"
date: "2026-09-11"
phase: 4
---

There are roughly two hundred metrics you could report on for an SEO retainer. About eight belong in the client report.

The rest aren't useless — they're diagnostic. They help *you* figure out what's happening. But a client report isn't a diagnostic tool, and treating it like one is how agencies end up with twelve-page documents nobody finishes.

This covers the client-facing SEO KPI set: which metrics, where each one comes from in GA4 or Search Console, and how to explain it to someone whose job isn't marketing.

## The Two-Part Test

Before a metric goes in a client report, it has to pass both:

**1. Would a change in this number change a decision?** If organic sessions drop 20%, you do something. If "pages per session" drops 20%, what exactly happens? For most retainers, nothing. That's a diagnostic metric, not a KPI.

**2. Can a non-SEO understand it in ten seconds?** Not the underlying mechanics — the *direction*. Up is good, down is bad, here's roughly why. Engagement rate fails this test without explanation, which is why it needs careful handling rather than exclusion.

Metrics that fail both are vanity metrics. Metrics that pass one need framing. Metrics that pass both are your report.

## The Core SEO KPI Set

### Organic Sessions

The baseline volume metric. How many visits arrived from organic search.

**Where:** GA4 → Reports → Acquisition → Traffic acquisition, filtered to `Organic Search` in the session default channel group.

**Explaining it:** "How many visits came from someone finding you on a search engine, rather than clicking an ad or typing your address directly."

**Watch for:** sessions alone proves nothing. A traffic increase from irrelevant queries is not a win. Always pair with a conversion metric — the pairing is what makes it meaningful.

### Engaged Sessions and Engagement Rate

GA4's replacement for bounce rate, and a genuine improvement — a session counts as engaged if it lasts over 10 seconds, fires a key event, or has 2+ pageviews.

**Where:** GA4 → Traffic acquisition, add the engagement columns.

**Explaining it:** "The share of visits where someone actually did something — stayed, read, clicked through — rather than landing and leaving immediately."

**Watch for:** clients who remember bounce rate will try to map this to it. They're near-inverses but not equivalents, and a client comparing your engagement rate to a bounce rate they remember from 2022 will reach a wrong conclusion. Say plainly that the metric changed and what the new one means. More on translating these shifts in [how to explain analytics to clients](/blog/how-to-explain-analytics-to-clients).

### Key Events From Organic

The metric that connects SEO to the business. Form submissions, calls, demo requests, purchases.

**Where:** GA4 → Traffic acquisition with key events columns, or an Exploration filtered to organic.

**Explaining it:** don't explain "key events" at all. Name the actual thing: "31 contact form submissions and 16 phone clicks came from organic search."

**Watch for:** this is the metric most likely to be misconfigured. If key events were changed mid-period, your comparison is broken and you need to say so. Setup detail in [GA4 conversion tracking for agencies](/blog/ga4-conversion-tracking-agencies).

### Organic Landing Page Performance

Which pages are actually earning the traffic and conversions.

**Where:** GA4 → Reports → Engagement → Landing page, filtered to organic.

**Explaining it:** "These are the pages people land on first when they find you through search."

**Watch for:** report on the pages you've *worked on*, plus the top performers. A full landing page table is diagnostic, not client-facing.

### Search Console: Clicks, Impressions, CTR

Visibility upstream of the visit. Impressions mean you appeared; clicks mean you were chosen.

**Where:** Search Console → Performance → Search results.

**Explaining it:** "Impressions are how often you showed up in search results. Clicks are how often someone picked you. CTR is the percentage who picked you after seeing you."

**Watch for:** the common pattern of impressions up, CTR down. It usually means you're ranking for *more* queries, including ones where you're not the best answer. That's often fine. Unexplained, it reads as failure.

### Average Position (Carefully)

**Where:** Search Console → Performance.

**Watch for:** this is the most misread number in SEO reporting. It's an average across every query, device, and location where you appeared. It's a trend line, not a rank. Never write "we rank #7" from this number.

Honest options: report it as a trend only, or omit it and report target keyword movement instead. Many agencies are better off doing the latter.

### Target Keyword Movement

The agreed keyword set, with positions and a reason for each move.

**Where:** your rank tracker. Search Console average position is not a substitute.

**Explaining it:** "These are the specific searches we agreed to compete for, and where you currently show up."

**Watch for:** keep the set small — ten to twenty-five. And include a notes column. "Slipped 3 after a competitor published a comparison page" is analysis. A number alone is homework you handed back.

### Content Velocity and New Page Performance

Only if content production is in scope.

**Where:** GA4 landing page report filtered to pages published this period.

**Explaining it:** "Here's what we published, what each was targeting, and how it's performing so far."

**Watch for:** new content takes time. Reporting a new page's traffic after three weeks and calling it disappointing sets a false expectation. State the expected ramp — usually three to six months — the first time you report on a new page, not the third.

### Technical Health (Only When Actionable)

**Where:** Search Console → Pages report and Core Web Vitals.

Include only what's client-relevant: indexing changes, Core Web Vitals movement on key templates, migration issues. If nothing material happened, write one line saying so.

## KPI to Source Map

| KPI | Source | Exact location |
|---|---|---|
| Organic sessions | GA4 | Acquisition → Traffic acquisition, filter Organic Search |
| Engaged sessions / rate | GA4 | Same report, engagement columns |
| Key events from organic | GA4 | Traffic acquisition, key events column |
| Organic landing pages | GA4 | Engagement → Landing page, filter organic |
| Organic conversion rate | GA4 | Calculated: key events ÷ sessions |
| Clicks, impressions, CTR | GSC | Performance → Search results |
| Average position | GSC | Performance → Search results |
| Query movement | GSC | Performance → Queries, compare ranges |
| CTR opportunities | GSC | Performance → Pages, sort by impressions |
| Target keyword ranks | Rank tracker | Your tool |
| Indexing status | GSC | Pages report |
| Core Web Vitals | GSC | Core Web Vitals report |

Two standing caveats worth repeating to clients: **GA4 lags 24–72 hours**, so month-end reports pulled on the 1st are incomplete — wait until the 3rd or 4th. And **GA4 and Search Console will disagree** on click and session counts, because they measure different things at different points. Explain the gap once, early, rather than defending it every month.

## Presenting KPIs Without Drowning the Client

A four-layer structure that works across almost every retainer:

**1. Scorecard.** Five to seven KPIs with MoM and YoY deltas. One glance.

**2. Trend.** Twelve months where you have it. Context is what separates a bad month from a downward trend, and clients can't tell the difference without the chart.

**3. Story.** Two or three sentences explaining what drove the numbers. This is the part they'll actually remember.

**4. Ask.** What you're doing next and what you need from them.

Most reports have layer 1 and nothing else, or layers 1 and 2 with no story. The story is the value — everything above it is evidence for it. The full structure is in [SEO client reporting for agencies](/blog/seo-client-reporting-agencies).

### One-Liners for Explaining KPIs to a CEO

Keep these handy:

- **Organic sessions:** "People who found you through search."
- **Engagement rate:** "How many of those visits were real interest versus an immediate bounce."
- **Key events:** "Actions worth money — forms, calls, purchases."
- **Impressions:** "How often you showed up in search results."
- **CTR:** "How often people picked you after seeing you."
- **Average position:** "Roughly where you show up on average. Directional, not exact."
- **Organic conversion rate:** "Of the people who found you through search, how many did something."

## Vertical Notes

Conversion definitions shift by business model:

- **Local service** — calls, form fills, direction requests. Revenue attribution is usually impossible; don't fake it. See [GA4 for local service agencies](/blog/ga4-for-local-service-agencies).
- **Ecommerce** — revenue, transactions, AOV from organic. See [GA4 for ecommerce agencies](/blog/ga4-for-ecommerce-agencies).
- **B2B lead gen** — form fills, plus lead quality feedback from sales. Volume without quality is a trap. See [GA4 for B2B lead gen agencies](/blog/ga4-for-b2b-lead-gen-agencies).
- **SaaS** — trial starts and activation. Sessions barely matter. See [GA4 for SaaS agencies](/blog/ga4-for-saas-agencies).

## Copy-Ready KPI Checklist

```
EVERY MONTH
[ ] Organic sessions          MoM + YoY
[ ] Engaged sessions / rate   MoM + YoY
[ ] Key events from organic   MoM + YoY, named individually
[ ] Organic conversion rate   MoM + YoY
[ ] GSC clicks, impressions, CTR
[ ] Target keyword movement   with notes column
[ ] Top gaining / losing landing pages

WHEN IN SCOPE
[ ] New content performance   with expected ramp stated
[ ] Technical health          only if actionable
[ ] Links earned

NEVER
[ ] Full keyword position tables
[ ] Raw crawl exports
[ ] Pages per session, avg session duration (diagnostic, not KPI)
[ ] Any metric you can't tie to a decision
```

## Frequently Asked Questions

**What are the most important SEO KPIs for client reporting?**
Organic sessions, engaged sessions, key events from organic, and Search Console clicks and impressions. Those four cover volume, quality, business outcome, and visibility. Everything else supports them.

**What's the difference between SEO KPIs and general marketing KPIs?**
SEO KPIs are scoped to organic search. General marketing KPIs cover all channels and usually roll up to blended numbers like total leads or CAC. Our post on [KPIs for client analytics reports](/blog/kpis-client-analytics-report) covers the broader set.

**Is bounce rate still an SEO KPI?**
GA4 reports it as the inverse of engagement rate, so it exists, but engagement rate is the better metric and the one GA4 is built around. If a client insists on bounce rate, report engagement rate and explain the relationship once.

**How many KPIs should a client report include?**
Five to seven in the scorecard, with supporting detail behind them. Beyond that, clients stop reading the scorecard, which defeats its purpose.

**Why don't GA4 and Search Console numbers match?**
They measure different things. GSC counts clicks on search results; GA4 counts sessions that loaded tracking. Bounced clicks, blocked scripts, and different attribution windows all create gaps. A 10–20% difference is normal — explain it once rather than reconciling it monthly.

**Should I report keyword rankings to clients?**
Only an agreed target set, with a notes column explaining movement. Rankings vary by location, device, and personalization, so treat them as directional and always pair them with traffic and conversion data.

---

If assembling this KPI set by hand every month across every client is where your team's hours go, [Helpful Analytics](https://helpfulanalytics.com) pulls the GA4 side automatically into a client-readable scorecard — multi-property, white-label, 14-day free trial.

---

**Related Articles**
- [SEO Client Reporting for Agencies](/blog/seo-client-reporting-agencies)
- [The KPIs That Belong in Every Client Analytics Report](/blog/kpis-client-analytics-report)
- [How to Prove SEO ROI to Clients With GA4](/blog/ga4-prove-seo-roi-clients)
- [GA4 Conversion Tracking for Agencies](/blog/ga4-conversion-tracking-agencies)
