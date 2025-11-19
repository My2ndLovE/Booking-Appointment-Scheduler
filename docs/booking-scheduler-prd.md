# Product Requirements Document (PRD)
## Multi-Tenant Booking & Appointment Scheduler

---

## 1. Project Overview

**Project Name:** BookEase - Multi-Tenant Appointment Scheduler

**Purpose:** A high-performance showcase/demo booking platform built with modern web technologies to demonstrate full-stack development skills.

**Target Audience:**
- **Primary:** Recruiters, hiring managers, potential employers
- **Secondary:** Portfolio visitors, demo users

**Project Type:** Portfolio/Demo Project (Optimized for minimal cost)

**Hosting:** Azure Static Web Apps (Free Tier) + Azure Functions + Supabase

**Monthly Cost:** $0 (all free tiers)

---

## 2. Tech Stack (Optimized for Performance & Zero Cost)

### Frontend
- **Framework:** SvelteKit 2.x (TypeScript, SSG/SSR hybrid)
- **UI Components:** Skeleton UI (Tailwind-based Svelte component library)
- **Styling:** TailwindCSS v3
- **Calendar:** Custom Svelte Calendar component
- **Forms:** Svelte native forms + Zod validation
- **State Management:** Svelte stores (built-in, no external library needed)
- **Data Fetching:** SvelteKit load functions + fetch
- **Date Handling:** date-fns
- **Icons:** Tabler Icons (or Heroicons)
- **Charts:** Chart.js with svelte-chartjs
- **Animations:** Svelte transitions (built-in)

### Backend
- **API:** Azure Functions (Node.js 20.x, TypeScript, Consumption Plan - Free Tier)
- **Database:** Supabase PostgreSQL (Free Tier: 500 MB, 2 GB bandwidth)
- **Auth:** Supabase Auth (Free Tier: Unlimited users)
- **Real-time:** Supabase Realtime (Free Tier: 200 concurrent connections)
- **Storage:** Supabase Storage (Free Tier: 1 GB)
- **Email:** SendGrid (Free Tier: 100 emails/day)
- **Payment (Demo Only):** Stripe Test Mode

### DevOps & Tools
- **Hosting:** Azure Static Web Apps (Free Tier: 100 GB bandwidth/month)
- **Adapter:** @sveltejs/adapter-static (for Azure Static Web Apps)
- **Version Control:** Git + GitHub
- **Package Manager:** pnpm
- **Environment:** Node.js 20.x
- **Linting:** ESLint + Prettier
- **Type Checking:** TypeScript strict mode

### Why This Stack?

**Performance:**
- SvelteKit compiles to vanilla JS (no virtual DOM overhead)
- Smaller bundle sizes (~30KB vs 200KB+ with React frameworks)
- 100/100 Lighthouse scores achievable
- Perfect for Azure Static Web Apps bandwidth limits

**Cost:**
- All services have generous free tiers
- Total monthly cost: **$0**

**Developer Experience:**
- Less boilerplate code than React (50% less code)
- Built-in state management (Svelte stores)
- Built-in animations and transitions
- Fast dev server with Vite under the hood

**Portfolio Appeal:**
- Shows knowledge of modern frameworks beyond React
- Demonstrates performance optimization skills
- Unique enough to stand out in interviews

---

## 3. Architecture

### High-Level Architecture
```
┌──────────────────────────────────────────────────────┐
│   SvelteKit Frontend (Azure Static Web App)          │
│   - Static Site Generation (SSG)                     │
│   - Svelte Components (reactive, minimal JS)         │
│   - SvelteKit Routes & Load Functions                │
│   - Skeleton UI Components                           │
└────────────────────┬─────────────────────────────────┘
                     │
                     │ HTTPS
                     │
                     ├──────────────────┬───────────────┐
                     │                  │               │
                     ▼                  ▼               ▼
        ┌────────────────────┐  ┌──────────────┐  ┌─────────────┐
        │  Supabase          │  │  Azure       │  │  SendGrid   │
        │  - PostgreSQL      │  │  Functions   │  │  - Email    │
        │  - Auth (JWT)      │  │  - Scheduled │  │  - Free     │
        │  - Realtime        │  │  - Complex   │  │    100/day  │
        │  - Storage         │  │    Logic     │  │             │
        │  - Row Security    │  │  - Webhooks  │  │             │
        └────────────────────┘  └──────────────┘  └─────────────┘
```

### Application Layers
1. **Presentation Layer:** SvelteKit pages and Svelte components
2. **Data Layer:** SvelteKit load functions + Supabase client
3. **API Layer:** Azure Functions (for complex operations, emails, scheduled tasks)
4. **Database Layer:** Supabase PostgreSQL with Row-Level Security (RLS)
5. **Auth Layer:** Supabase Auth (JWT-based authentication)

### Why SvelteKit + Azure Static Web Apps?

