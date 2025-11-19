# BookEase - Deployment Guide

This guide will help you deploy BookEase to production using Azure Static Web Apps and Supabase.

---

## Prerequisites

- GitHub account
- Azure account (free tier available)
- Supabase account (free tier available)
- Resend account for emails (optional, free tier available)
- Stripe account for payments (optional, test mode free)

---

## Step 1: Supabase Setup

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Choose a region close to your users
4. Save your project credentials

### 1.2 Run Database Migrations

```bash
# Install Supabase CLI globally
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Push database schema
supabase db push

# Seed demo data (optional)
psql -h db.your-project.supabase.co -U postgres -d postgres < supabase/seed.sql
```

### 1.3 Deploy Edge Functions

```bash
# Deploy email confirmation function
supabase functions deploy send-booking-confirmation --no-verify-jwt

# Deploy payment processing function
supabase functions deploy process-payment --no-verify-jwt

# Deploy reminder cron function
supabase functions deploy send-booking-reminders --no-verify-jwt
```

### 1.4 Set Edge Function Secrets

```bash
# Set Resend API key (for email)
supabase secrets set RESEND_API_KEY=re_your_key

# Set Stripe secret key (for payments)
supabase secrets set STRIPE_SECRET_KEY=sk_test_your_key
```

### 1.5 Setup Cron Jobs (Optional)

In Supabase Dashboard > Database > Cron Jobs, create a new job:

```sql
SELECT cron.schedule(
  'send-booking-reminders',
  '0 9 * * *',  -- Run daily at 9 AM
  $$
  SELECT net.http_post(
    url:='https://your-project.supabase.co/functions/v1/send-booking-reminders',
    headers:='{"Authorization": "Bearer your-anon-key"}'::jsonb
  );
  $$
);
```

---

## Step 2: Azure Static Web Apps Setup

### 2.1 Create Azure Static Web App

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a new **Static Web App** resource
3. Select your GitHub repository
4. Build Configuration:
   - **App location:** `/`
   - **Output location:** `build`
5. Click **Review + create**

### 2.2 Configure Environment Variables

In Azure Portal > Your Static Web App > Configuration:

Add the following application settings:

```
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_SITE_URL=https://your-app.azurestaticapps.net
PUBLIC_SITE_NAME=BookEase
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
PUBLIC_ENABLE_REALTIME=true
PUBLIC_ENABLE_EMAIL_NOTIFICATIONS=true
PUBLIC_ENABLE_PAYMENTS=true
```

### 2.3 Configure GitHub Secrets

In your GitHub repository > Settings > Secrets and variables > Actions:

Add these secrets:

```
AZURE_STATIC_WEB_APPS_API_TOKEN=your-azure-token
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_SITE_URL=https://your-app.azurestaticapps.net
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
```

---

## Step 3: Optional Services

### 3.1 Resend (Email Service)

