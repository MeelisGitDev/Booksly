# Booksly

**Trust before automation** · Singapore-first bookkeeping prototype

Booksly uses Next.js 15, React, TypeScript, Supabase Auth and PostgreSQL. Customers clarify transactions and accountants review classification proposals in a shared workflow. Provider imports, AI classification and evidence matching remain simulated. Approval does not post to an accounting ledger.

## Run locally

Requires Node.js 20.9 or later.

```bash
npm install
```

Create `.env.local` with the values described in [`.env.example`](.env.example). Use the existing Supabase project with its configured tables, RLS policies and database functions; this repository does not contain their SQL setup.

```bash
npm run dev
```

Open http://localhost:3000/login and sign in with an account in your configured Supabase project.

## Documentation

- [Technical guide](docs/technical-overview.md): architecture, TypeScript basics, authentication, data flow, endpoints and current limits.
- [Function reference](docs/functions.md): explanations generated from source JSDoc comments, including React callbacks.

Hover over named functions in your IDE to read their comments. After changing source comments, regenerate the reference:

```bash
npm run docs
```

Check the production build:

```bash
npm run build
```

## Explore the workflow

1. View transaction totals, outstanding questions and the review queue.
2. Open a transaction to see its classification, evidence and audit history.
3. As a customer, submit a clarification for a transaction needing customer input.
4. With an authorized accountant account, correct a classification or approve an eligible proposal.
5. Use **Reset demo** to request the database demo reset after confirmation. Its scope and permissions are determined by the installed `reset_booksly_demo` function.

The **Demo view** selector previews customer/accountant screens. It does not change your authenticated account or grant permissions. The active persistence layer is Supabase; the JSON storage and seed helpers in `lib` remain from the earlier local version.

Live provider imports, actual file uploads, OCR, live AI classification, GST determination and accounting export are not implemented. The workspace header still shows a static demo company name.

## AI usage disclosure

This prototype and its source code were prepared with assistance from ChatGPT. Classification suggestions and document evidence in the sample dataset are simulated, not outputs from a live AI service.
