import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { NextRequest } = require("next/server");
const source = fs.readFileSync(new URL("../middleware.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
});

/** Load the real middleware with a controlled Auth response; no live accounts or secrets are used. */
function loadMiddleware({ user = null, error = null, refresh = false } = {}) {
  const module = { exports: {} };
  const context = {
    URL,
    exports: module.exports,
    module,
    process: { env: {
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "test-publishable-key",
    } },
    /** Replace only the external Auth client; retain real NextRequest/NextResponse cookie handling. */
    require(name) {
      if (name !== "@supabase/ssr") return require(name);
      return {
        /** Provide the session result and optionally simulate a Supabase token refresh. */
        createServerClient(_url, _key, { cookies }) {
          return { auth: {
            /** Simulate identity verification after a token refresh, including cache headers. */
            async getUser() {
              if (refresh) cookies.setAll([
                { name: "test-session", value: "refreshed", options: { path: "/", httpOnly: true } },
              ], { "Cache-Control": "private, no-store", Expires: "0", Pragma: "no-cache" });
              return { data: { user }, error };
            },
          } };
        },
      };
    },
  };
  vm.runInNewContext(outputText, context, { filename: "middleware.cjs" });
  return module.exports.middleware;
}

/** Exercise the real middleware using a NextRequest and the supplied simulated Auth result. */
async function request(path, session = {}, method = "GET") {
  const input = new NextRequest(`https://booksly.example${path}`, { method });
  const response = await loadMiddleware(session)(input);
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  return { input, response };
}

test("signed-out visitors are redirected before dashboard rendering", async () => {
  const { response } = await request("/");
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://booksly.example/login");
  assert.equal(response.headers.get("x-middleware-next"), null);
});

test("login stays public and other page paths are protected", async () => {
  assert.equal((await request("/login")).response.headers.get("x-middleware-next"), "1");
  assert.equal((await request("/future-protected-page")).response.status, 307);
});

test("every API rejects a signed-out caller with JSON 401, including reset", async () => {
  for (const path of ["state", "state-db", "transactions", "health", "action"]) {
    const { response } = await request(`/api/${path}`, {}, path === "action" ? "POST" : "GET");
    assert.equal(response.status, 401);
    assert.deepEqual(await response.json(), { error: "Unauthorized" });
  }
  const { response } = await request("/api/me");
  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { authenticated: false });
});

test("verified users reach the workspace and APIs without changing their role", async () => {
  for (const role of ["customer", "accountant", "admin"]) {
    for (const path of ["/", "/api/state", "/api/action"]) {
      const { response } = await request(path, { user: { id: "test-user", role } });
      assert.equal(response.headers.get("x-middleware-next"), "1");
      assert.equal(response.headers.get("location"), null);
    }
  }
});

test("verified users leave login for the workspace", async () => {
  const { response } = await request("/login", { user: { id: "test-user" } });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get("location"), "https://booksly.example/");
});

test("an authentication error denies access even if a user object is present", async () => {
  const { response } = await request("/", { user: { id: "untrusted" }, error: { message: "Invalid token" } });
  assert.equal(response.headers.get("location"), "https://booksly.example/login");
});

test("refresh forwards cookies to server routes and preserves response cookie options", async () => {
  const { input, response } = await request("/", { user: { id: "test-user" }, refresh: true });
  assert.equal(input.cookies.get("test-session").value, "refreshed");
  assert.match(response.headers.get("x-middleware-request-cookie"), /test-session=refreshed/);
  assert.equal(response.cookies.get("test-session").value, "refreshed");
  assert.match(response.headers.get("set-cookie"), /HttpOnly/i);
  assert.equal(response.headers.get("expires"), "0");
  assert.equal(response.headers.get("pragma"), "no-cache");
});

test("redirects and 401 responses retain cookie updates too", async () => {
  for (const [path, session] of [
    ["/login", { user: { id: "test-user" }, refresh: true }],
    ["/", { refresh: true }],
    ["/api/state", { refresh: true }],
  ]) {
    const { response } = await request(path, session);
    assert.equal(response.cookies.get("test-session").value, "refreshed");
    assert.equal(response.headers.get("expires"), "0");
  }
});

test("after sign-out, the next protected request is denied", async () => {
  assert.equal((await request("/", { user: { id: "test-user" } })).response.headers.get("x-middleware-next"), "1");
  assert.equal((await request("/")).response.headers.get("location"), "https://booksly.example/login");
});