1. Sign up at [https://resend.com](https://resend.com)
2. Create an API key
3. Add to Supabase Edge Function secrets:
   ```bash
   supabase secrets set RESEND_API_KEY=re_your_key
   ```

### 3.2 Stripe (Payment Processing)

1. Sign up at [https://stripe.com](https://stripe.com)
2. Use test mode for demo
3. Get your keys from Dashboard > Developers > API keys
4. Add publishable key to Azure environment variables
5. Add secret key to Supabase Edge Function secrets

---

## Step 4: Deploy

### 4.1 Automatic Deployment

Push to your main branch:

```bash
git add .
git commit -m "feat: Deploy to production"
git push origin main
```

GitHub Actions will automatically:
1. Build your SvelteKit app
2. Deploy to Azure Static Web Apps
3. Make your site live!

### 4.2 Manual Deployment (Alternative)

```bash
# Build locally
npm run build

# Deploy using Azure CLI
az staticwebapp upload \
  --name your-app-name \
  --resource-group your-resource-group \
  --src ./build
```

---

## Step 5: Post-Deployment

### 5.1 Verify Deployment

1. Visit your Azure Static Web Apps URL
2. Test user signup and login
3. Try creating a booking
4. Check email delivery (if configured)
5. Verify dashboard access

### 5.2 Setup Custom Domain (Optional)

In Azure Portal > Your Static Web App > Custom domains:

1. Add your domain
2. Create required DNS records
3. Wait for SSL certificate provisioning

### 5.3 Create Demo Organizations

Run the seed SQL or manually create organizations through your app.

---

## Monitoring & Maintenance

### Application Insights (Optional)

Enable in Azure Portal for monitoring:
- Page views
- Performance metrics
- Error tracking
- User analytics

### Supabase Dashboard

Monitor:
- Database usage
- API requests
- Edge Function invocations
- Real-time connections

### Cost Monitoring

**Free Tier Limits:**
- Azure Static Web Apps: 100 GB bandwidth/month
- Supabase: 500 MB database, 2 GB bandwidth
- Edge Functions: 500K invocations/month
- Resend: 3,000 emails/month
- Stripe: Unlimited in test mode

---

## Troubleshooting

### Build Fails

**Check:**
- All environment variables are set
- `package.json` dependencies are correct
- Build command: `npm run build`
- Output location: `build`

**Solution:**
```bash
# Test build locally
npm run build
npm run preview
```

### Database Connection Issues

**Check:**
- Supabase URL is correct
- Anon key is valid
- RLS policies are enabled
- Tables exist

**Solution:**
```bash
# Test connection
curl https://your-project.supabase.co/rest/v1/organizations \
  -H "apikey: your-anon-key"
```

### Email Not Sending

**Check:**
- Resend API key is set in Edge Function secrets
- Edge Function is deployed
- Domain is verified in Resend (if using custom domain)

**Solution:**
```bash
# Check Edge Function logs
supabase functions logs send-booking-confirmation
```

### Real-time Not Working

**Check:**
- WebSocket connections are allowed
- RLS policies permit subscriptions
- Real-time is enabled in Supabase

**Solution:**
Enable real-time in Supabase Dashboard > Database > Replication

---

## Security Checklist

- [ ] Environment variables are not committed to Git
- [ ] RLS policies are enabled on all tables
- [ ] Service role key is only in Edge Functions
- [ ] HTTPS is enforced (automatic with Azure SWA)
- [ ] Input validation is implemented
- [ ] Rate limiting is considered

---

## Performance Optimization

### CDN & Caching

Azure Static Web Apps automatically provides:
- Global CDN distribution
- Asset caching
- Gzip compression

### Database Optimization

- Indexes are created on frequently queried columns
- Connection pooling is enabled
- Query optimization with EXPLAIN ANALYZE

### Bundle Optimization

```bash
# Check bundle size
npm run build
# Bundle should be < 100KB for optimal performance
```

---

## Backup & Recovery

### Database Backups

Supabase automatically backs up your database daily.

To create manual backup:
```bash
pg_dump -h db.your-project.supabase.co -U postgres -d postgres > backup.sql
```

### Restore from Backup

```bash
psql -h db.your-project.supabase.co -U postgres -d postgres < backup.sql
```

---

## Scaling Considerations

### When to Upgrade

Upgrade from free tier when you exceed:
- 500 MB database storage
- 2 GB bandwidth/month
- 500K Edge Function invocations
- 3,000 emails/month

### Supabase Pro ($25/month)

- 8 GB database
- 250 GB bandwidth
- 2M Edge Function invocations
- Email add-on available

### Azure Static Web Apps Standard ($9/month)

- Custom authentication
- SLA guarantees
- Staging environments

---

## Support & Resources

- **Documentation:** `/docs` folder in this repository
- **Supabase Docs:** https://supabase.com/docs
- **Azure Docs:** https://docs.microsoft.com/azure/static-web-apps
- **SvelteKit Docs:** https://kit.svelte.dev

---

## Success Metrics

After deployment, verify:

✅ Lighthouse Score: 95+
✅ Page Load Time: < 1s
✅ Time to Interactive: < 2s
✅ No console errors
✅ All features functional
✅ Mobile responsive
✅ SEO optimized

---

**Congratulations! Your BookEase app is now live!** 🎉

Visit your site at: `https://your-app.azurestaticapps.net`