**Deployment Model:**
- SvelteKit builds to static HTML/CSS/JS using `adapter-static`
- Azure Static Web Apps serves pre-rendered pages
- Client-side routing with minimal JavaScript
- Direct Supabase calls from browser (RLS enforces security)
- Azure Functions only for server-side operations (emails, cron jobs)

**Security:**
- Row-Level Security (RLS) in PostgreSQL ensures multi-tenant isolation
- Supabase Auth provides secure JWT tokens
- No sensitive operations in client code
- Azure Functions validate requests server-side

---

## 4. Database Schema

### Core Tables

#### `organizations` (Tenants/Businesses)
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
  business_hours JSONB, -- {monday: {open: '09:00', close: '17:00'}, ...}
  settings JSONB, -- {booking_buffer: 15, max_advance_days: 30, ...}
  stripe_account_id VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_org_slug ON organizations(slug);
```

#### `users` (Extends Supabase auth.users)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  avatar_url TEXT,
  role VARCHAR(20) NOT NULL DEFAULT 'customer', -- super_admin, owner, staff, customer
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_user_org ON users(organization_id);
CREATE INDEX idx_user_email ON users(email);
```

#### `services`
```sql
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL, -- 30, 60, 90, etc.
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  color VARCHAR(7), -- For calendar display
  is_active BOOLEAN DEFAULT true,
  buffer_time_minutes INTEGER DEFAULT 0, -- Time between bookings
  max_advance_booking_days INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_service_org ON services(organization_id);
```

#### `staff_members`
```sql
CREATE TABLE staff_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(100),
  bio TEXT,
  working_hours JSONB, -- {monday: [{start: '09:00', end: '12:00'}, ...], ...}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);

CREATE INDEX idx_staff_org ON staff_members(organization_id);
CREATE INDEX idx_staff_user ON staff_members(user_id);
```

#### `staff_services` (Many-to-Many)
```sql
CREATE TABLE staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, service_id)
);

CREATE INDEX idx_staff_services_staff ON staff_services(staff_id);
CREATE INDEX idx_staff_services_service ON staff_services(service_id);
```

#### `bookings`
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  staff_id UUID NOT NULL REFERENCES staff_members(id),
  customer_id UUID NOT NULL REFERENCES users(id),
  booking_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  timezone VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed, no_show
  price DECIMAL(10,2) NOT NULL,
  payment_status VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid, refunded
  payment_intent_id VARCHAR(255), -- Stripe payment intent
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20),
  notes TEXT,
  cancellation_reason TEXT,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_booking_org ON bookings(organization_id);
CREATE INDEX idx_booking_staff_date ON bookings(staff_id, booking_date);
CREATE INDEX idx_booking_customer ON bookings(customer_id);
CREATE INDEX idx_booking_status ON bookings(status);
```

#### `availability_exceptions`
```sql
CREATE TABLE availability_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff_members(id) ON DELETE CASCADE,
  exception_date DATE NOT NULL,
  is_available BOOLEAN DEFAULT false, -- false = day off, true = special hours
  start_time TIME,
  end_time TIME,
  reason VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(staff_id, exception_date)
);

CREATE INDEX idx_exception_staff_date ON availability_exceptions(staff_id, exception_date);
```

#### `reviews`
```sql
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id),
  staff_id UUID NOT NULL REFERENCES staff_members(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

CREATE INDEX idx_review_org ON reviews(organization_id);
CREATE INDEX idx_review_staff ON reviews(staff_id);
```

---

## 5. Row Level Security (RLS) Policies

Enable RLS on all tables and create policies:

### Example for `bookings` table:
```sql
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Customers can view their own bookings
CREATE POLICY "Customers can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = customer_id);

-- Staff can view bookings in their organization
CREATE POLICY "Staff can view org bookings"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = bookings.organization_id
      AND users.role IN ('owner', 'staff')
    )
  );

-- Customers can create bookings
CREATE POLICY "Customers can create bookings"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

-- Staff can update bookings in their organization
CREATE POLICY "Staff can update org bookings"
  ON bookings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.organization_id = bookings.organization_id
      AND users.role IN ('owner', 'staff')
    )
  );
