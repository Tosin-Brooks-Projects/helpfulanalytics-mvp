---
title: "GA4 Client Onboarding Checklist for Agencies (Step-by-Step)"
description: "A practical checklist agencies use to onboard new clients into GA4 — from access setup through property audit, conversion verification, dashboard creation, and client walkthrough."
keyword: "GA4 client onboarding checklist agency"
date: "2026-05-01"
phase: 2
---

You've signed a new client. The proposal is signed, the kickoff call is done, and now someone on your team needs to actually set up their analytics. If you don't have a standard process, this is where time disappears: hunting down access, auditing a half-built GA4 property someone set up two years ago, trying to figure out what's being tracked and what isn't.

This checklist covers the full GA4 onboarding process — from first access request to the client's first report walkthrough. Adapt it to your agency's workflow, but the sequence here is deliberate.

---

## Phase 1: Access and Account Setup

**1.1 Request property access**

Ask the client to grant your agency's email (ideally a shared service account, not a personal email) **Editor** access on their GA4 property. If they don't have a GA4 property yet, walk them through creating one under their own Google account — don't create it under your agency account.

Do not accept admin credentials to their Google account. Request property-level access only.

**1.2 Verify property ownership**

Confirm the property is owned by the client's Google account, not a previous agency or freelancer. Check under Admin > Property Settings. If the property is owned by someone who no longer works with the client, flag this immediately — recovering access to a property you don't control is a real problem.

**1.3 Check for existing GTM container**

Ask if the site already has Google Tag Manager. If yes, request Container access (the minimum you need is Editor or Publish access, depending on your workflow). If there's no GTM, plan to install it — you'll need either developer access to the site or a CMS with direct GTM support.

**1.4 Check for existing Google Ads and Search Console**

Confirm whether Google Ads and Search Console are already linked to the GA4 property. If not, add these links during setup — it takes two minutes each and adds significant reporting value.

---

## Phase 2: Property Audit

Before making any changes, understand what's already there.

**2.1 Check data retention setting**

Go to Admin > Property Settings > Data Settings > Data Retention. If it's set to 2 months (the default), change it to 14 months immediately. This setting is not retroactive — data retention only applies from the moment you change it forward.

**2.2 Review existing conversions**

Go to Admin > Events and check which events are marked as conversions. Common problems:
- No conversions set up at all
- Everything marked as a conversion (inflates numbers)
- Conversions marked with vague names (`gtm_event`, `click`) that don't tell you what happened

Document what's currently marked as a conversion and flag anything that needs to change.

**2.3 Check for internal traffic filters**

Go to Admin > Data Settings > Data Filters. Confirm that the client's office IP and your agency's IP are excluded. Missing this filter means your own browsing and testing activity inflates the client's session counts.

**2.4 Review channel groups**

Check the default channel group settings. Are there unassigned traffic sources? Is email traffic being categorized correctly? Are any known referral sources miscategorized? Flag anything that looks wrong — you'll fix it in Phase 3.

**2.5 Verify the base GA4 tag is firing**

Use GTM Preview or GA4's DebugView to confirm that the GA4 configuration tag is firing on every page of the site. Look for pages that might be excluded — password-protected sections, checkout subdomains, or third-party landing pages that aren't on the main domain.

---

## Phase 3: Conversion Tracking Verification

**3.1 Test existing conversion events**

For each event marked as a conversion, go through the actual user flow and confirm the event fires. Use GTM Preview + DebugView simultaneously. Common failures:
- Form submission event fires on button click, not on successful submission (fires even with validation errors)
- Thank-you page redirect is broken so the conversion event never fires
- Event fires multiple times per action (duplicate conversions)

Fix any issues before proceeding. Broken conversion tracking makes every downstream report unreliable.

**3.2 Set up missing conversion events**

Based on what matters for this client's business, add any conversion events that are missing. Typical defaults:
- Form submission / lead capture
- Phone call click (if call tracking is in use)
- Purchase / checkout completion (ecommerce)
- Appointment booking

Deploy via GTM, test in preview mode, confirm in DebugView before marking as live conversions.

**3.3 Document the conversion setup**

Create a brief document (even a short note in a shared sheet) recording each conversion event, what it tracks, how it's deployed, and when it was verified. This is essential when someone else takes over the account or when you need to debug a discrepancy three months from now.

---

## Phase 4: Dashboard Setup

**4.1 Create the client's reporting dashboard**

Build the client's dashboard using your standard template. Whether you use Looker Studio, Helpful Analytics, or another tool, the goal is a live, shareable dashboard that updates automatically and doesn't require monthly manual rebuilding.

