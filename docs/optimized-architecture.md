# BookEase - Optimized Architecture Specification
**Multi-Tenant Booking & Appointment Scheduler**

**Version:** 2.0 (Optimized for Zero-Cost Demo)
**Date:** 2025-01-19
**Status:** Ready for Implementation

---

## Executive Summary

This document refines the original PRD with optimizations for:
- **Zero-cost deployment** (all free tiers)
- **Simplified architecture** (Supabase-centric)
- **Production-ready demo** (5-6 week timeline)
- **Maximum portfolio impact** (real-time, payments, analytics)

### Key Changes from Original PRD

| Original | Optimized | Reason |
|----------|-----------|---------|
| Azure Functions | Supabase Edge Functions | Single platform, faster, simpler |
| SendGrid (100/day) | Resend (3K/month) | Better limits, modern DX |
| Complex availability | Simplified JSONB | Demo-appropriate complexity |
| Reviews system | **Removed** | Not in must-haves |

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  SvelteKit Frontend                     │
│              (Azure Static Web Apps)                    │
│                                                         │
│  Routes                  Components                     │
│  ├─ / (landing)         ├─ Skeleton UI                 │
│  ├─ /auth               ├─ Calendar (custom)           │
│  ├─ /dashboard          ├─ Booking Flow                │
│  ├─ /book/[slug]        └─ Analytics Charts            │
│  └─ /api/webhooks                                       │
│                                                         │
│  State Management       Utils                          │
│  ├─ Svelte stores       ├─ Availability calc          │
│  ├─ Realtime subs       ├─ Timezone handling          │
│  └─ Form validation     └─ Date utilities             │
└───────────────────┬─────────────────────────────────────┘
                    │
                    │ HTTPS, JWT, WebSocket
                    │
        ┌───────────┴──────────┐
        │                      │
        ▼                      ▼
┌──────────────────┐   ┌────────────────┐
│   Supabase       │   │   Resend       │
│   Platform       │   │   Email API    │
│                  │   │                │
│ PostgreSQL       │   │ Transactional  │
│ ├─ Tables (RLS)  │   │ emails with    │
│ ├─ Functions     │   │ templates      │
│ └─ Indexes       │   │                │
│                  │   │ 3K/month free  │
│ Auth Module      │   └────────────────┘
│ ├─ JWT tokens    │            ▲
│ ├─ Password      │            │
│ └─ Session mgmt  │            │
│                  │   ┌────────┴───────┐
│ Realtime         │   │ Edge Functions │
│ ├─ Bookings sub  │   │ (Deno Runtime) │
│ ├─ Calendar sync │   │                │
│ └─ Presence      │   │ ├─ Email send  │
│                  │   │ ├─ Payment     │
│ Storage          │   │ └─ Cron jobs   │
│ ├─ Logos (1GB)   │   └────────────────┘
│ └─ Avatars       │            │
│                  │            │
│ Edge Functions   │◄───────────┘
│ ├─ /send-email   │
│ ├─ /process-pay  │   ┌────────────────┐
│ └─ /cron-remind  │   │   Stripe API   │
└──────────────────┘   │   (Test Mode)  │
         │             │                │
         │ Webhooks    │ Payment intents│
         └────────────►│ Refunds        │
                       │ Webhooks       │
                       └────────────────┘
```

### Deployment Architecture

```
┌──────────────────────────────────────────────────────┐
│   GitHub Repository                                  │
│   ├─ /src (SvelteKit app)                           │
│   ├─ /supabase (Edge Functions, migrations)         │
│   └─ /.github/workflows (CI/CD)                     │
└────────────────┬─────────────────────────────────────┘
                 │
                 │ Git Push
                 │
        ┌────────┴────────┐
        │                 │
        ▼                 ▼