```

---

## 6. Features & User Stories

### 6.1 Multi-Tenancy

**Organization Registration**
- As a business owner, I can register my business with a unique slug
- As a business owner, I can customize business hours and settings
- As a business owner, I can upload a logo and set timezone

**Organization Management**
- As a business owner, I can update business information
- As a business owner, I can view analytics dashboard
- As a business owner, I can manage staff members

### 6.2 Authentication & Authorization

**User Registration/Login**
- As a user, I can sign up with email/password
- As a user, I can log in with email/password
- As a user, I can reset my password
- As a user, I can update my profile

**Role-Based Access**
- Super Admin: Manage all organizations
- Owner: Manage their organization, staff, services, bookings
- Staff: View schedule, manage assigned bookings
- Customer: Book appointments, view booking history

### 6.3 Service Management

**Service CRUD**
- As an owner, I can create services with name, description, duration, price
- As an owner, I can assign services to staff members
- As an owner, I can set buffer times between bookings
- As an owner, I can activate/deactivate services

### 6.4 Staff Management

**Staff CRUD**
- As an owner, I can add staff members to my organization
- As an owner, I can set working hours for each staff member
- As an owner, I can assign services to staff members
- As a staff member, I can set availability exceptions (days off)

### 6.5 Booking System

**Customer Booking Flow**
1. Select organization (via slug or search)
2. Browse available services
3. Select service
4. Choose staff member (or "Any available")
5. View calendar with available time slots
6. Select date and time
7. Enter customer details (if not logged in)
8. Confirm booking
9. Receive confirmation email

**Availability Calculation**
- Check staff working hours
- Check existing bookings
- Check availability exceptions
- Apply buffer times
- Apply max advance booking days
- Show only available slots in customer timezone

**Booking Management**
- As a customer, I can view my upcoming bookings
- As a customer, I can cancel my booking (with cancellation policy)
- As staff/owner, I can confirm/cancel bookings
- As staff/owner, I can mark bookings as completed or no-show
- Real-time updates via Supabase Realtime

### 6.6 Calendar & Schedule

**Calendar Views**
- As a staff member, I can view my schedule in day/week/month view
- As an owner, I can view all staff schedules
- Color-coded services for easy identification
- Click on time slot to create manual booking

### 6.7 Notifications

**Email Notifications**
- Booking confirmation (to customer)
- Booking reminder (24 hours before, to customer)
- New booking notification (to staff/owner)
- Booking cancellation (to customer and staff)
- Review request (after completed booking)

### 6.8 Reviews & Ratings

**Review System**
- As a customer, I can rate and review after completed booking
- As an owner, I can view all reviews
- As a customer, I can see staff ratings and reviews
- Display average rating on staff profiles

### 6.9 Payment Integration (Showcase)

**Stripe Integration**
- As an owner, I can connect Stripe account
- As a customer, I can pay for booking (test mode)
- Display payment status in booking details
- Handle refunds for cancellations

### 6.10 Analytics Dashboard

**Owner Dashboard**
- Total bookings (today, week, month)
- Revenue (test data)
- Popular services
- Staff performance
- Customer retention
- Charts and graphs

---

## 7. Application Structure

### SvelteKit Project Structure
```
bookease/
├── .env
├── .env.production
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── static/                               # Static assets (served as-is)
│   ├── favicon.png
│   ├── robots.txt
│   └── images/
├── src/
│   ├── routes/                           # File-based routing
│   │   ├── +layout.svelte                # Root layout
│   │   ├── +layout.ts                    # Root layout data
│   │   ├── +page.svelte                  # Landing page
│   │   ├── +page.ts                      # Landing page data
│   │   ├── (auth)/                       # Auth route group
│   │   │   ├── +layout.svelte            # Auth layout
│   │   │   ├── login/
│   │   │   │   └── +page.svelte
│   │   │   ├── signup/
│   │   │   │   └── +page.svelte
│   │   │   └── reset-password/
│   │   │       └── +page.svelte
│   │   ├── (dashboard)/                  # Dashboard route group
│   │   │   ├── +layout.svelte            # Dashboard layout with sidebar
│   │   │   ├── +layout.ts                # Protect routes, load user
│   │   │   ├── dashboard/
│   │   │   │   ├── +page.svelte          # Analytics dashboard
│   │   │   │   └── +page.ts              # Load dashboard data
│   │   │   ├── bookings/
│   │   │   │   ├── +page.svelte          # List bookings
│   │   │   │   ├── +page.ts              # Load bookings
│   │   │   │   └── [id]/
│   │   │   │       ├── +page.svelte      # Booking details
│   │   │   │       └── +page.ts
│   │   │   ├── calendar/
│   │   │   │   ├── +page.svelte          # Calendar view
│   │   │   │   └── +page.ts
│   │   │   ├── services/
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.ts
│   │   │   │   ├── new/
│   │   │   │   │   └── +page.svelte
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── +page.svelte
│   │   │   ├── staff/
│   │   │   │   ├── +page.svelte
│   │   │   │   ├── +page.ts
│   │   │   │   ├── new/
│   │   │   │   │   └── +page.svelte
│   │   │   │   └── [id]/
│   │   │   │       └── edit/
│   │   │   │           └── +page.svelte
│   │   │   ├── customers/
│   │   │   │   ├── +page.svelte
│   │   │   │   └── [id]/
│   │   │   │       └── +page.svelte
│   │   │   ├── reviews/
│   │   │   │   └── +page.svelte
│   │   │   └── settings/
│   │   │       └── +page.svelte          # Organization settings
│   │   ├── book/                         # Public booking
│   │   │   └── [slug]/
│   │   │       ├── +page.svelte          # Booking page
│   │   │       ├── +page.ts              # Load org/services
│   │   │       └── success/
│   │   │           └── +page.svelte      # Confirmation
│   │   └── api/                          # Optional API routes
│   │       └── webhooks/
│   │           └── stripe/
│   │               └── +server.ts        # Stripe webhook
│   ├── lib/                              # Shared utilities
│   │   ├── components/                   # Shared Svelte components
│   │   │   ├── ui/                       # Skeleton UI components
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Card.svelte
│   │   │   │   ├── Modal.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   ├── Select.svelte
│   │   │   │   ├── Table.svelte
│   │   │   │   ├── Badge.svelte
│   │   │   │   ├── Avatar.svelte
│   │   │   │   └── Toast.svelte
│   │   │   ├── booking/
│   │   │   │   ├── BookingCalendar.svelte
│   │   │   │   ├── BookingForm.svelte
│   │   │   │   ├── TimeSlotPicker.svelte
│   │   │   │   ├── ServiceSelector.svelte
│   │   │   │   └── StaffSelector.svelte
│   │   │   ├── calendar/
│   │   │   │   ├── Calendar.svelte       # Custom calendar
│   │   │   │   └── EventModal.svelte
│   │   │   ├── dashboard/
│   │   │   │   ├── StatsCard.svelte
│   │   │   │   ├── RevenueChart.svelte
│   │   │   │   ├── BookingsChart.svelte
│   │   │   │   └── RecentBookings.svelte
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.svelte
│   │   │   │   ├── Sidebar.svelte
│   │   │   │   ├── Footer.svelte
│   │   │   │   └── UserMenu.svelte
│   │   │   └── shared/
│   │   │       ├── LoadingSpinner.svelte
│   │   │       ├── ErrorBoundary.svelte
│   │   │       ├── ConfirmDialog.svelte
│   │   │       └── DataTable.svelte
│   │   ├── supabase/
│   │   │   └── client.ts                 # Supabase client
│   │   ├── stores/                       # Svelte stores
│   │   │   ├── auth.ts                   # Auth state
│   │   │   ├── organization.ts           # Current org
│   │   │   ├── bookings.ts               # Bookings cache
│   │   │   └── toast.ts                  # Toast notifications
│   │   ├── utils/
│   │   │   ├── cn.ts                     # Class name utility
│   │   │   ├── date.ts                   # Date utilities
│   │   │   ├── time.ts                   # Time utilities
│   │   │   ├── timezone.ts               # Timezone conversion
│   │   │   ├── availability.ts           # Availability calculation
│   │   │   └── validation.ts             # Zod validators
│   │   └── constants/
│   │       ├── roles.ts                  # User roles
│   │       ├── statuses.ts               # Booking statuses
│   │       └── timezones.ts              # Timezone list
│   ├── types/
│   │   ├── database.ts                   # Generated from Supabase
│   │   ├── booking.ts
│   │   ├── service.ts
│   │   ├── staff.ts
│   │   ├── organization.ts
│   │   └── user.ts
│   └── app.css                           # Global styles (Tailwind imports)
└── azure-functions/
    ├── host.json
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── functions/
    │   │   ├── send-booking-confirmation.ts    # HTTP trigger
    │   │   ├── send-booking-reminder.ts        # Timer trigger
    │   │   ├── process-payment.ts              # HTTP trigger
    │   │   └── cleanup-expired-bookings.ts     # Timer trigger
    │   ├── services/
    │   │   ├── email.service.ts
    │   │   ├── supabase.service.ts
    │   │   └── stripe.service.ts
    │   └── utils/
    │       ├── logger.ts
    │       └── validators.ts
    └── .env
