# Login setup

The homepage is public. Login is required only when opening the Library, reading a book, or opening AI chat.

## Environment variable

Use this exact Vercel environment variable name:

```text
SITE_USERS_JSON
```

Set its value to one-line JSON containing bcrypt password hashes:

```json
[{"id":"user1","passwordHash":"$2b$10$HRQq9gNUFI3rsJAgmwhpZuBOev1c2MKAMqcMCfqraikpIAc80zayS"},{"id":"admin","passwordHash":"$2b$10$E.qgdgAv.YqgZ1M0dF2vfe4lju/SKuJbq.cf.1ndWH8Xkl7y9aH0m"}]
```

`id` is the username. The password is the original plaintext password that was used to create that bcrypt hash; it cannot be recovered from the hash. Add the variable in Vercel Project Settings → Environment Variables for the correct environment, then redeploy. Do not put quotes around the whole value unless your dashboard requires them, and do not add line breaks.

## Troubleshooting

- Confirm the variable is named exactly `SITE_USERS_JSON` (not `SITE_USER_JSON`, `SITE_USERS`, or `USERS_JSON`). The login screen now checks `/api/auth/config` and clearly reports when zero valid users are loaded.
- Confirm the value is valid JSON and contains bcrypt hashes beginning with `$2b$`, `$2a$`, or `$2y$`.
- After changing the variable, redeploy; environment variables are not applied to an already-running deployment.
- The server intentionally returns a generic credential error and never exposes hashes.
- Existing single-user deployments may use `SITE_USERNAME` and `SITE_PASSWORD` as a compatibility fallback.
- Use logout or clear the site cookie after changing credentials, then sign in again.

The session cookie is HTTP-only and same-origin. The app does not store passwords in browser storage.
