# Production Deployment Checklist

## Pre-Deployment Verification

### Build & Test
- [x] Project builds successfully (`npm run build`)
- [x] No TypeScript errors (`npm run check`)
- [x] All dependencies installed correctly
- [x] Build output size optimized (499KB total)
- [ ] Unit tests passing (`npm run test`)
- [ ] Linting passes (`npm run lint`)

### Code Quality
- [x] TypeScript strict mode enabled
- [x] All environment variables properly typed
- [x] Server/client load functions correctly separated
- [x] No console.errors in production code
- [x] Input validation with Zod schemas
- [x] SQL injection prevention (parameterized queries)

## Supabase Configuration

### Database Setup
- [ ] Create Supabase project
- [ ] Note project URL and keys
- [ ] Run database migrations:
  ```bash
  supabase db push
  # Or manually run:
  # - supabase/migrations/001_create_tables.sql
  # - supabase/migrations/002_create_rls_policies.sql
  ```
- [ ] Verify all 6 tables created
- [ ] Verify all 26 RLS policies active
- [ ] Run seed data: `psql -h db.your-project.supabase.co -U postgres < supabase/seed.sql`

### Real-time Configuration
- [ ] Enable real-time for `bookings` table
- [ ] Test real-time subscriptions work
- [ ] Configure real-time RLS policies

### Edge Functions Deployment
```bash
# Deploy all three Edge Functions
supabase functions deploy send-booking-confirmation --no-verify-jwt
supabase functions deploy process-payment --no-verify-jwt
supabase functions deploy send-booking-reminders --no-verify-jwt
```

- [ ] send-booking-confirmation deployed
- [ ] process-payment deployed
- [ ] send-booking-reminders deployed

### Edge Functions Secrets
```bash
# Set environment secrets
supabase secrets set RESEND_API_KEY=re_your_actual_key_here
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_actual_key_here
```

- [ ] RESEND_API_KEY configured
- [ ] STRIPE_SECRET_KEY configured
- [ ] Test Edge Functions with curl/Postman

### Supabase Auth Configuration
- [ ] Enable email provider
- [ ] Configure email templates (optional)
- [ ] Set site URL for redirects
- [ ] Configure JWT expiry (default: 1 hour)
- [ ] Enable email confirmations (recommended)

## External Services

### Resend (Email)
- [ ] Create Resend account (free tier: 3K emails/month)
- [ ] Verify domain (optional, for production)
- [ ] Get API key
- [ ] Test email sending
- [ ] Configure "from" address
- [ ] Verify email delivery to spam folder

### Stripe (Payments)
- [ ] Create Stripe account
- [ ] Get test API keys (for staging)
- [ ] Get live API keys (for production)
- [ ] Configure webhooks (optional, for payment confirmations)
- [ ] Test payment flow in test mode
- [ ] Set up product/price IDs (if using Stripe Products)

## Azure Static Web Apps

### Azure Setup
- [ ] Create Azure account
- [ ] Create new Static Web App resource
- [ ] Select region (closest to target users)
- [ ] Connect to GitHub repository
- [ ] Select branch: `main` (or current branch for testing)
- [ ] Build configuration:
  - App location: `/`
  - API location: `` (leave empty)
  - Output location: `build`

### Environment Variables
Configure in Azure Portal > Static Web App > Configuration:

- [ ] `PUBLIC_SUPABASE_URL` = `https://your-project.supabase.co`
- [ ] `PUBLIC_SUPABASE_ANON_KEY` = `your-anon-key`

**Note:** These must be prefixed with `PUBLIC_` to be available client-side.

### Custom Domain (Optional)
- [ ] Add custom domain in Azure Portal
- [ ] Configure DNS records
- [ ] Verify domain ownership
- [ ] Enable HTTPS (automatic with Azure)
- [ ] Test custom domain access

## Security Checklist

