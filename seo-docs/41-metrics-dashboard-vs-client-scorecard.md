---
title: "Metrics Dashboard vs Client Scorecard: Which Agencies Should Use"
description: "Dashboards, scorecards, and narrative reports solve different problems. A decision framework for which to give each client — and the hybrid most agencies need."
keyword: "metrics dashboard"
date: "2026-09-11"
phase: 4
---

Most agencies have had this conversation internally without resolving it: should clients get a dashboard, or a report?

It usually gets settled by whatever tool was bought, which is backwards. The three formats — metrics dashboard, client scorecard, narrative report — answer different questions for different readers. Giving a client the wrong one produces the same symptom every time: they stop looking at it, and you can't tell whether the work is landing.

Here's how to decide, and why most agencies end up running two of the three.

## Definitions That Matter in Client Meetings

### Metrics Dashboard

Many widgets. Filters, date pickers, segments, drill-downs. Built to answer questions you haven't thought of yet.

**Reader:** an analyst, or a genuinely data-fluent client.
**Strength:** exploration. When a question comes up mid-call, the answer is two clicks away.
**Weakness:** it demands that the reader know what to look for. Show one to a business owner and the most common response is polite silence.

### Client Scorecard

Five to nine KPIs with period comparisons and status. No exploration. Designed to be understood in under a minute.

**Reader:** owners, executives, anyone whose job isn't marketing.
**Strength:** instant comprehension. The client learns where to look and checks it in seconds.
**Weakness:** it can't answer follow-ups. When someone asks *why* a number moved, the scorecard has nothing.

### Narrative Report

A document with analysis, context, and recommendations. Monthly ritual. Sometimes a PDF, sometimes a Doc, sometimes the body of an email.

**Reader:** whoever makes decisions about the budget.
**Strength:** it explains causation and ends in a plan. This is the format that renews retainers.
**Weakness:** effort to produce, and stale the moment it's sent.

The distinction that matters: **a dashboard answers "what's the number," a scorecard answers "are we OK," and a report answers "what does it mean and what are we doing."** Those are three different questions and no single artifact answers all three well.

## Which to Use When

Score the client on four dimensions.

**1. How data-fluent is the reader?**

- Reads charts comfortably, asks about segments → dashboard works
- Understands the basics, doesn't want to dig → scorecard
- Wants a conclusion, not data → narrative report, scorecard at most

**2. How long are your meetings?**

- 60-minute working sessions → dashboard, explored live
- 20-30 minute reviews → scorecard plus narrative
- No meetings, async only → narrative report, written to stand alone

**3. How mature is the retainer?**

- **Month 1–3:** narrative report. Trust is being built and every number needs context. A dashboard this early invites misreading before the client knows what normal looks like.
- **Month 4–12:** add a scorecard. They now know the baseline and want to check in between calls.
- **Year 2+:** dashboard access if they want it. They've earned the context to read it correctly.

**4. What's the risk of overwhelm?**

The honest question: if this client saw forty widgets, would they engage or disengage? For most non-marketing clients the answer is disengage — and a disengaged client is one who can't see your value, which becomes a renewal problem.

## The Hybrid Most Agencies Should Run

For the large majority of agency clients:

**Always-on scorecard.** Seven KPIs, current, accessible anytime. Kills the "can you check how we did last week" email and gives the client a sense of control.

**Monthly narrative report.** The analysis, the causation, the recommendations. The thing that makes the retainer feel worth it.

**Dashboard for your team only.** Your analysts need exploration. Clients usually don't. This split is the one most agencies get wrong — they buy one tool and expose the analyst view to everyone because it's what the tool does.

The failure mode is treating the dashboard as the deliverable. A dashboard is infrastructure. The deliverable is the interpretation.

## Designing a Scorecard That Doesn't Lie

A scorecard's compression is its value and its danger. Seven numbers can tell the truth or hide it depending on which seven.

**Rules:**

**Include at least one number that can make you look bad.** A scorecard of only favorable metrics is marketing collateral. Clients eventually notice that everything is always green, and then none of it counts.

**Pair volume with quality.** Sessions next to conversion rate. Leads next to cost per lead. A volume metric alone can rise while the business gets worse.

**Use consistent time comparisons.** Same comparison every month — MoM and YoY. Switching to whichever window flatters the number is the most common quiet dishonesty in agency reporting, and sophisticated clients spot it.

**Show the target where one exists.** A number without a target is trivia. If no target was agreed, either agree one or report the trend instead of implying a standard.

**Don't use color status without defined thresholds.** Red/amber/green is useful only if the thresholds were set in advance. Choosing colors after seeing the numbers makes green meaningless.

