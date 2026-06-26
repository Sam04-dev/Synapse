# SECURITY.md - Security & Privacy Rules

## 1. API Key & Secrets Management
- AWS credentials (Access Key, Secret Key) MUST only exist in `.env.local` and Vercel Environment Variables.
- NEVER hardcode AWS credentials in source files.
- API keys generated for Synapse agents must be hashed using `bcrypt` before storing in DSQL.

## 2. Network Security
- All database connections MUST use HTTPS/TLS via the AWS SDK.
- Enforce strict CORS policies on API routes to only allow the deployed Vercel domain.

## 3. Local Data Storage & Privacy
- Do not store user data in browser cookies except for the Next.js Auth session token.
- Use `HttpOnly` and `Secure` flags for all authentication cookies.

## 4. Required Privacy Permissions
- No special mobile permissions required (web app).
- Must display a clear privacy policy in the footer regarding how developer API keys and agent data are stored.
