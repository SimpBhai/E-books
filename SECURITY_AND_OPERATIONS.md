# SutraLibrary operations

## Environment variables

Set these in deployment settings; never commit them:

- `SITE_USERNAME`: the only website username.
- `SITE_PASSWORD`: the only website password. Use a long random value.
- `SESSION_SECRET`: random value used to sign session tokens; change it to invalidate existing sessions.
- `GROQ_API_KEY`: server-only Groq Console credential.
- `GROQ_API_KEYS`: comma-separated client keys for Discord, Telegram, or other websites. These are not Groq keys. Rotate by replacing the list and redeploying.
- `GROQ_MODEL`: optional Groq model override. The default is `llama-3.3-70b-versatile`.
- `API_ALLOWED_ORIGIN`: optional exact origin allowed for browser API clients; leave unset for non-browser bot clients.

The website is protected before the app shell loads. Login uses an HTTP-only, SameSite cookie with an eight-hour expiry. Failed logins are throttled. Logout clears the session. HTTPS is required in production.

## External AI API

Endpoint: `POST /api/ai/answer`

```http
Authorization: Bearer client-key
Content-Type: application/json
```

```json
{"question":"What does the text say about discipline?","bookId":"yogasutra"}
```

Keys are checked server-side, never sent to Groq, and rate-limited. Keep separate keys for separate bots or people so a single compromised key can be rotated. The endpoint returns JSON with `answer`; it rejects missing keys, oversized questions, and excessive requests. Do not expose `GROQ_API_KEY` in a client application.

## Adding a GitHub-backed book

1. Add the raw source under `data/<book-id>/`.
2. Add a metadata entry in `data/metadata.ts` with a stable unique `id`.
3. Add a `BookAdapter` in `services/bookRegistry.ts`. The adapter may parse any source schema, but it must return the internal `Chapter[]` shape.
4. Add the adapter to `BOOK_ADAPTERS`.
5. Run the build and test `/api/books`, `/api/books/<id>/chapters`, and `/api/books/<id>/verses` after signing in.

The catalog uses stable IDs and removes repeated entries before rendering the epustakalaya/epustakam library. Distinct editions must use distinct IDs.

## AI and reader behavior

The main Slokas reader displays only published GitHub content and does not generate Bhasya or AI commentary. AI is available from the homepage chat icon and the separate AI page. AI answers are constrained to the loaded library context and should be treated as assisted research, not authoritative translation.

## PWA installation

Open the site over HTTPS, then use the browser's install prompt or menu. The manifest is `/manifest.webmanifest`, the icon is `/pwa-icon.svg`, and `/sw.js` caches only the public application shell. Authenticated API responses are not cached. After changing static assets, bump the service-worker cache name in `public/sw.js`.

## Security checklist

Use HTTPS, keep deployment secrets out of GitHub, rotate `SESSION_SECRET` and client keys, restrict `API_ALLOWED_ORIGIN`, monitor rate-limit responses, keep dependencies updated, and do not promise absolute “hackproof” security. The server applies security headers, JSON body limits, bounded AI prompts, constant-time secret comparison, generic authentication errors, disabled fingerprinting, and server-side Groq access.