```

---

## 8. API Endpoints

### Next.js API Routes (Client-side calls)

#### Webhooks
- `POST /api/webhooks/stripe` - Handle Stripe webhooks

#### Health Check
- `GET /api/health` - Health check endpoint

### Supabase PostgREST Endpoints (Server-side)

All CRUD operations use Supabase client directly:

#### Organizations
- `GET /rest/v1/organizations` - List organizations
- `GET /rest/v1/organizations?slug=eq.{slug}` - Get by slug
- `POST /rest/v1/organizations` - Create organization
- `PATCH /rest/v1/organizations?id=eq.{id}` - Update organization

#### Services
- `GET /rest/v1/services?organization_id=eq.{id}` - List services
- `POST /rest/v1/services` - Create service
- `PATCH /rest/v1/services?id=eq.{id}` - Update service
- `DELETE /rest/v1/services?id=eq.{id}` - Delete service

#### Staff
- `GET /rest/v1/staff_members?organization_id=eq.{id}` - List staff
- `POST /rest/v1/staff_members` - Create staff
- `PATCH /rest/v1/staff_members?id=eq.{id}` - Update staff

#### Bookings
- `GET /rest/v1/bookings?organization_id=eq.{id}` - List bookings
- `GET /rest/v1/bookings?customer_id=eq.{id}` - Get customer bookings
- `POST /rest/v1/bookings` - Create booking
- `PATCH /rest/v1/bookings?id=eq.{id}` - Update booking

### Azure Functions Endpoints

#### Email Functions
- `POST /api/send-booking-confirmation` - Send confirmation email
  - Body: `{ bookingId: string }`

- `POST /api/send-booking-reminder` - Send reminder email
  - Timer trigger: Runs daily at 9 AM

#### Payment Functions
- `POST /api/process-payment` - Process payment
  - Body: `{ bookingId: string, paymentMethodId: string }`

#### Maintenance Functions
- `POST /api/cleanup-expired-bookings` - Clean up old bookings
  - Timer trigger: Runs daily at midnight

---

## 9. Core Functionality Details

### 9.1 Availability Calculation Algorithm

```typescript
// Pseudocode for availability calculation
function getAvailableSlots(
  staffId: string,
  serviceId: string,
  date: Date,
  timezone: string
): TimeSlot[] {
  
  // 1. Get service details (duration, buffer)
  const service = getService(serviceId);
  
  // 2. Get staff working hours for the day
  const workingHours = getStaffWorkingHours(staffId, date);
  
  // 3. Get staff availability exceptions
  const exceptions = getAvailabilityExceptions(staffId, date);
  
  // 4. If exception exists and is day off, return empty
  if (exceptions && !exceptions.isAvailable) {
    return [];
  }
  
  // 5. Get actual working hours (use exception if available)
  const actualHours = exceptions?.customHours || workingHours;
  
  // 6. Get existing bookings for the day
  const bookings = getExistingBookings(staffId, date);
  
  // 7. Generate all possible slots
  const slots = generateTimeSlots(
    actualHours.start,
    actualHours.end,
    service.duration + service.buffer
  );
  
  // 8. Filter out booked slots
  const availableSlots = slots.filter(slot => {
    return !hasConflict(slot, bookings, service.duration);
  });
  
  // 9. Convert to customer timezone
  return convertToTimezone(availableSlots, timezone);
}
```

### 9.2 Real-time Updates

Use Supabase Realtime for live updates:

```typescript
// Subscribe to booking changes
supabase
  .channel('bookings')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'bookings',
      filter: `organization_id=eq.${orgId}`
    },
    (payload) => {
      // Update UI with new booking
      handleBookingChange(payload);
    }
  )
  .subscribe();
