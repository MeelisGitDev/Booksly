# Function reference

Generated from source JSDoc comments with `npm run docs`. Edit the comments in the TypeScript files, then regenerate this file. Line numbers refer to the source at generation time.

## [app/api/action/route.ts](../app/api/action/route.ts)

- **POST** (line 11): Handle POST /api/action for a signed-in user. Reset calls reset_booksly_demo; other supported actions validate the request, resolve the demo ID under RLS, and call apply_bookkeeping_action with the proposal version. Return a refreshed Store on success; return JSON errors with 400, 401, 403, 404, 409 or 500 status codes as applicable.

## [app/api/health/route.ts](../app/api/health/route.ts)

- **GET** (line 12): Handle GET /api/health for a verified user using the request's server client. Return 401 without a session; otherwise check a company query under RLS. Query success, even with zero visible rows, does not prove full database health.

## [app/api/me/route.ts](../app/api/me/route.ts)

- **GET** (line 10): Handle GET /api/me using the request session. Return the authenticated user's email and company memberships, including stored roles and company details. Return 401 when not signed in, or 500 when the membership query fails.

## [app/api/state-db/route.ts](../app/api/state-db/route.ts)

- **GET** (line 10): Handle GET /api/state-db as an alternative endpoint for the same normalised Supabase Store returned by /api/state. Disable caching; return 401 for Unauthorized and 500 for other caught errors.

## [app/api/state/route.ts](../app/api/state/route.ts)

- **GET** (line 10): Handle GET /api/state, the dashboard's primary data endpoint. Return the normalised Supabase Store with caching disabled. Map Unauthorized to 401 and other caught errors to 500.

## [app/api/transactions/route.ts](../app/api/transactions/route.ts)

- **GET** (line 10): Handle GET /api/transactions for a signed-in user. Return raw database transactions with nested classifications and a count, ordered by transaction date. Database RLS determines visible rows; this endpoint does not apply the first-company filter used by readSupabaseStore. Return 401 for authentication failure or 500 for a query error.

## [app/layout.tsx](../app/layout.tsx)

- **RootLayout** (line 6): Wrap every page in the shared English-language HTML document. The layout imports global CSS and exports the default page title and description; children is the current page content.

## [app/login/page.tsx](../app/login/page.tsx)

- **LoginPage** (line 12): Render the branded sign-in page and keep email, password, loading and error values in React state. Authentication is performed by handleLogin, not by the presentation markup.
- **handleLogin** (line 22): Prevent the form's browser reload and call Supabase signInWithPassword with the entered credentials. Show authentication errors; on success navigate to the dashboard and refresh Next.js server data.
- **Callback 3** (line 65): Update the email input's React state as the user types.
- **Callback 4** (line 66): Update the password input's React state as the user types; this callback does not log or send the password.

## [app/page.tsx](../app/page.tsx)

- **money** (line 6): Format a signed amount as Singapore dollars with two decimal places. Negative values get a minus sign; the number itself is formatted using the en-SG locale.
- **Home** (line 12): Render the interactive bookkeeping dashboard. Keep fetched data, navigation, selected transaction and form values in React state. The role selector previews UI only; it does not grant database permissions.
- **refresh** (line 18): Fetch the latest UI Store from GET /api/state without using cached data. Save the result in React state or show a loading error; this function does not modify database records.
- **Callback 4** (line 19): Load workspace data after the component mounts. The empty dependency list prevents reruns on ordinary re-renders; development Strict Mode can run effects again.
- **Callback 5** (line 21): Find the transaction matching the selected ID; return undefined when nothing is selected or the record is absent.
- **Callback 6** (line 22): Calculate dashboard counts from the transaction list. useMemo reuses the result until the rows reference changes.
- **Callback 7** (line 22): Keep transactions that are ready for accountant review.
- **Callback 8** (line 22): Keep transactions that need customer information.
- **Callback 9** (line 22): Keep transactions that require an accountant decision.
- **Callback 10** (line 22): Keep transactions that have already been approved.
- **open** (line 26): Open a transaction detail view and prefill its answer and category fields. Clear any previous screen error; no network request or database update occurs.
- **act** (line 30): Send a bookkeeping action to POST /api/action with the selected transaction ID and proposal version plus optional answer or category. Replace the UI Store on success; reset also returns to overview. Show errors and always clear the busy state. Database functions enforce the actual action rules.
- **Table** (line 34): Render the supplied transactions as a table with source, category, status and SGD amount. Rows and merchant buttons open details; an empty list shows a caught-up message.
- **Callback 14** (line 34): Render one transaction as a table row, including its click handlers and status styling.
- **Callback 15** (line 34): Open this row's transaction when the row is clicked.
- **Callback 16** (line 34): Open this transaction from its keyboard-accessible button. Stop event bubbling so the row handler does not open it a second time.
- **Callback 17** (line 35): Switch to overview and close the current detail view.
- **Callback 18** (line 35): Switch to all transactions and close the current detail view.
- **Callback 19** (line 35): Switch to the review queue and close the current detail view.
- **Callback 20** (line 51): Change the customer/accountant UI preview and close the current detail view. This changes local React state only, not the authenticated account role.
- **Callback 21** (line 62): Ask for confirmation before requesting the database demo reset through act. Cancel leaves the demo unchanged.
- **Callback 22** (line 77): Dismiss the visible dashboard error message.
- **Callback 23** (line 78): Close transaction details and return to the current tab.
- **Callback 24** (line 78): Keep the clarification draft in React state as the customer types; saving happens only on submit.
- **Callback 25** (line 78): Submit the clarification draft through the shared action request function.
- **Callback 26** (line 79): Request approval for the ready proposal through the shared action request function.
- **Callback 27** (line 80): Request approval for the proposal requiring accountant review through the shared action request function.
- **Callback 28** (line 82): Keep the proposed category selection in React state; this does not save it yet.
- **Callback 29** (line 82): Render one available classification as a dropdown option.
- **Callback 30** (line 82): Save the selected classification through the shared action request function.
- **Callback 31** (line 82): Render one audit event with its action, actor and timestamp; the surrounding list is newest first.
- **Callback 32** (line 83): Open the review queue from the overview screen.
- **Callback 33** (line 83): Choose outstanding questions for the customer preview, or ready/accountant items for the accountant preview.
- **Callback 34** (line 85): Choose the current preview's review queue items using the same status rules as the overview.