┌──────────────┐   ┌─────────────────┐
│ GitHub       │   │ Supabase CLI    │
│ Actions      │   │ (Migrations)    │
│              │   │                 │
│ 1. Build SvelteKit                │
│ 2. Run tests │   │ 1. Schema       │
│ 3. Deploy to │   │ 2. RLS          │
│    Azure SWA │   │ 3. Edge Funcs   │
└──────────────┘   └─────────────────┘
        │                 │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │  Production      │
        │  ├─ Azure SWA    │
        │  └─ Supabase     │
        └─────────────────┘
```

---

## Database Schema (Optimized)

### Core Tables

#### 1. `organizations`
```sql
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  logo_url TEXT,
  timezone VARCHAR(50) DEFAULT 'UTC',

  -- Simplified business hours (JSONB)
  business_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "17:00", "enabled": true},
    "tuesday": {"open": "09:00", "close": "17:00", "enabled": true},
    "wednesday": {"open": "09:00", "close": "17:00", "enabled": true},
    "thursday": {"open": "09:00", "close": "17:00", "enabled": true},
    "friday": {"open": "09:00", "close": "17:00", "enabled": true},
    "saturday": {"open": "10:00", "close": "14:00", "enabled": false},
    "sunday": {"enabled": false}
  }'::jsonb,

  -- Organization settings
  settings JSONB DEFAULT '{
    "booking_buffer_minutes": 15,
    "max_advance_booking_days": 30,
    "min_advance_booking_hours": 2,
    "cancellation_hours": 24,
    "timezone": "UTC"
  }'::jsonb,

  stripe_account_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_org_slug ON organizations(slug);
CREATE INDEX idx_org_active ON organizations(is_active);
```

#### 2. `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,

  -- Simplified roles
  role VARCHAR(20) NOT NULL DEFAULT 'customer',
  -- Roles: 'owner', 'staff', 'customer'

  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,

  -- User preferences
  preferences JSONB DEFAULT '{
    "timezone": "UTC",
    "email_notifications": true,
    "sms_notifications": false
  }'::jsonb,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_org ON users(organization_id);
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_user_role ON users(role);
```

#### 3. `services`
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',

  -- Visual customization
  color VARCHAR(7) DEFAULT '#3B82F6',
  icon VARCHAR(50),

  -- Booking rules
  buffer_time_minutes INTEGER DEFAULT 0,
  max_advance_booking_days INTEGER,

  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_service_org ON services(organization_id);
CREATE INDEX idx_service_active ON services(organization_id, is_active);
```

#### 4. `staff_members`
```sql
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

  title VARCHAR(100),
  bio TEXT,

  -- Working hours with exceptions in single JSONB
  working_hours JSONB DEFAULT '{
    "monday": [{"start": "09:00", "end": "17:00"}],
    "tuesday": [{"start": "09:00", "end": "17:00"}],
    "wednesday": [{"start": "09:00", "end": "17:00"}],
    "thursday": [{"start": "09:00", "end": "17:00"}],
    "friday": [{"start": "09:00", "end": "17:00"}],
    "saturday": [],
    "sunday": [],
    "exceptions": {
      "2025-01-20": {"available": false, "reason": "Vacation"},
      "2025-01-25": {"available": true, "hours": [{"start": "10:00", "end": "14:00"}]}
    }
  }'::jsonb,

  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_staff_org ON staff_members(organization_id);
CREATE INDEX idx_staff_user ON staff_members(user_id);
CREATE INDEX idx_staff_active ON staff_members(organization_id, is_active);
```

#### 5. `staff_services` (Many-to-Many)
```sql
CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(staff_id, service_id)
);

CREATE INDEX idx_staff_services_staff ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service ON staff_services(service_id);
```

#### 6. `bookings`
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  staff_id UUID NOT NULL REFERENCES staff_members(id),
  customer_id UUID NOT NULL REFERENCES users(id),

  -- Booking time
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL,

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- 'pending', 'confirmed', 'cancelled', 'completed', 'no_show'

  -- Payment
  price DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'unpaid',
  -- 'unpaid', 'paid', 'refunded'
  payment_intent_id VARCHAR(255),

  -- Customer info (denormalized for easier access)
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),

  -- Additional info
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_booking_org ON bookings(organization_id);
CREATE INDEX idx_booking_staff_date ON bookings(staff_id, booking_date);
CREATE INDEX idx_booking_customer ON bookings(customer_id);
CREATE INDEX idx_booking_status ON bookings(status);
CREATE INDEX idx_booking_date ON bookings(booking_date);