```

### 9.3 Email Templates

Create reusable email templates:

1. **Booking Confirmation**
   - Booking details
   - Add to calendar link (ICS file)
   - Cancellation link

2. **Booking Reminder**
   - 24 hours before appointment
   - Booking details
   - Reschedule link

3. **Booking Cancellation**
   - Cancellation confirmation
   - Refund details (if applicable)

4. **Review Request**
   - After completed booking
   - Direct link to review form

---

## 10. Implementation Phases (Simplified for Demo)

**Total Timeline: 3-4 Weeks**

### Phase 1: Foundation & Setup (Week 1)
- [ ] Initialize SvelteKit project with TypeScript
- [ ] Setup Tailwind CSS and Skeleton UI
- [ ] Setup Supabase project
- [ ] Create database schema and RLS policies
- [ ] Setup Azure Functions project structure
- [ ] Configure environment variables
- [ ] Create basic layout components (navbar, sidebar, footer)
- [ ] Implement Supabase Auth (login, signup, logout)
- [ ] Setup Svelte stores for state management

### Phase 2: Core Booking Flow (Week 2)
- [ ] Public booking page with slug routing
- [ ] Service selection UI (Skeleton components)
- [ ] Staff selection UI
- [ ] Custom Svelte calendar component
- [ ] Availability calculation logic
- [ ] Time slot picker with smooth animations
- [ ] Booking form with Zod validation
- [ ] Booking confirmation page
- [ ] Email notifications (Azure Functions + SendGrid)
- [ ] Real-time updates with Supabase Realtime

### Phase 3: Dashboard & Management (Week 3)
- [ ] Organization registration and onboarding
- [ ] Dashboard layout with Skeleton UI
- [ ] Service CRUD operations
- [ ] Staff CRUD operations
- [ ] Booking management (list, view, cancel, complete)
- [ ] Staff calendar view (simplified to week view)
- [ ] Role-based access control
- [ ] Basic analytics dashboard (stats cards + simple charts)

### Phase 4: Polish & Deploy (Week 4)
- [ ] Svelte transitions and animations
- [ ] Error handling and loading states
- [ ] Responsive design polish (mobile-first)
- [ ] Performance optimization (code splitting, lazy loading)
- [ ] Lighthouse optimization (target 100/100)
- [ ] SEO optimization (meta tags, structured data)
- [ ] Azure Static Web Apps deployment (adapter-static)
- [ ] Azure Functions deployment
- [ ] Create demo organizations with sample data
- [ ] Documentation and README

### Features Removed for Demo Version:
- ❌ Reviews & ratings system
- ❌ Payment integration (Stripe)
- ❌ Advanced analytics/reporting
- ❌ Complex availability exceptions
- ❌ Email reminders (scheduled tasks)
- ❌ User profile customization
- ❌ Multi-language support

### Core Features Kept:
- ✅ Multi-tenant data model
- ✅ Complete booking flow
- ✅ Real-time calendar updates
- ✅ Email confirmations
- ✅ Authentication & authorization
- ✅ Service & staff management
- ✅ Responsive UI with Skeleton components
- ✅ Basic analytics dashboard

---

## 11. Environment Variables

### SvelteKit (.env)
```env
# Supabase (Public - safe to expose)
PUBLIC_SUPABASE_URL=your_supabase_url
PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# Supabase (Private - server-side only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site Configuration
PUBLIC_SITE_URL=http://localhost:5173
PUBLIC_SITE_NAME=BookEase

