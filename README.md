# Booksly — Interactive assessment prototype

**Trust Before Automation** · Singapore-first · Next.js + TypeScript

This is a self-contained demonstration built from scratch because the existing Hubtal application was not provided. It does **not** connect to Stripe, Airwallex, Supabase, an LLM, or an accounting ledger. Source imports, classification proposals, evidence matching and authentication are **simulated**. The application implements actual API-backed state changes, accountant review guards, proposal version checks, and an audit history.

## Start on a Mac

Requires Node.js 20.9+ (Node.js 22 recommended).

```bash
unzip booksly-prototype.zip
cd booksly-prototype
npm install
npm run dev
```

Open http://localhost:3000

## Demo script (5 minutes)

1. **Overview** — see imported transactions and outstanding questions.
2. **Transactions** — open **Customer order #1043** (SGD 1,000), **Stripe processing fee** (−SGD 30), and **Stripe settlement** (SGD 970). They share `SETTLEMENT-1043`; the payout is an internal transfer, not new revenue.
3. **Customer role** — open **AWS** (missing invoice) or **NOVA GLOBAL** (unclear purpose). Enter a clarification, then submit. The item moves to **Needs accountant** and creates an audit event.
4. **Accountant role** — open **NOVA GLOBAL**, assign a category, and approve. Approval creates a new audit event. Other READY transactions can also be approved.
5. **Controls** — try approving an item before customer clarification; the UI blocks it. Server endpoints also validate role-intended actions and proposal versions (demo roles are not authenticated).
6. **Reset demo** restores initial sample transactions.

## Implemented

- Three responsive views: Overview, Transactions, Review queue
- Customer and accountant role switch for demonstration
- 12 realistic seeded Stripe/Airwallex records
- Explicit transaction status and proposal version
- Customer clarification -> accountant review
- Accountant classification correction and approval
- Server-side validation of state transitions and optimistic version checks
- Local audit history
- Reconciliation group illustration (Stripe gross, fee, payout)
- Reset to seed data

## Deliberately not implemented

- Supabase database, authentication, tenant RLS and file storage
- Live provider imports/webhooks and actual reconciliation engine
- Actual AI calls and document OCR
- Actual file upload or evidence verification
- Singapore GST determination
- Accounting export/posting
- Durable, multi-instance database persistence

**Important:** The role switch is a UI demo, not security. The API has no real authentication. Never expose this app with real financial data or represent it as production-ready.

## Persistence

The local dev server stores edits in `data/state.json` (gitignored). The file is created when the first change occurs. The initial records are seeded in `lib/seed.ts`. Reset restores the seed. This file-based storage is intentionally for **single-instance local demonstration only**; Railway instances can have ephemeral storage and concurrent writes are not safe. Before real deployment, replace it with Supabase PostgreSQL and implement authenticated server-side authorization, RLS, transactional updates and immutable audit records.

## Production path

1. Supabase tables: companies, memberships, source_transactions, transactions, proposals, documents, exceptions, review_decisions, audit_events, processing_jobs.
2. Supabase Auth, RLS by company, secure service-role boundaries.
3. Transactional versioned approval with optimistic concurrency.
4. Idempotent provider ingestion, reconciliation, background jobs and retries.
5. AI classification behind strict schema validation and deterministic controls.
6. Accounting-system export with idempotency, acknowledgement and reconciliation.

## AI usage disclosure

This prototype and its source code were prepared with assistance from ChatGPT. Classification suggestions and document evidence in the sample dataset are simulated, not outputs from a live AI service.