## [components/LogoutButton.tsx](../components/LogoutButton.tsx)

- **LogoutButton** (line 11): Render a sign-out button with busy feedback and an inline error message. The actual session change is handled by handleLogout.
- **handleLogout** (line 19): Sign out using the browser Supabase client. On success replace the current URL with /login and refresh server data; on failure display the error. Always clear the busy state.

## [lib/seed.ts](../lib/seed.ts)

- **initialState** (line 19): Create a fresh set of 12 sample transactions and their simulated import audit events. Returns a Store; this helper does not write to Supabase or to disk.
- **Callback 2** (line 19): Convert one sample-data tuple into a typed Transaction, using its position to choose the demo date.

## [lib/store.ts](../lib/store.ts)

- **readStore** (line 9): Read the legacy local JSON store. If the file does not exist, return fresh sample data; other file or JSON errors propagate to the caller. Current API routes use readSupabaseStore instead.
- **writeStore** (line 13): Write a Store to the legacy data/state.json file, creating its directory if needed. This overwrites the local file; it does not update Supabase and is not used by current API routes.

## [lib/supabase-server.ts](../lib/supabase-server.ts)

- **createSupabaseServerClient** (line 8): Create a Supabase client for the current server request using its session cookies. API routes use this client so Supabase can identify the caller and apply database access policies. Requires the public URL and publishable key environment variables.
- **getAll** (line 19): Return all request cookies so the Supabase client can read the current authentication session.
- **setAll** (line 25): Apply session cookie updates requested by Supabase. Cookie writes are attempted together; errors are ignored because some Server Component contexts cannot write response cookies.
- **Callback 4** (line 27): Write one Supabase session cookie, including its expiry and other options, to the current cookie store.

## [lib/supabase-store.ts](../lib/supabase-store.ts)

- **readSupabaseStore** (line 24): Load the signed-in user's first company membership, then fetch its transactions, classifications and audit logs. Convert database field names and statuses into the UI Store shape. Throws for authentication, membership, query or unsupported classification errors; updatedAt is the response creation time.
- **Callback 2** (line 81): Convert one database transaction and its related classification into the UI Transaction shape. Require a classification with a recognised status rather than displaying incomplete data.
- **Callback 3** (line 113): Convert one audit row into a timestamp, display actor and action. Prefer the stored actor label, falling back to Authenticated user or System.
- **Callback 4** (line 126): Compare ISO timestamp strings to sort audit events from oldest to newest. The detail screen reverses this order for display.

## [middleware.ts](../middleware.ts)

- **middleware** (line 9): Verify the Supabase user before pages or APIs run. Refresh session cookies on both the forwarded request and final response; never use the demo UI role as authorization. Next.js 15 discovers this middleware.ts file automatically.
- **getAll** (line 17): Read this request's session cookies, including any refreshed values.
- **setAll** (line 21): Keep refreshed cookies available to downstream server code and the browser.