# Azure Functions (if needed from client)
PUBLIC_FUNCTIONS_URL=http://localhost:7071

# Feature Flags (optional)
PUBLIC_ENABLE_REALTIME=true
PUBLIC_ENABLE_EMAIL_NOTIFICATIONS=true
```

### Azure Functions (.env)
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# SendGrid Email (Free Tier: 100 emails/day)
SENDGRID_API_KEY=your_sendgrid_key
FROM_EMAIL=noreply@bookease.com
FROM_NAME=BookEase

# Site Configuration
SITE_URL=https://bookease.azurestaticapps.net
FRONTEND_URL=https://bookease.azurestaticapps.net

# Optional: Rate Limiting
MAX_EMAILS_PER_DAY=95
```

### Azure Static Web Apps Configuration

**staticwebapp.config.json**
```json
{
  "navigationFallback": {
    "rewrite": "/index.html",
    "exclude": ["/images/*.{png,jpg,gif}", "/css/*"]
  },
  "routes": [
    {
      "route": "/api/*",
      "allowedRoles": ["anonymous"]
    }
  ],
  "responseOverrides": {
    "404": {
      "rewrite": "/index.html",
      "statusCode": 200
    }
  }
}
```

---

## 12. Key Technical Decisions

### Why SvelteKit?
- **Performance:** Compiles to vanilla JS, no virtual DOM overhead
- **Bundle Size:** ~30KB vs 200KB+ with React frameworks (better for free tier bandwidth)
- **Developer Experience:** 50% less code than React, built-in state management
- **SEO:** Excellent SSR/SSG support
- **Portfolio Appeal:** Shows modern framework knowledge beyond React
- **Lighthouse:** Easy to achieve 100/100 scores
- **Azure Compatibility:** Works perfectly with Static Web Apps using adapter-static

### Why Skeleton UI?
- **Tailwind-based:** Leverages Tailwind utility classes
- **Svelte-native:** Built specifically for Svelte
- **Component Library:** Pre-built components (modals, forms, tables, etc.)
- **Fast Development:** Less time building UI components
- **Customizable:** Easy to theme and extend
- **Lightweight:** Minimal bundle impact

### Why Supabase?
- **Free Tier:** 500 MB database, 2 GB bandwidth, unlimited users
- **PostgreSQL:** Full relational database power with JSONB support
- **Built-in Auth:** JWT-based authentication with social logins
- **Row-Level Security:** Perfect for multi-tenant isolation
- **Real-time:** WebSocket subscriptions for live updates
- **Storage:** 1 GB free for file uploads
- **Cost:** $0/month for demo usage

### Why Azure Functions?
- **Free Tier:** 1M executions/month (more than enough for demo)
- **Serverless:** No idle costs, pay only for actual usage
- **Scheduled Tasks:** Built-in timer triggers for cron jobs
- **Azure Integration:** Seamless integration with Static Web Apps
- **TypeScript:** Full TypeScript support
- **Cost:** $0/month for demo usage

### Why SendGrid?
- **Free Tier:** 100 emails/day (sufficient for demo)
- **Reliability:** Industry-standard email service
- **Easy Integration:** Simple API
- **Templates:** Email template support
- **Cost:** $0/month

### Why Custom Calendar (vs FullCalendar)?
- **Bundle Size:** FullCalendar is ~500KB, custom is ~20KB
- **License:** FullCalendar commercial license costs money
- **Learning:** Shows ability to build complex components
- **Customization:** Full control over features and styling
- **Performance:** Optimized specifically for our use case

---

## 13. Security Considerations

### Authentication
- Use Supabase Auth with secure JWT tokens
- Implement refresh token rotation
- Hash sensitive data in database
- Use HTTPS only in production

### Authorization
- Implement RLS policies on all tables
- Validate user roles on every request
- Prevent data leakage across organizations
- Use service role key only in server-side code

### Data Validation
- Validate all inputs with Zod
- Sanitize user inputs to prevent XSS
- Use parameterized queries to prevent SQL injection
- Implement rate limiting on API endpoints

### Payment Security
- Never store card details directly
- Use Stripe.js for PCI compliance
- Verify webhook signatures
- Use test mode for showcase

---

## 14. Performance Optimization

