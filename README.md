# Booksly

**Trust before automation** · Singapore-first bookkeeping workflow prototype

**Live demo:** https://booksly-liard.vercel.app  
**Status:** Interactive assessment prototype — not a production accounting system

Booksly explores a focused problem: **how can a small business reduce routine bookkeeping work without allowing incomplete or incorrectly classified transactions into its accounting records?**

The prototype presents simulated Stripe and Airwallex transactions in a shared customer–accountant workflow. Customers resolve missing context; accountants review classifications, handle exceptions and approve eligible transactions. Actions are recorded in an audit trail. **Approval in Booksly does not post or export anything to an accounting ledger.**

## Try the live demo

1. Open **https://booksly-liard.vercel.app**.
2. Sign in using a demo account provided separately by the project author.
3. Follow the customer and accountant scenarios below.

**Demo access:** Two roles are represented: **customer** and **accountant/admin**. Credentials are intentionally **not published in this repository**. Request access from the project author if it has not been provided with the submission. Authentication and authorization use the signed-in Supabase account; switching the **Demo view** selector only previews a screen and does **not** change permissions.

The demo contains **12 seeded transactions**. It uses shared demo data: actions and resets may affect what another reviewer sees. An authorized administrator can use **Reset demo** to restore the initial scenario; this is a demo-only operation, not a production bookkeeping feature.

## Walk through the product

### 1. Normal path — accountant review

1. Sign in with an authorized accountant/admin account.
2. Open a transaction marked **Ready**.
3. Inspect the proposed category, available evidence and audit history.
4. Approve an eligible transaction and observe the status and audit trail update.

### 2. Exception path — missing customer information

1. Sign in as a customer and open a transaction requiring customer input (for example, `tx03`).
2. Submit a clarification describing the business purpose of the transaction.
3. Sign in as an accountant/admin and review the new information.
4. Correct the classification if needed, then approve when the required checks pass.
5. Inspect the recorded actions and version changes.

### 3. Restart the demonstration

An authorized administrator can select **Reset demo** and confirm the operation. The installed database function `reset_booksly_demo` controls its permissions and scope. **Reset is destructive for demo changes and audit events**; do not use this pattern for a real accounting ledger.

## Product approach and decisions

| Decision | Rationale |
| --- | --- |
| Exception-first workflow | Direct human attention to unclear transactions instead of asking someone to review every item from scratch. |
| Customer and accountant collaboration | The customer supplies business context; the accountant owns the classification and approval decision. |
| Deterministic checks before approval | Block invalid transitions and missing required information independently of any future AI suggestion. |
| Version checks and audit trail | Make conflicting updates visible and preserve a record of the review process during normal operation. |
| No accounting-system posting in the prototype | Demonstrate a trustworthy review boundary before introducing an irreversible downstream integration. |

**Initial market:** Singapore. Hong Kong is a possible later market, but jurisdiction-specific tax and accounting rules are not implemented in this prototype.

## What works — and what is simulated

| Area | Prototype status |
| --- | --- |
| Login and role-based access | Implemented using Supabase Auth, server-side route protection and PostgreSQL RLS |
| Transaction inbox and details | Implemented for seeded demo transactions |
| Customer clarification and accountant review | Implemented |
| Classification correction, approval and version checks | Implemented through database-backed actions |
| Audit trail | Implemented for workflow actions |
| Admin demo reset | Implemented for the seeded demo scenario |
| Stripe and Airwallex imports | **Simulated** — no live provider connection |
| AI-generated classification | **Simulated** — sample suggestions are not produced by a live model |
| Evidence extraction / file uploads / OCR | **Not implemented** |
| Singapore GST determination | **Not implemented** |
| Accounting ledger posting or export | **Not implemented** |

The displayed company name is currently static demo UI text. This is an interactive workflow demonstration, not an end-to-end automated bookkeeping service.

## Architecture at a glance

```text
Browser (Next.js / React)
        |
        v
Next.js server routes and authentication checks
        |
        v
Supabase Auth + PostgreSQL
  - company membership and role checks
  - transactions and classifications
  - database action functions
  - audit history and row-level security
```

- **Frontend / server:** Next.js 15, React, TypeScript.
- **Authentication and persistence:** Supabase Auth and PostgreSQL with row-level security (RLS).
- **Workflow mutations:** Server API routes invoke database functions for authorized state changes.
- **Hosting:** Vercel for the live application; Supabase for authentication and data.

The active persistence layer is Supabase. Earlier JSON storage and seed helpers remain in `lib` from the local prototype iteration and are not the live application's persistence mechanism.

For implementation detail, see the [technical guide](docs/technical-overview.md) and [function reference](docs/functions.md).

## Run locally

**Prerequisite:** Node.js 20.9 or later.

```bash
npm install
```

Create `.env.local` using the variable names documented in [`.env.example`](.env.example). Configure the URL and **publishable** Supabase key for a project that already has the required database tables, RLS policies, demo data and database functions.

> **Important:** This repository does **not** include the SQL setup needed to provision a fresh Supabase project. Cloning the repository alone is not sufficient to reproduce the database. Do not place service-role keys or passwords in source control.

```bash
npm run dev
```

Open http://localhost:3000/login and sign in with an account provisioned in the configured Supabase project.

To validate the production build:

```bash
npm run build
```

To regenerate the function reference after changing source comments:

```bash
npm run docs
```

## How I would evaluate the next iteration

The intended product outcome is **less bookkeeping effort without a higher error rate**. The following are **proposed metrics, not measured prototype results**:

- **Time to close a transaction:** median time from import to accountant approval.
- **Human touch rate:** percentage of transactions requiring customer or accountant intervention.
- **Exception resolution time:** time from an information request to a usable response.
- **Rework rate:** percentage of classifications changed after initial review.
- **Control effectiveness:** invalid or unsupported transactions blocked before downstream posting.

A production pilot would establish a baseline, compare assisted and existing workflows, and review accounting accuracy before enabling any export.

## Scope, limitations and next steps

This prototype intentionally prioritizes the **normal path and one meaningful exception path** over integration breadth. Before a production release, the product would need real provider ingestion, deduplication and reconciliation, durable evidence collection, jurisdiction-specific accounting and tax rules, operational monitoring, security review, and a controlled accounting-system integration. Human approval would remain a release gate for uncertain cases.

The **Demo view** selector is a UI preview, not an authorization mechanism. Actual permissions are enforced against the authenticated user. The demo reset is intentionally limited to a demonstration environment; real audit records must not be erased as part of normal operations.

## AI usage disclosure

ChatGPT and coding assistance were used during product reasoning, prototyping, code development and documentation. The resulting implementation was reviewed and tested as a working prototype. **No live AI classification or document understanding service is connected**; classification suggestions and evidence in the seed dataset are simulated. The product design deliberately keeps deterministic validation and human review separate from any future AI-generated proposal.

---

**Assessment focus:** product judgment, a working customer/accountant workflow, safe handling of exceptions, transparent trade-offs and a credible path from prototype to production.