-- Prevent double booking
CREATE UNIQUE INDEX idx_booking_no_overlap
ON bookings(staff_id, booking_date, start_time)
WHERE status IN ('pending', 'confirmed');
```

### Database Functions

#### Availability Check Function
```sql
CREATE OR REPLACE FUNCTION check_staff_availability(
  p_staff_id UUID,
  p_date DATE,
  p_start_time TIME,
  p_end_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
  v_conflict_count INTEGER;
BEGIN
  -- Check for overlapping bookings
  SELECT COUNT(*)
  INTO v_conflict_count
  FROM bookings
  WHERE staff_id = p_staff_id
    AND booking_date = p_date
    AND status IN ('pending', 'confirmed')
    AND (
      (start_time, end_time) OVERLAPS (p_start_time, p_end_time)
    );

  RETURN v_conflict_count = 0;
END;
$$ LANGUAGE plpgsql;
```

### Triggers

#### Update `updated_at` timestamp
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_members_updated_at
  BEFORE UPDATE ON staff_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

---

## Row-Level Security (RLS) Policies

### Enable RLS on All Tables
```sql
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
```

### Organizations Policies
```sql
-- Anyone can view active organizations (for public booking page)
CREATE POLICY "Public organizations are viewable"
  ON organizations FOR SELECT
  USING (is_active = true);

-- Owners can manage their organization
CREATE POLICY "Owners can manage own organization"
  ON organizations FOR ALL
  USING (
    id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );
```

### Services Policies
```sql
-- Public can view active services for booking
CREATE POLICY "Public services are viewable"
  ON services FOR SELECT
  USING (
    is_active = true
    AND organization_id IN (
      SELECT id FROM organizations WHERE is_active = true
    )
  );

-- Owners can manage services
CREATE POLICY "Owners can manage org services"
  ON services FOR ALL
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid() AND role = 'owner'
    )
  );
```

### Bookings Policies
```sql
-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (customer_id = auth.uid());

-- Staff can view org bookings
CREATE POLICY "Staff can view org bookings"
  ON bookings FOR SELECT
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'staff')
    )
  );

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (customer_id = auth.uid());

-- Staff can update org bookings
CREATE POLICY "Staff can update org bookings"
  ON bookings FOR UPDATE
  USING (
    organization_id IN (
      SELECT organization_id FROM users
      WHERE id = auth.uid()
      AND role IN ('owner', 'staff')
    )
  );
```

---

## Supabase Edge Functions

### 1. Send Booking Confirmation Email

**File:** `supabase/functions/send-booking-confirmation/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface BookingConfirmationPayload {
  bookingId: string
}