### Frontend
- Use Server Components where possible
- Implement lazy loading for components
- Optimize images with Next.js Image
- Use React Query for caching
- Minimize client-side JavaScript

### Backend
- Index database columns used in WHERE clauses
- Use connection pooling
- Cache frequently accessed data
- Optimize SQL queries with EXPLAIN ANALYZE

### Deployment
- Enable Azure Static Web Apps CDN
- Compress assets
- Use environment-specific builds
- Monitor with Azure Application Insights

---

## 15. Testing Strategy

### Unit Tests
- Test utility functions (date, time, availability)
- Test React hooks
- Test form validation schemas

### Integration Tests
- Test API routes
- Test database operations
- Test Azure Functions

### E2E Tests (Optional)
- Test complete booking flow
- Test authentication flow
- Test dashboard operations

---

## 16. Deployment Checklist

### Pre-deployment
- [ ] Setup Supabase production project
- [ ] Create Azure Static Web Apps resource
- [ ] Create Azure Functions app
- [ ] Setup Stripe account (test mode)
- [ ] Configure custom domain (optional)
- [ ] Setup email service

### Deployment
- [ ] Deploy database schema to Supabase
- [ ] Setup RLS policies
- [ ] Deploy Next.js to Azure Static Web Apps
- [ ] Deploy Azure Functions
- [ ] Configure environment variables
- [ ] Test all functionality in production

### Post-deployment
- [ ] Monitor logs and errors
- [ ] Test performance
- [ ] Verify email delivery
- [ ] Test Stripe webhooks
- [ ] Create demo organization and data

---

## 17. Demo Data Setup

Create seed data for showcase:

### Organizations
- "Serenity Spa" (spa/salon)
- "HealthFirst Clinic" (medical)
- "TechConsult Pro" (consulting)

### Services (per organization)
- 3-5 services with varying durations and prices

### Staff Members
- 2-3 staff per organization
- Different working hours and specialties

### Sample Bookings
- Mix of confirmed, completed, and cancelled bookings
- Spread across different dates

---

## 18. Future Enhancements (Out of Scope)

- Mobile app (React Native)
- SMS notifications (Twilio)
- Video consultation integration (Azure Communication Services)
- Advanced reporting and exports
- White-label solution
- Multi-language support
- Recurring appointments
- Group bookings
- Waitlist management
- Loyalty program
- Marketing integrations (Mailchimp, etc.)

---

## 19. Success Metrics (For Demo/Portfolio)

### Technical Metrics
- **Lighthouse Score:** 95-100 across all categories (Performance, Accessibility, Best Practices, SEO)
- **Page Load Time:** < 1 second (initial load), < 200ms (navigation)
- **Bundle Size:** < 100KB initial JavaScript
- **Time to Interactive:** < 2 seconds
- **Zero Critical Security Vulnerabilities:** Pass all OWASP checks
- **Mobile Responsive:** Perfect on all screen sizes (320px - 2560px)

### Portfolio Appeal Metrics
- **Complete Booking Flow:** End-to-end working demo
- **Real-time Updates:** Live calendar updates via Supabase Realtime
- **Email Notifications:** Confirmation emails working
- **Professional UI/UX:** Polished design with Skeleton UI
- **Smooth Animations:** Svelte transitions throughout
- **Multi-tenant Architecture:** Proper data isolation demonstrated
- **Code Quality:** Clean TypeScript, proper types, good comments
- **Documentation:** Comprehensive README with architecture diagrams

### Cost Metrics
- **Monthly Cost:** $0 (all free tiers)
- **Bandwidth Usage:** < 10 GB/month (well within 100 GB free tier)
- **Database Size:** < 100 MB (well within 500 MB free tier)
- **Function Executions:** < 10,000/month (well within 1M free tier)
- **Email Sends:** < 50/month (well within 100/day free tier)

---

## 20. Support & Documentation

### For Developers
- Comprehensive README.md
- API documentation
- Database schema diagram
- Architecture diagram
- Setup instructions

### For Users
- User guide for business owners
- Quick start guide
- FAQ section
- Video tutorials (optional)

---

## 21. Development Guidelines

### Initial Setup
1. Initialize SvelteKit project with TypeScript and TailwindCSS
2. Install Skeleton UI and all required dependencies
3. Configure adapter-static for Azure Static Web Apps
4. Setup Supabase client configuration
5. Create all database tables with provided schema
6. Setup RLS policies for all tables
7. Initialize Azure Functions project structure

### Development Order
Follow the implementation phases sequentially (3-4 weeks). For each feature:
1. Create database tables/functions if needed
2. Define TypeScript types (generate from Supabase)
3. Create SvelteKit routes and load functions
4. Build Svelte components with Skeleton UI
5. Add form validation with Zod
6. Implement Svelte transitions/animations
7. Add error handling and loading states
8. Test functionality across devices