Include at minimum:
- Sessions and traffic source breakdown
- Conversions by channel
- Month-over-month trend
- Key landing pages

**4.2 Configure the date range and comparison**

Set the default date range to the last 30 days with a previous period comparison. Clients who open the dashboard on the 15th of the month should see useful data, not an empty view or a confusing half-month.

**4.3 Apply white-label or brand settings if applicable**

If your agency provides white-label reporting, set the client's logo and colors in your reporting tool now, before you share the link. See: [white-label analytics reporting](/blog/white-label-analytics-reporting)

**4.4 Share the dashboard link with appropriate access**

Send the client a view-only link (not edit access). Include brief instructions: what the dashboard shows, how to read it, who to contact with questions. A sentence or two is enough — if the dashboard requires more explanation than that, it's probably too complex.

---

## Phase 5: Client Walkthrough

**5.1 Schedule a 30-minute walkthrough call**

Walk the client through their dashboard on a screen-share call. Don't just share the link and hope they figure it out. A 30-minute call at the start saves you 10 hours of follow-up questions over the first three months.

Cover:
- What they're looking at and why those metrics were chosen
- Where to find the data they're most likely to want
- How often the data updates and what the normal data delay looks like
- Who to contact if something looks wrong

**5.2 Set expectations on data accuracy**

Be upfront about:
- The 24-48 hour data delay on GA4 standard reports
- Discrepancies between GA4 and platform-native data (Google Ads, Shopify admin, etc.) — normal, expected, and not a sign that anything is broken
- What GA4 can and can't track (phone calls without call tracking, activity inside third-party iframes, etc.)

See: [how to explain analytics to clients](/blog/how-to-explain-analytics-to-clients)

**5.3 Agree on reporting cadence and format**

Confirm: how often will you send reports or review the dashboard together? Monthly is standard. Quarterly business reviews are common for longer-term clients. Set this expectation explicitly so neither side is guessing.

---

## Quick Reference: Onboarding Checklist Summary

| Phase | Task | Done |
|-------|------|------|
| Access | GA4 property access granted to agency | ☐ |
| Access | Property owned by client's account | ☐ |
| Access | GTM container access | ☐ |
| Access | GA4 linked to Google Ads and Search Console | ☐ |
| Audit | Data retention set to 14 months | ☐ |
| Audit | Conversions reviewed | ☐ |
| Audit | Internal IP filter applied | ☐ |
| Audit | Channel groups checked | ☐ |
| Audit | Base GA4 tag confirmed firing | ☐ |
| Conversions | All conversion events tested and verified | ☐ |
| Conversions | Missing conversions added | ☐ |
| Conversions | Conversion setup documented | ☐ |
| Dashboard | Client dashboard created | ☐ |
| Dashboard | Date range and comparisons configured | ☐ |
| Dashboard | White-label settings applied | ☐ |
| Dashboard | Shared with client (view-only) | ☐ |
| Walkthrough | 30-min walkthrough call completed | ☐ |
| Walkthrough | Data expectations set | ☐ |
| Walkthrough | Reporting cadence agreed | ☐ |

---

## Frequently Asked Questions

**How long does a full GA4 onboarding take?**
With a standardized process and a good template, most agencies complete the full onboarding in 2-4 hours spread across the first week. Phase 1 (access) often takes longer than the technical setup because you're waiting on client responses. Start requesting access on day one.

**What if the client's existing GA4 setup is a mess?**
This is common. Prioritize: (1) get the base tag firing correctly, (2) get at least one clean conversion event working, (3) exclude internal traffic. Everything else can be cleaned up in subsequent months. Don't let a complicated audit delay the client's first report.

**Should I use my agency's Google account or the client's to set up GA4?**
The client's. Always. This protects you both — the client retains ownership of their data, and you don't have a liability if the relationship ends. Your agency account should have Editor access, not ownership.

**What's the minimum viable GA4 setup before I can start reporting?**
Base tag firing, at least one conversion event verified, and internal traffic excluded. Everything else improves report quality but isn't required to start. Get these three things right and your first report will be credible.

---

A clean onboarding process makes every subsequent month easier — cleaner data, fewer client questions, faster reporting cycles. If you want to compress the dashboard creation step significantly, [Helpful Analytics](https://helpfulanalytics.com) offers pre-built agency dashboard templates that connect to GA4 in minutes rather than hours. Start your free trial and spend your onboarding time on insights, not setup.