### Authentication & Authorization
- [x] JWT authentication implemented
- [x] Row-Level Security (RLS) policies active
- [x] Session management configured
- [ ] Password requirements enforced
- [ ] Rate limiting on auth endpoints (Supabase default)
- [ ] CSRF protection (SvelteKit default)

### Data Protection
- [x] All database queries parameterized
- [x] Input validation with Zod
- [x] XSS prevention (auto-escaped in Svelte)
- [ ] Sensitive data encrypted at rest (Supabase default)
- [ ] HTTPS enforced (Azure default)
- [ ] CSP headers configured (`staticwebapp.config.json`)

### API Keys & Secrets
- [ ] No secrets in code or Git
- [ ] Environment variables properly configured
- [ ] Supabase service role key NOT in client code
- [ ] Edge Function secrets set via Supabase CLI
- [ ] .env file in .gitignore

### Monitoring
- [ ] Enable Supabase logging
- [ ] Monitor Edge Function errors
- [ ] Set up Azure Application Insights (optional)
- [ ] Configure error tracking (Sentry, etc.) (optional)
- [ ] Monitor database performance

## Performance Optimization

### Build Optimization
- [x] Production build created
- [x] Code splitting enabled (SvelteKit default)
- [x] Tree shaking active
- [x] Minification enabled
- [x] CSS purged (Tailwind)
- [ ] Check bundle sizes: `npm run build` (current: 499KB)

### Runtime Performance
- [ ] Test Lighthouse score (target: 95+)
- [ ] Optimize images (WebP format recommended)
- [ ] Enable CDN caching (Azure default)
- [ ] Configure cache headers
- [ ] Test on slow 3G network
- [ ] Test on mobile devices

### Database Performance
- [x] Indexes created for foreign keys
- [x] Indexes on frequently queried columns
- [ ] Monitor slow queries
- [ ] Optimize N+1 queries (use select with joins)
- [ ] Consider read replicas for high traffic (paid plans)

## Testing Checklist

### Functionality Testing
- [ ] **Authentication Flow**
  - [ ] Sign up with email
  - [ ] Login with correct credentials
  - [ ] Login with incorrect credentials
  - [ ] Password reset flow
  - [ ] Logout

- [ ] **Public Booking Flow**
  - [ ] Access booking page via slug
  - [ ] Select service
  - [ ] Select staff member
  - [ ] Pick date and time
  - [ ] Fill booking form
  - [ ] Submit booking
  - [ ] Receive confirmation email
  - [ ] View success page

- [ ] **Dashboard - Analytics**
  - [ ] View today's bookings count
  - [ ] View week bookings count
  - [ ] View month bookings count
  - [ ] View monthly revenue
  - [ ] See recent bookings table

- [ ] **Dashboard - Bookings**
  - [ ] View all bookings
  - [ ] Filter by status
  - [ ] Update booking status
  - [ ] See real-time updates
  - [ ] View booking details

- [ ] **Dashboard - Services**
  - [ ] View all services
  - [ ] Create new service
  - [ ] Edit service (placeholder)
  - [ ] Delete service (placeholder)

- [ ] **Dashboard - Calendar**
  - [ ] View week calendar
  - [ ] Navigate weeks
  - [ ] See booking blocks
  - [ ] Click booking for details

- [ ] **Dashboard - Staff**
  - [ ] View staff list
  - [ ] Add staff member (placeholder)
  - [ ] Edit staff hours (placeholder)

- [ ] **Dashboard - Settings**
  - [ ] View organization details
  - [ ] Copy booking link
  - [ ] Update settings (placeholder)

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### Responsiveness Testing
- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Mobile landscape

## Deployment Steps

### 1. Final Code Review
- [ ] Review all changed files
- [ ] Remove debug console.log statements
- [ ] Verify no TODO comments in critical paths
- [ ] Check for hardcoded URLs

### 2. Environment Configuration
- [ ] Update .env.example with all required variables
- [ ] Document any special configuration
- [ ] Verify environment variables in Azure