serve(async (req) => {
  try {
    const { bookingId }: BookingConfirmationPayload = await req.json()

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Fetch booking details with organization and service info
    const { data: booking, error } = await supabase
      .from('bookings')
      .select(`
        *,
        organization:organizations(*),
        service:services(*),
        staff:staff_members(*, user:users(*))
      `)
      .eq('id', bookingId)
      .single()

    if (error || !booking) {
      throw new Error('Booking not found')
    }

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `${booking.organization.name} <bookings@${booking.organization.slug}.bookease.app>`,
        to: booking.customer_email,
        subject: `Booking Confirmation - ${booking.service.name}`,
        html: generateConfirmationEmailHTML(booking),
      }),
    })

    if (!emailResponse.ok) {
      throw new Error('Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, bookingId }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

function generateConfirmationEmailHTML(booking: any): string {
  // Email template implementation
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmation</title>
    </head>
    <body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1>Booking Confirmed!</h1>
      <p>Dear ${booking.customer_name},</p>
      <p>Your booking has been confirmed.</p>

      <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h2>Booking Details</h2>
        <p><strong>Service:</strong> ${booking.service.name}</p>
        <p><strong>Staff:</strong> ${booking.staff.user.full_name}</p>
        <p><strong>Date:</strong> ${booking.booking_date}</p>
        <p><strong>Time:</strong> ${booking.start_time} - ${booking.end_time}</p>
        <p><strong>Price:</strong> ${booking.price} ${booking.service.currency}</p>
      </div>

      <p>If you need to cancel or reschedule, please contact us at ${booking.organization.email}</p>

      <p>Thank you!</p>
      <p>${booking.organization.name}</p>
    </body>
    </html>
  `
}
```

### 2. Process Stripe Payment

**File:** `supabase/functions/process-payment/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.0.0?target=deno'

const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
})

serve(async (req) => {
  try {
    const { bookingId, paymentMethodId } = await req.json()

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Get booking
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, organization:organizations(*)')
      .eq('id', bookingId)
      .single()

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.price * 100), // Convert to cents
      currency: booking.organization.settings.currency || 'usd',
      payment_method: paymentMethodId,
      confirm: true,
      metadata: {
        booking_id: bookingId,
        organization_id: booking.organization_id,
      },
    })

    // Update booking with payment info
    await supabase
      .from('bookings')
      .update({
        payment_intent_id: paymentIntent.id,
        payment_status: paymentIntent.status === 'succeeded' ? 'paid' : 'unpaid',
      })
      .eq('id', bookingId)

    return new Response(
      JSON.stringify({ success: true, paymentIntent }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

### 3. Daily Booking Reminder (Cron)

**File:** `supabase/functions/send-booking-reminders/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// This function runs daily via Supabase cron
// Schedule: 0 9 * * * (9 AM daily)

serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    // Get bookings for tomorrow
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split('T')[0]

    const { data: bookings } = await supabase
      .from('bookings')
      .select('*, organization:organizations(*), service:services(*)')
      .eq('booking_date', tomorrowStr)
      .eq('status', 'confirmed')

    // Send reminder emails
    const emailPromises = bookings?.map(async (booking) => {
      await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-booking-confirmation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          type: 'reminder',
        }),
      })
    })

    await Promise.all(emailPromises || [])

    return new Response(
      JSON.stringify({ success: true, count: bookings?.length || 0 }),
      { headers: { 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})
```

---

## SvelteKit Application Structure

```
bookease/
├── .env
├── .env.example
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
│
├── static/
│   ├── favicon.png
│   ├── logo.svg
│   └── robots.txt
│
├── src/
│   ├── routes/
│   │   ├── +layout.svelte                 # Root layout
│   │   ├── +layout.ts                     # Root data
│   │   ├── +page.svelte                   # Landing page
│   │   │
│   │   ├── (auth)/                        # Auth group
│   │   │   ├── +layout.svelte
│   │   │   ├── login/+page.svelte
│   │   │   ├── signup/+page.svelte
│   │   │   └── reset-password/+page.svelte
│   │   │
│   │   ├── (dashboard)/                   # Dashboard group
│   │   │   ├── +layout.svelte             # Dashboard shell
│   │   │   ├── +layout.ts                 # Auth guard
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte           # Analytics
│   │   │   │   └── +page.ts
│   │   │   │
│   │   │   ├── bookings/
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.ts
│   │   │   │   └── [id]/
│   │   │   │       └── +page.svelte
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── +page.ts
│   │   │   │
│   │   │   ├── services/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── new/+page.svelte
│   │   │   │
│   │   │   ├── staff/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── new/+page.svelte
│   │   │   │
│   │   │   └── settings/
│   │   │       └── +page.svelte
│   │   │
│   │   ├── book/                          # Public booking
│   │   │   └── [slug]/
│   │   │       ├── +page.svelte
│   │   │       ├── +page.ts
│   │   │       └── success/+page.svelte
│   │   │
│   │   └── api/
│   │       └── webhooks/
│   │           └── stripe/+server.ts
│   │
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                        # Skeleton UI
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Card.svelte
│   │   │   │   ├── Modal.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   ├── Select.svelte
│   │   │   │   └── Table.svelte
│   │   │   │
│   │   │   ├── booking/
│   │   │   │   ├── BookingCalendar.svelte
│   │   │   │   ├── BookingForm.svelte
│   │   │   │   ├── TimeSlotPicker.svelte
│   │   │   │   ├── ServiceSelector.svelte
│   │   │   │   └── StaffSelector.svelte
│   │   │   │
│   │   │   ├── calendar/
│   │   │   │   ├── Calendar.svelte
│   │   │   │   └── EventModal.svelte
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.svelte
│   │   │   │   ├── RevenueChart.svelte
│   │   │   │   └── BookingsChart.svelte
│   │   │   │
│   │   │   └── layout/
│   │   │       ├── Navbar.svelte
│   │   │       ├── Sidebar.svelte
│   │   │       └── Footer.svelte
│   │   │
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   │
│   │   ├── stores/
│   │   │   ├── auth.ts
│   │   │   ├── organization.ts
│   │   │   ├── bookings.ts
│   │   │   └── toast.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── cn.ts
│   │   │   ├── date.ts
│   │   │   ├── availability.ts
│   │   │   └── validation.ts
│   │   │
│   │   └── constants/
│   │       ├── roles.ts
│   │       └── statuses.ts
│   │
│   ├── types/
│   │   ├── database.ts
│   │   ├── booking.ts
│   │   └── supabase.ts
│   │
│   └── app.css
│
└── supabase/
    ├── config.toml
    ├── seed.sql
    ├── migrations/
    │   ├── 001_create_tables.sql
    │   ├── 002_create_rls_policies.sql
    │   └── 003_create_functions.sql
    └── functions/
        ├── send-booking-confirmation/
        ├── process-payment/
        └── send-booking-reminders/
```

---

## Must-Have Features (MVP)

### 1. Real-Time Calendar Updates ✅

**Implementation:**
```typescript
// src/lib/stores/bookings.ts
import { writable } from 'svelte/store'
import { supabase } from '$lib/supabase/client'

export const bookingsStore = writable<Booking[]>([])

export function subscribeToBookings(organizationId: string) {
  const channel = supabase
    .channel('bookings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `organization_id=eq.${organizationId}`
      },
      (payload) => {
        // Update store with new/changed booking
        bookingsStore.update(bookings => {
          if (payload.eventType === 'INSERT') {
            return [...bookings, payload.new]
          } else if (payload.eventType === 'UPDATE') {
            return bookings.map(b =>
              b.id === payload.new.id ? payload.new : b
            )
          } else if (payload.eventType === 'DELETE') {
            return bookings.filter(b => b.id !== payload.old.id)
          }
          return bookings
        })
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}
```

### 2. Payment Integration (Demo) ✅

**Stripe Test Mode Setup:**
```typescript
// src/lib/stripe/client.ts
import { loadStripe } from '@stripe/stripe-js'

export const stripePromise = loadStripe(
  import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY
)

// src/routes/book/[slug]/+page.svelte
async function handlePayment(bookingId: string) {
  const stripe = await stripePromise

  // Call Edge Function to create payment intent
  const response = await fetch('/api/process-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ bookingId })
  })

  const { clientSecret } = await response.json()

  // Confirm payment with Stripe
  const { error } = await stripe.confirmCardPayment(clientSecret)

  if (error) {
    toast.error('Payment failed')
  } else {
    toast.success('Booking confirmed and paid!')
  }
}
```

### 3. Analytics Dashboard ✅

**Key Metrics:**
- Total bookings (today, week, month)
- Revenue trends (Chart.js)
- Popular services
- Staff utilization
- Booking status breakdown

**Implementation:**
```typescript
// src/routes/(dashboard)/dashboard/+page.ts
export async function load({ locals: { supabase, session } }) {
  const orgId = session.user.organization_id

  // Get analytics data
  const [bookings, revenue, services] = await Promise.all([
    supabase
      .from('bookings')
      .select('*')
      .eq('organization_id', orgId)
      .gte('booking_date', getStartOfMonth()),

    supabase
      .from('bookings')
      .select('price, payment_status, booking_date')
      .eq('organization_id', orgId)
      .eq('payment_status', 'paid'),

    supabase
      .from('services')
      .select('id, name, bookings(count)')
      .eq('organization_id', orgId)
  ])

  return {
    stats: {
      totalBookings: bookings.data?.length || 0,
      totalRevenue: revenue.data?.reduce((sum, b) => sum + b.price, 0) || 0,
      popularServices: services.data,
    }
  }
}
```

---

## Implementation Timeline (5-6 Weeks)

### Week 1: Foundation & Setup
- [ ] Initialize SvelteKit project
- [ ] Setup Tailwind + Skeleton UI
- [ ] Configure Supabase project
- [ ] Create database schema
- [ ] Implement RLS policies
- [ ] Setup Supabase Auth
- [ ] Create basic layouts

### Week 2: Core Booking Flow
- [ ] Public booking page (`/book/[slug]`)
- [ ] Service selection UI
- [ ] Staff selection UI
- [ ] Custom calendar component
- [ ] Time slot picker
- [ ] Booking form with validation
- [ ] Booking confirmation

### Week 3: Backend & Real-Time
- [ ] Supabase Edge Functions setup
- [ ] Email confirmation (Resend)
- [ ] Payment processing (Stripe test)
- [ ] Real-time subscriptions
- [ ] Availability calculation logic
- [ ] Timezone handling

### Week 4: Dashboard & Management
- [ ] Organization onboarding
- [ ] Dashboard analytics
- [ ] Service CRUD
- [ ] Staff CRUD
- [ ] Booking management
- [ ] Calendar view

### Week 5: Polish & Testing
- [ ] Responsive design refinement
- [ ] Svelte transitions/animations
- [ ] Error handling
- [ ] Loading states
- [ ] Performance optimization
- [ ] Lighthouse audit

### Week 6: Deploy & Documentation
- [ ] Azure Static Web Apps deployment
- [ ] Supabase production setup
- [ ] Environment variables
- [ ] Seed demo data
- [ ] README documentation
- [ ] Video demo recording

---

## Environment Variables

### SvelteKit (`.env`)
```env
# Supabase
PUBLIC_SUPABASE_URL=https://xxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=xxx

# Site
PUBLIC_SITE_URL=http://localhost:5173
PUBLIC_SITE_NAME=BookEase

# Stripe (Test Mode)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```

### Supabase Edge Functions
```env
# Resend
RESEND_API_KEY=re_xxx

# Stripe
STRIPE_SECRET_KEY=sk_test_xxx

# Supabase (for Edge Functions)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
SUPABASE_ANON_KEY=xxx
```

---

## Deployment

### Azure Static Web Apps
1. Build SvelteKit with `adapter-static`
2. Deploy via GitHub Actions
3. Configure custom domain (optional)

### Supabase
1. Run migrations: `supabase db push`
2. Deploy Edge Functions: `supabase functions deploy`
3. Configure secrets

---

## Success Metrics

### Technical
- Lighthouse Score: 95+ (all categories)
- Bundle Size: < 100KB (initial)
- Page Load: < 1s
- Time to Interactive: < 2s

### Portfolio
- Complete booking flow working
- Real-time updates demonstrable
- Email notifications functional
- Payment integration (test mode)
- Professional UI/UX
- Zero monthly cost

---

## Next Steps

1. **Review this specification** - Ensure all requirements are captured
2. **Setup development environment** - Install dependencies
3. **Create Supabase project** - Initialize database
4. **Begin Week 1 tasks** - Start with foundation

**Ready to build!** 🚀
