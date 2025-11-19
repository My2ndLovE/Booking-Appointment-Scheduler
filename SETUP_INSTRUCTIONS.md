# BookEase - Setup & Development Instructions

## Current Status

✅ **COMPLETED:**
- Project configuration (package.json, configs)
- Database schema with RLS policies
- TypeScript types for all entities
- Supabase client setup
- Core utilities (date, timezone, availability)
- Stores (auth, bookings, organization, toast)
- Validation schemas

⏳ **REMAINING:**
- SvelteKit routes and pages
- Svelte components
- Supabase Edge Functions
- Azure deployment configuration

---

## Setup Guide

### 1. Install Dependencies

```bash
cd /home/user/Booking-Appointment-Scheduler
npm install
```

### 2. Setup Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project
3. Run the migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize Supabase (if needed)
supabase init

# Link to your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Seed demo data
supabase db execute -f supabase/seed.sql
```

### 3. Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your Supabase credentials:

```env
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
PUBLIC_SITE_URL=http://localhost:5173
PUBLIC_SITE_NAME=BookEase
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key
PUBLIC_ENABLE_REALTIME=true
PUBLIC_ENABLE_EMAIL_NOTIFICATIONS=true
PUBLIC_ENABLE_PAYMENTS=true
```

### 4. Missing Dependencies

Add these to package.json dependencies:

```json
{
  "clsx": "^2.1.0",
  "tailwind-merge": "^2.2.0"
}
```

Then run:
```bash
npm install clsx tailwind-merge
```

---

## Routes Structure (TO BE CREATED)

```
src/routes/
├── +layout.svelte                      # Root layout
├── +layout.ts                          # Root data loader
├── +page.svelte                        # Landing page
│
├── (auth)/                             # Auth group
│   ├── +layout.svelte
│   ├── login/+page.svelte
│   ├── signup/+page.svelte
│   └── reset-password/+page.svelte
│
├── (dashboard)/                        # Dashboard group (protected)
│   ├── +layout.svelte                  # Dashboard layout with sidebar
│   ├── +layout.ts                      # Auth guard
│   ├── dashboard/
│   │   ├── +page.svelte                # Analytics dashboard
│   │   └── +page.ts
│   ├── bookings/
│   │   ├── +page.svelte
│   │   ├── +page.ts
│   │   └── [id]/+page.svelte
│   ├── calendar/
│   │   ├── +page.svelte
│   │   └── +page.ts
│   ├── services/
│   │   ├── +page.svelte
│   │   └── new/+page.svelte
│   ├── staff/
│   │   ├── +page.svelte
│   │   └── new/+page.svelte
│   └── settings/
│       └── +page.svelte
│
└── book/[slug]/                        # Public booking
    ├── +page.svelte
    ├── +page.ts
    └── success/+page.svelte
```

---

## Components Structure (TO BE CREATED)

```
src/lib/components/
├── ui/                                 # Base UI components
│   ├── Button.svelte
│   ├── Card.svelte
│   ├── Modal.svelte
│   ├── Input.svelte
│   └── Toast.svelte
│
├── booking/                            # Booking-specific
│   ├── ServiceSelector.svelte
│   ├── StaffSelector.svelte
│   ├── TimeSlotPicker.svelte
│   └── BookingForm.svelte
│
├── calendar/                           # Calendar components
│   ├── Calendar.svelte
│   └── EventModal.svelte
│
├── dashboard/                          # Dashboard components
│   ├── StatsCard.svelte
│   ├── BookingsChart.svelte
│   └── RevenueChart.svelte
│
└── layout/                             # Layout components
    ├── Navbar.svelte
    ├── Sidebar.svelte
    └── Footer.svelte
```

---

## Development Commands

```bash
# Start dev server
npm run dev

# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

---

## Supabase Edge Functions (TO BE CREATED)

Create these Edge Functions in `supabase/functions/`:

1. **send-booking-confirmation/**
   - index.ts
   - Uses Resend API for emails

2. **process-payment/**
   - index.ts
   - Stripe payment integration

3. **send-booking-reminders/**
   - index.ts
   - Cron job for daily reminders

Deploy with:
```bash
supabase functions deploy send-booking-confirmation
supabase functions deploy process-payment
supabase functions deploy send-booking-reminders
```

---

## Azure Deployment

1. Create Azure Static Web App
2. Connect to GitHub repository
3. Configure build settings:
   - App location: `/`
   - Output location: `build`
   - Build command: `npm run build`

4. Add environment variables in Azure Portal

---

## Testing Strategy

1. **Unit Tests** - Test utilities (availability, date, timezone)
2. **Integration Tests** - Test Supabase queries
3. **E2E Tests** - Test complete booking flow

---

## Performance Targets

- Lighthouse Score: 95+
- Initial Bundle: < 100KB
- Page Load: < 1s
- Time to Interactive: < 2s

---

## Security Checklist

- ✅ RLS policies enabled
- ✅ Input validation with Zod
- ✅ JWT authentication
- ✅ HTTPS only in production
- ✅ Environment variables protected

---

## Next Implementation Steps

### Priority 1: Core Routes (Week 1-2)
1. Create root layout with auth handling
2. Build landing page
3. Create auth pages (login/signup)
4. Implement public booking flow
5. Create booking confirmation page

### Priority 2: Dashboard (Week 3)
1. Dashboard layout with sidebar
2. Analytics dashboard
3. Bookings management
4. Services CRUD
5. Staff CRUD

### Priority 3: Advanced Features (Week 4)
1. Real-time calendar updates
2. Payment integration (Stripe)
3. Email notifications (Resend)
4. Timezone handling

### Priority 4: Polish (Week 5)
1. Svelte transitions/animations
2. Error handling
3. Loading states
4. Mobile responsiveness
5. Performance optimization

### Priority 5: Deploy (Week 6)
1. Azure Static Web Apps setup
2. Production Supabase
3. Environment configuration
4. Testing
5. Documentation

---

## Quick Reference

### Supabase URLs
- Dashboard: https://app.supabase.com/project/your-project
- API URL: https://your-project.supabase.co
- Studio: http://localhost:54323 (local)

### Important Files
- Database schema: `supabase/migrations/001_create_tables.sql`
- RLS policies: `supabase/migrations/002_create_rls_policies.sql`
- Seed data: `supabase/seed.sql`
- Types: `src/lib/types/database.ts`

### Helpful Commands
```bash
# Reset local database
supabase db reset

# Generate types from database
supabase gen types typescript --local > src/lib/types/supabase.ts

# View logs
supabase functions logs send-booking-confirmation

# Test Edge Function locally
supabase functions serve
```

---

## Troubleshooting

### Issue: Module not found
**Solution:** Run `npm install`

### Issue: Supabase connection error
**Solution:** Check `.env` file has correct credentials

### Issue: RLS policy denying access
**Solution:** Check if user has correct role and organization_id

### Issue: TypeScript errors
**Solution:** Run `npm run check` and fix type issues

---

## Resources

- [SvelteKit Docs](https://kit.svelte.dev/)
- [Skeleton UI Docs](https://skeleton.dev/)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

---

**Ready to continue development!** 🚀

Start with creating the root layout and landing page, then work through the routes systematically.
