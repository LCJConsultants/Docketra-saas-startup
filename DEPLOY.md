# Docketra - Vercel Deployment Guide

## Step 1: Connect Repo to Vercel

1. Go to https://vercel.com/new
2. Import the GitHub repo: `LCJConsultants/Docketra-saas-startup`
3. Framework Preset: **Next.js** (auto-detected)
4. Root Directory: `.` (default)
5. **DO NOT deploy yet** — set environment variables first

---

## Step 2: Set Environment Variables in Vercel

Go to Project Settings > Environment Variables and add ALL of these:

### Required (build will fail without these)

| Variable | Value | Environments |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://zgzjbprprbhzohmcgkfq.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | *(from .env.local)* | Production, Preview, Development |
| `NEXT_PUBLIC_APP_URL` | `https://yourdomain.com` | Production |
| `NEXT_PUBLIC_APP_URL` | `https://docketra-saas-startup.vercel.app` | Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | *(from .env.local)* | Production, Preview |
| `OPENAI_API_KEY` | *(from .env.local)* | Production, Preview |
| `RESEND_API_KEY` | *(from .env.local)* | Production, Preview |
| `CRON_SECRET` | *(from .env.local)* | Production, Preview |

### Integrations (set now, needed at runtime)

| Variable | Value | Environments |
|----------|-------|-------------|
| `GOOGLE_CLIENT_ID` | *(from .env.local)* | Production, Preview |
| `GOOGLE_CLIENT_SECRET` | *(from .env.local)* | Production, Preview |
| `DROPBOX_APP_KEY` | *(from .env.local)* | Production, Preview |
| `DROPBOX_APP_SECRET` | *(from .env.local)* | Production, Preview |

### Optional (can add later)

| Variable | Value | Notes |
|----------|-------|-------|
| `STRIPE_SECRET_KEY` | | Add when ready to charge |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | | Add when ready to charge |
| `STRIPE_WEBHOOK_SECRET` | | Add when Stripe webhook is configured |
| `MICROSOFT_CLIENT_ID` | | Add when Outlook integration is ready |
| `MICROSOFT_CLIENT_SECRET` | | Add when Outlook integration is ready |
| `NEXT_PUBLIC_SENTRY_DSN` | | Add when Sentry project is created |
| `SENTRY_ORG` | | Add when Sentry project is created |
| `SENTRY_PROJECT` | | Add when Sentry project is created |

---

## Step 3: Deploy

Click **Deploy** in Vercel. The build should succeed.

---

## Step 4: Connect Custom Domain

1. Go to Project Settings > Domains
2. Add your domain (e.g. `app.docketra.com` or `docketra.com`)
3. Vercel will show DNS records to add at your domain registrar
4. Add the records at your registrar (Namecheap, GoDaddy, etc.)
5. Wait for DNS propagation (usually 5-30 minutes)
6. Vercel auto-provisions SSL certificate

---

## Step 5: Update External Services with Production Domain

### Supabase Auth Redirect URLs
1. Go to Supabase Dashboard > Authentication > URL Configuration
2. Set **Site URL** to: `https://yourdomain.com`
3. Add to **Redirect URLs**:
   - `https://yourdomain.com/callback`
   - `https://yourdomain.com/callback?next=/reset-password`
   - `https://yourdomain.com/api/integrations/google/callback`

### Google OAuth Console
1. Go to https://console.cloud.google.com/apis/credentials
2. Edit the OAuth 2.0 Client ID
3. Add **Authorized redirect URI**:
   - `https://yourdomain.com/api/integrations/google/callback`
4. Add **Authorized JavaScript origin**:
   - `https://yourdomain.com`

### Resend (Email)
1. Go to https://resend.com/domains
2. Add and verify your domain for sending emails
3. Update DNS records (SPF, DKIM) at your registrar

---

## Step 6: Verify

- [ ] Landing page loads at your domain
- [ ] Sign up flow works (email sent, verification works)
- [ ] Login works
- [ ] Onboarding flow completes
- [ ] Dashboard loads with data
- [ ] Create a test client
- [ ] Create a test case
- [ ] Upload a document
- [ ] AI chat responds
- [ ] Calendar events can be created
- [ ] Time entries can be logged
- [ ] Templates can be uploaded
- [ ] Settings pages load
- [ ] Google integration OAuth flow works
- [ ] Password reset flow works