### 3. Deploy to Staging (Optional)
- [ ] Create staging Supabase project
- [ ] Deploy to staging Azure Static Web App
- [ ] Run full test suite on staging
- [ ] Load test with realistic traffic

### 4. Deploy to Production
- [ ] Merge to `main` branch (triggers auto-deploy)
- [ ] Monitor deployment logs
- [ ] Verify successful deployment
- [ ] Smoke test critical paths
- [ ] Monitor error rates

### 5. Post-Deployment
- [ ] Send test booking
- [ ] Verify email delivery
- [ ] Check database writes
- [ ] Monitor performance metrics
- [ ] Review Azure logs

## Rollback Plan

### If Deployment Fails
1. Check deployment logs in Azure Portal
2. Verify environment variables are set
3. Check build configuration
4. Redeploy previous working commit
5. Contact support if issue persists

### If Critical Bug Found
1. Identify affected users
2. Disable affected feature if possible
3. Roll back to previous deployment
4. Fix bug in development
5. Deploy hotfix to production

## Monitoring & Maintenance

### Daily
- [ ] Check error logs
- [ ] Monitor email delivery rate
- [ ] Review booking success rate

### Weekly
- [ ] Review performance metrics
- [ ] Check database size
- [ ] Monitor Edge Function usage
- [ ] Review user feedback

### Monthly
- [ ] Review costs (all services)
- [ ] Update dependencies
- [ ] Security audit
- [ ] Backup database (Supabase auto-backup)

## Cost Management

### Free Tier Limits
- **Supabase:** 500MB database, 2GB bandwidth, 500K Edge Function requests
- **Azure Static Web Apps:** 100GB bandwidth
- **Resend:** 3,000 emails/month
- **Stripe:** Unlimited in test mode

### Monitoring Usage
- [ ] Set up billing alerts in Azure
- [ ] Monitor Supabase usage dashboard
- [ ] Track Resend email quota
- [ ] Review monthly costs

### When to Upgrade
- Database exceeds 500MB → Supabase Pro ($25/mo)
- Bandwidth exceeds limits → Azure Standard tier
- Emails exceed 3K/month → Resend Growth ($20/mo)
- Need production payments → Activate Stripe live mode (2.9% + $0.30 per transaction)

## Documentation

- [x] README.md updated
- [x] DEPLOYMENT_GUIDE.md created
- [x] SETUP_INSTRUCTIONS.md created
- [x] PRD documentation complete
- [ ] API documentation (if needed)
- [ ] User guide (optional)
- [ ] Admin guide (optional)

## Success Criteria

- [ ] Application accessible at production URL
- [ ] All features working as expected
- [ ] No console errors
- [ ] Lighthouse score 95+ (all metrics)
- [ ] Email delivery working
- [ ] Bookings creating successfully
- [ ] RLS preventing unauthorized access
- [ ] Real-time updates functioning
- [ ] Mobile experience smooth
- [ ] Load time < 2 seconds

---

## Notes

**Last Updated:** 2025-11-19
**Build Status:** ✅ Passing (499KB)
**TypeScript:** ✅ No errors
**Dependencies:** ✅ All installed

**Quick Deploy:**
```bash
# 1. Build
npm run build

# 2. Deploy Edge Functions
supabase functions deploy send-booking-confirmation --no-verify-jwt
supabase functions deploy process-payment --no-verify-jwt
supabase functions deploy send-booking-reminders --no-verify-jwt

# 3. Set Secrets
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set STRIPE_SECRET_KEY=sk_test_xxx

# 4. Push to main (auto-deploys to Azure)
git push origin main
```

**Support:**
- Supabase Docs: https://supabase.com/docs
- Azure Static Web Apps Docs: https://learn.microsoft.com/azure/static-web-apps/
- Resend Docs: https://resend.com/docs
- Stripe Docs: https://stripe.com/docs
