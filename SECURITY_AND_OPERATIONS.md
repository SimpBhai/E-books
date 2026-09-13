# SutraLibrary operations

## Environment variables

Set these in deployment settings; never commit them:

No environment variables are required for the public reader. HTTPS is recommended in production.

The website is protected before the app shell loads. Login uses an HTTP-only, SameSite cookie with an eight-hour expiry. Failed logins are throttled. Logout clears the session. HTTPS is required in production.


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