### Code Standards
- **TypeScript:** Use strict mode, proper types for all functions
- **SvelteKit:** Follow file-based routing conventions (+page.svelte, +layout.svelte)
- **Components:** Use Skeleton UI components, customize with Tailwind
- **State:** Use Svelte stores for global state, reactive statements for local
- **Validation:** Zod schemas for all forms, validate client and server-side
- **Comments:** Document complex logic, availability calculations, timezone handling
- **Naming:** Use meaningful names, PascalCase for components, camelCase for functions

### Performance Optimization
- Use SvelteKit's static adapter for maximum performance
- Lazy load heavy components (calendar, charts)
- Optimize images (WebP format, proper sizing)
- Code split routes automatically via SvelteKit
- Minimize bundle size (avoid large dependencies)
- Use Svelte's built-in transitions (no external animation libraries)
- Target Lighthouse 100/100 scores

### Testing Approach
- Test each feature after implementation
- Verify RLS policies prevent cross-tenant data access
- Test with different user roles (owner, staff, customer)
- Test timezone conversions thoroughly
- Verify email delivery in SendGrid
- Test on mobile devices (responsive design)
- Test real-time updates with multiple browser windows

### Deployment
- Build for production: `pnpm build` (adapter-static output)
- Deploy to Azure Static Web Apps via GitHub Actions
- Deploy Azure Functions separately
- Use environment-specific .env files
- Never commit secrets to git (use .env.example template)
- Verify all environment variables in Azure portal
- Test production build locally before deploying

---

## 22. Critical Implementation Notes

### Security & Multi-tenancy
1. **Multi-tenancy is CRITICAL**: Every database query MUST filter by `organization_id`
2. **RLS Policies**: Test thoroughly to prevent data leakage between organizations
3. **Supabase Auth**: Use JWT tokens, validate on server-side for sensitive operations
4. **Row-Level Security**: Enable RLS on ALL tables, no exceptions
5. **Input Validation**: Validate all user inputs with Zod (XSS prevention)

### Timezone & Date Handling
6. **Timezone Handling**: Always store in UTC, convert to user/org timezone for display
7. **Date Libraries**: Use date-fns for all date operations
8. **Booking Times**: Validate that booking times don't conflict with existing bookings
9. **Time Zones**: Support multiple timezones (org timezone vs customer timezone)

### Real-time & Performance
10. **Real-time Updates**: Subscribe to Supabase Realtime channels for calendar updates
11. **Loading States**: Implement skeleton loaders for all data fetching
12. **Error Handling**: Wrap all async operations in try-catch, show user-friendly errors
13. **Optimistic UI**: Update UI immediately, rollback on error
14. **Performance**: Target <100KB initial bundle, <1s load time, 100 Lighthouse score

### Svelte-Specific
15. **Reactivity**: Use $: for reactive statements, stores for cross-component state
16. **Transitions**: Use Svelte's built-in transitions (fade, slide, fly)
17. **Accessibility**: Use semantic HTML, ARIA labels, keyboard navigation
18. **Forms**: Use native Svelte form binding, enhance with Zod validation
19. **Stores**: Create stores for auth, current org, bookings, toast notifications
20. **Components**: Keep components small and focused, reuse Skeleton UI components

---

---

## 23. Final Summary

### Project Scope
**Portfolio/Demo Project** - Multi-tenant booking scheduler built with modern web technologies

### Tech Stack
- **Frontend:** SvelteKit + Skeleton UI + Tailwind CSS
- **Backend:** Azure Functions (Consumption)
- **Database:** Supabase PostgreSQL (Free Tier)
- **Auth:** Supabase Auth
- **Email:** SendGrid (Free Tier)
- **Hosting:** Azure Static Web Apps (Free Tier)
- **Real-time:** Supabase Realtime

### Timeline & Cost
- **Development Time:** 3-4 weeks
- **Monthly Cost:** **$0** (all free tiers)
- **Estimated Bundle Size:** ~30-50KB initial JavaScript
- **Expected Lighthouse Score:** 95-100

### Key Features
✅ Multi-tenant architecture
✅ Complete booking flow (select service → staff → time → confirm)
✅ Real-time calendar updates
✅ Email confirmations
✅ Authentication & authorization
✅ Service & staff management
✅ Responsive UI with Skeleton components
✅ Basic analytics dashboard

### What Makes This Impressive
1. **Performance:** SvelteKit delivers 100/100 Lighthouse scores
2. **Architecture:** Proper multi-tenant design with RLS
3. **Modern Stack:** Shows knowledge beyond React ecosystem
4. **Real-time:** Live updates via Supabase Realtime
5. **Cost Efficient:** $0/month demonstrates optimization skills
6. **Professional UI:** Skeleton UI provides polished design
7. **Full Stack:** Frontend + Backend + Database + DevOps

### Portfolio Value
- Demonstrates modern framework expertise (Svelte)
- Shows Azure cloud knowledge
- Proves ability to build complex features (scheduling, multi-tenancy)
- Highlights performance optimization skills
- Perfect conversation starter in interviews

---

## End of PRD

**Ready for implementation!** 🚀