**Cap it at nine.** Past nine, people stop reading all of them, which means they read whichever ones happen to be first.

### Example Scorecard

```
NORTHSIDE DENTAL — August 2026

                        Aug      Jul     MoM     Target    Status
New patient forms        61       48   +27.1%       50     Above
Phone clicks            141      123   +14.6%        —     —
Organic sessions      3,412    3,088   +10.5%        —     —
Conversion rate       1.79%    1.55%  +0.24pt     1.50%    Above
Cost per lead           $38      $44   -13.6%      $45     Above
Paid social CPL         $71      $66    +7.6%      $45     Below
Avg position            8.2      9.1     +0.9        —     —
```

Note the paid social row. It's below target, it's visible, and including it is what makes the other five "Above" rows believable. Also note which rows have no target — reported as trend, not graded against a standard nobody agreed to.

For choosing which KPIs belong here, see [the KPIs for client analytics reports](/blog/kpis-client-analytics-report) and, for organic specifically, [SEO KPIs with GA4 sources](/blog/seo-kpis-client-report-ga4).

## Common Failure Modes

**The 40-widget QBR.** An agency presents a full analyst dashboard in a quarterly review. The client nods through it and retains nothing. Everyone leaves feeling the meeting was thorough and no decision was made.

**The scorecard with no actions.** Seven beautiful numbers and no "so what." The client sees green and concludes things are handled — which is fine until you need budget for something, and you've spent a year training them that everything is fine.

**The dashboard nobody opens.** Built in week one, shared, never visited again. Check your access logs. Most agencies discover the number is zero, and that's useful information about which format that client actually needs.

**The report that's really a dashboard screenshot.** A PDF of dashboard panels with no narrative. It has the cost of a report and the value of neither format.

**Same format for every client.** The tool supports one thing, so everyone gets it. The 30-client agency and the solo founder have genuinely different needs.

## Mapping to Tooling

**Need exploration and custom models** → Looker Studio or a BI tool. Flexible, high maintenance, poor for client readability. See [Looker Studio alternatives for agencies](/blog/looker-studio-alternatives-agencies).

**Need client-readable scorecards from GA4** → a simple GA4 dashboard, ours included. Fast, narrow, readable. Won't do exploration.

**Need multi-channel scorecards** → an agency reporting platform. Broader and more expensive; see [best client reporting tools for agencies](/blog/best-client-reporting-tools-agencies).

**Need narrative reports** → a document, always. No tool writes the causal explanation, because no tool knows you fixed the mobile checkout in week two.

> The thing I kept running into in client report meetings — back when the media company I worked at had turned into a digital agency — was that the data was good and the format was wrong. That's the entire reason Helpful Analytics is a scorecard-shaped product rather than an exploration tool. The hard problem was never getting the numbers.
>
> — Brooks Conkle, founder of Helpful Analytics

## Frequently Asked Questions

**What's the difference between a dashboard and a scorecard?**
A dashboard is exploratory — many metrics, filters, drill-downs, built for someone investigating. A scorecard is a fixed set of five to nine KPIs with comparisons, built to be understood in under a minute.

**Should clients have dashboard access?**
Depends on the client. Data-fluent clients benefit. Most others either don't log in or log in and misread something, which generates email. A scorecard is safer for the majority.

**How many metrics should a client scorecard have?**
Five to nine. Past nine, people read the first few and skim the rest, which defeats the compression that makes a scorecard useful.

**Do we still need a monthly report if the client has a live dashboard?**
Yes. The dashboard shows what happened; the report explains why and what you're doing about it. The explanation is what clients are paying for.

**What if a client asks for both a dashboard and a PDF?**
Give them both — it's the standard hybrid. Just make sure the PDF isn't a screenshot of the dashboard. Different formats should do different jobs.

**How do I know which format a client actually wants?**
Check whether they open what you send. Access logs and email opens tell you more than asking, since clients tend to say yes to anything offered.

---

If the scorecard half of this is what you're missing, [Helpful Analytics](https://helpfulanalytics.com) is built around exactly that shape — a small, current, client-readable GA4 view per property, white-labeled as yours. 14-day free trial.

---

**Related Articles**
- [The KPIs That Belong in Every Client Analytics Report](/blog/kpis-client-analytics-report)
- [SEO KPIs to Put in Every Client Report](/blog/seo-kpis-client-report-ga4)
- [Branded Analytics Dashboards](/blog/branded-analytics-dashboard)
- [Agency Reporting Dashboard Templates](/blog/agency-reporting-dashboard-templates)
