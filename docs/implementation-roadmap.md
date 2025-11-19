# BookEase - Actionable Development Roadmap
**5-6 Week Implementation Plan**

---

## Week 1: Foundation & Infrastructure (Days 1-7)

### Day 1: Project Setup
```bash
# Initialize SvelteKit project
npm create svelte@latest bookease
cd bookease
npm install

# Install core dependencies
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography
npm install @skeletonlabs/skeleton
npm install @supabase/supabase-js
npm install zod date-fns
npm install @stripe/stripe-js

# Dev dependencies
npm install -D vitest @testing-library/svelte
npm install -D eslint prettier eslint-plugin-svelte
```

**Deliverables:**
- [ ] SvelteKit project initialized
- [ ] Dependencies installed
- [ ] Git repository setup
- [ ] `.env.example` created

---

### Day 2: Tailwind & Skeleton UI Configuration

**Files to create:**
```typescript
// tailwind.config.ts
import { skeleton } from '@skeletonlabs/skeleton/plugin'
import * as themes from '@skeletonlabs/skeleton/themes'

export default {
  darkMode: 'class',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@skeletonlabs/skeleton/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    extend: {},
  },
  plugins: [
    skeleton({
      themes: [themes.cerberus, themes.rose]
    })
  ],
}

// src/app.css
@import '@skeletonlabs/skeleton/themes/theme-cerberus.css';
@import '@skeletonlabs/skeleton/styles/core.css';
@tailwind base;
@tailwind components;
@tailwind utilities;
```

**Deliverables:**
- [ ] Tailwind configured
- [ ] Skeleton UI installed
- [ ] Theme customization
- [ ] Test styling works

---

### Day 3: Supabase Project Setup

**Steps:**
1. Create Supabase project at https://supabase.com
2. Save credentials to `.env`
3. Install Supabase CLI: `npm install -g supabase`
4. Initialize: `supabase init`

**Database Setup:**
```sql
-- Run in Supabase SQL Editor
-- Create all tables from optimized-architecture.md

-- migrations/001_create_tables.sql
CREATE TABLE organizations (...);
CREATE TABLE users (...);
CREATE TABLE services (...);
CREATE TABLE staff_members (...);
CREATE TABLE staff_services (...);
CREATE TABLE bookings (...);
```

**Deliverables:**
- [ ] Supabase project created
- [ ] Database schema deployed
- [ ] RLS policies enabled
- [ ] Test connection from SvelteKit

---

### Day 4: Supabase Client & Auth Setup

**Create Supabase clients:**

```typescript
// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'
import type { Database } from '$lib/types/database'

export const supabase = createClient<Database>(
  import.meta.env.PUBLIC_SUPABASE_URL,
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY
)

// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import type { Database } from '$lib/types/database'

export const createSupabaseServerClient = (event) => {
  return createServerClient<Database>(
    import.meta.env.PUBLIC_SUPABASE_URL,
    import.meta.env.PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => event.cookies.set(key, value, options),
        remove: (key, options) => event.cookies.delete(key, options),
      },
    }
  )
}
```

**Deliverables:**
- [ ] Client/Server Supabase utils
- [ ] Type definitions generated
- [ ] Auth helpers created

---

### Day 5: Authentication Pages

**Files to create:**

```
src/routes/(auth)/
├── +layout.svelte          # Auth layout (centered card)
├── login/+page.svelte      # Login form
├── signup/+page.svelte     # Signup form
└── reset-password/+page.svelte
```

**Login page example:**
```svelte
<!-- src/routes/(auth)/login/+page.svelte -->
<script lang="ts">
  import { supabase } from '$lib/supabase/client'
  import { goto } from '$app/navigation'
  import { Button } from '@skeletonlabs/skeleton'

  let email = ''
  let password = ''
  let loading = false

  async function handleLogin() {
    loading = true
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      alert(error.message)
    } else {
      goto('/dashboard')
    }
    loading = false
  }
</script>

<div class="card p-8 max-w-md mx-auto">
  <h1 class="h1 mb-4">Login</h1>
  <form on:submit|preventDefault={handleLogin}>
    <label class="label">
      <span>Email</span>
      <input
        class="input"
        type="email"
        bind:value={email}
        required
      />
    </label>

    <label class="label">
      <span>Password</span>
      <input
        class="input"
        type="password"
        bind:value={password}
        required
      />
    </label>

    <Button type="submit" class="w-full mt-4" disabled={loading}>
      {loading ? 'Logging in...' : 'Login'}
    </Button>
  </form>
</div>
```

**Deliverables:**
- [ ] Login page
- [ ] Signup page
- [ ] Password reset page
- [ ] Auth state management

---

### Day 6: Root Layout & Navigation

**Create:**
```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
  import '../app.css'
  import { supabase } from '$lib/supabase/client'
  import { onMount } from 'svelte'
  import { authStore } from '$lib/stores/auth'

  onMount(() => {
    // Listen to auth changes
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      authStore.set(session)
    })

    return () => data.subscription.unsubscribe()
  })
</script>

<div class="min-h-screen bg-surface-50 dark:bg-surface-900">
  <slot />
</div>

<!-- src/lib/stores/auth.ts -->
import { writable } from 'svelte/store'
import type { Session } from '@supabase/supabase-js'

export const authStore = writable<Session | null>(null)
```

**Deliverables:**
- [ ] Root layout
- [ ] Auth store
- [ ] Navigation component

---

### Day 7: Landing Page

**Create hero section:**
```svelte
<!-- src/routes/+page.svelte -->
<script lang="ts">
  import { Button } from '@skeletonlabs/skeleton'
</script>

<div class="container mx-auto px-4 py-16">
  <section class="text-center mb-16">
    <h1 class="h1 mb-4">
      BookEase
      <span class="text-gradient">Appointment Scheduling</span>
    </h1>
    <p class="text-xl mb-8">
      Simple, powerful booking for service businesses
    </p>
    <div class="flex gap-4 justify-center">
      <Button href="/signup" variant="filled">Get Started</Button>
      <Button href="/login" variant="ghost">Login</Button>
    </div>
  </section>

  <!-- Features section -->
  <section class="grid md:grid-cols-3 gap-8">
    <div class="card p-6 text-center">
      <h3 class="h3 mb-2">Real-Time Calendar</h3>
      <p>Live booking updates across all devices</p>
    </div>
    <div class="card p-6 text-center">
      <h3 class="h3 mb-2">Smart Scheduling</h3>
      <p>Automatic availability calculation</p>
    </div>
    <div class="card p-6 text-center">
      <h3 class="h3 mb-2">Payment Ready</h3>
      <p>Integrated Stripe payments</p>
    </div>
  </section>
</div>

<style>
  .text-gradient {
    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
</style>
```

**Deliverables:**
- [ ] Landing page design
- [ ] Feature highlights
- [ ] CTA buttons
- [ ] Responsive layout

---

## Week 2: Core Booking Flow (Days 8-14)

### Day 8: Public Booking Page Structure

**Create:**
```
src/routes/book/[slug]/
├── +page.svelte         # Main booking page
├── +page.ts             # Load organization data
└── +layout.svelte       # Booking layout
```

```typescript
// src/routes/book/[slug]/+page.ts
export async function load({ params, locals: { supabase } }) {
  const { slug } = params

  // Load organization
  const { data: organization } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (!organization) {
    throw error(404, 'Organization not found')
  }

  // Load services
  const { data: services } = await supabase
    .from('services')
    .select('*, staff_services(staff:staff_members(*, user:users(*)))')
    .eq('organization_id', organization.id)
    .eq('is_active', true)

  return { organization, services }
}
```

**Deliverables:**
- [ ] Dynamic route setup
- [ ] Organization loading
- [ ] Error handling

---

### Day 9: Service Selection Component

```svelte
<!-- src/lib/components/booking/ServiceSelector.svelte -->
<script lang="ts">
  import { Card } from '@skeletonlabs/skeleton'
  import type { Service } from '$lib/types/database'

  export let services: Service[]
  export let onSelect: (service: Service) => void

  let selected: Service | null = null

  function handleSelect(service: Service) {
    selected = service
    onSelect(service)
  }
</script>

<div class="grid md:grid-cols-2 gap-4">
  {#each services as service}
    <button
      class="card p-4 hover:variant-soft cursor-pointer text-left transition-all"
      class:variant-filled-primary={selected?.id === service.id}
      on:click={() => handleSelect(service)}
    >
      <div class="flex items-start gap-4">
        <div
          class="w-12 h-12 rounded-lg"
          style="background-color: {service.color}"
        />
        <div class="flex-1">
          <h3 class="h3">{service.name}</h3>
          <p class="text-sm opacity-75">{service.description}</p>
          <div class="flex items-center gap-4 mt-2">
            <span class="badge variant-soft">
              {service.duration_minutes} min
            </span>
            <span class="font-semibold">
              ${service.price} {service.currency}
            </span>
          </div>
        </div>
      </div>
    </button>
  {/each}
</div>
```

**Deliverables:**
- [ ] Service selection UI
- [ ] Service cards styled
- [ ] Selection state

---

### Day 10: Staff Selection Component

```svelte
<!-- src/lib/components/booking/StaffSelector.svelte -->
<script lang="ts">
  import { Avatar } from '@skeletonlabs/skeleton'
  import type { StaffMember } from '$lib/types/database'

  export let staff: StaffMember[]
  export let onSelect: (staff: StaffMember) => void

  let selected: StaffMember | null = null
</script>

<div class="grid md:grid-cols-3 gap-4">
  <button
    class="card p-6 text-center hover:variant-soft cursor-pointer"
    on:click={() => onSelect(null)}
  >
    <div class="mb-2">🎲</div>
    <h4 class="h4">Any Available</h4>
  </button>

  {#each staff as member}
    <button
      class="card p-6 text-center hover:variant-soft cursor-pointer"
      class:variant-filled-primary={selected?.id === member.id}
      on:click={() => {
        selected = member
        onSelect(member)
      }}
    >
      <Avatar
        src={member.user.avatar_url}
        initials={member.user.full_name}
        width="w-16"
        class="mx-auto mb-2"
      />
      <h4 class="h4">{member.user.full_name}</h4>
      <p class="text-sm opacity-75">{member.title}</p>
    </button>
  {/each}
</div>
```

**Deliverables:**
- [ ] Staff selection UI
- [ ] Avatar display
- [ ] "Any available" option

---

### Day 11: Calendar Component (Custom)

```svelte
<!-- src/lib/components/calendar/Calendar.svelte -->
<script lang="ts">
  import { startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths } from 'date-fns'

  export let selectedDate: Date = new Date()
  export let onDateSelect: (date: Date) => void

  let currentMonth = new Date()

  $: days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  function nextMonth() {
    currentMonth = addMonths(currentMonth, 1)
  }

  function prevMonth() {
    currentMonth = subMonths(currentMonth, 1)
  }
</script>

<div class="card p-4">
  <!-- Month navigation -->
  <div class="flex items-center justify-between mb-4">
    <button class="btn btn-sm" on:click={prevMonth}>←</button>
    <h3 class="h3">{format(currentMonth, 'MMMM yyyy')}</h3>
    <button class="btn btn-sm" on:click={nextMonth}>→</button>
  </div>

  <!-- Calendar grid -->
  <div class="grid grid-cols-7 gap-2">
    {#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as day}
      <div class="text-center font-semibold text-sm">{day}</div>
    {/each}

    {#each days as day}
      <button
        class="aspect-square btn btn-sm"
        class:variant-filled-primary={format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')}
        on:click={() => onDateSelect(day)}
      >
        {format(day, 'd')}
      </button>
    {/each}
  </div>
</div>
```

**Deliverables:**
- [ ] Month view calendar
- [ ] Date selection
- [ ] Month navigation

---

### Day 12: Time Slot Picker

```svelte
<!-- src/lib/components/booking/TimeSlotPicker.svelte -->
<script lang="ts">
  import { getAvailableSlots } from '$lib/utils/availability'
  import type { Service, StaffMember } from '$lib/types/database'

  export let service: Service
  export let staff: StaffMember
  export let date: Date
  export let onSelect: (time: string) => void

  let slots: string[] = []
  let loading = true
  let selected: string | null = null

  $: loadSlots(staff, service, date)

  async function loadSlots(staff, service, date) {
    loading = true
    slots = await getAvailableSlots(staff.id, service.id, date)
    loading = false
  }
</script>

<div class="card p-4">
  <h3 class="h3 mb-4">Available Times</h3>

  {#if loading}
    <div class="placeholder animate-pulse h-32" />
  {:else if slots.length === 0}
    <p class="text-center opacity-75">No available slots</p>
  {:else}
    <div class="grid grid-cols-3 gap-2">
      {#each slots as time}
        <button
          class="btn btn-sm"
          class:variant-filled-primary={selected === time}
          on:click={() => {
            selected = time
            onSelect(time)
          }}
        >
          {time}
        </button>
      {/each}
    </div>
  {/if}
</div>
```

**Deliverables:**
- [ ] Time slot display
- [ ] Loading states
- [ ] Empty states

---

### Day 13: Booking Form

```svelte
<!-- src/lib/components/booking/BookingForm.svelte -->
<script lang="ts">
  import { z } from 'zod'
  import { supabase } from '$lib/supabase/client'

  export let service: Service
  export let staff: StaffMember
  export let date: Date
  export let time: string

  const schema = z.object({
    name: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    notes: z.string().optional(),
  })

  let formData = {
    name: '',
    email: '',
    phone: '',
    notes: '',
  }

  let loading = false
  let errors: Record<string, string> = {}

  async function handleSubmit() {
    // Validate
    try {
      schema.parse(formData)
      errors = {}
    } catch (err) {
      errors = err.formErrors.fieldErrors
      return
    }

    loading = true

    // Create booking
    const { data, error } = await supabase
      .from('bookings')
      .insert({
        organization_id: service.organization_id,
        service_id: service.id,
        staff_id: staff.id,
        booking_date: date,
        start_time: time,
        end_time: calculateEndTime(time, service.duration_minutes),
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        notes: formData.notes,
        price: service.price,
        status: 'pending',
      })
      .select()
      .single()

    if (error) {
      alert(error.message)
    } else {
      // Send confirmation email
      await fetch('/api/send-confirmation', {
        method: 'POST',
        body: JSON.stringify({ bookingId: data.id }),
      })

      goto(`/book/${slug}/success?booking=${data.id}`)
    }

    loading = false
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="card p-6">
  <h3 class="h3 mb-4">Your Information</h3>

  <label class="label">
    <span>Name *</span>
    <input
      class="input"
      type="text"
      bind:value={formData.name}
      required
    />
    {#if errors.name}
      <span class="text-error-500">{errors.name}</span>
    {/if}
  </label>

  <label class="label">
    <span>Email *</span>
    <input
      class="input"
      type="email"
      bind:value={formData.email}
      required
    />
    {#if errors.email}
      <span class="text-error-500">{errors.email}</span>
    {/if}
  </label>

  <label class="label">
    <span>Phone</span>
    <input
      class="input"
      type="tel"
      bind:value={formData.phone}
    />
  </label>

  <label class="label">
    <span>Notes</span>
    <textarea
      class="textarea"
      bind:value={formData.notes}
      rows="3"
    />
  </label>

  <button
    type="submit"
    class="btn variant-filled-primary w-full mt-4"
    disabled={loading}
  >
    {loading ? 'Booking...' : `Book for $${service.price}`}
  </button>
</form>
```

**Deliverables:**
- [ ] Booking form
- [ ] Zod validation
- [ ] Error handling

---

### Day 14: Booking Confirmation Page

```svelte
<!-- src/routes/book/[slug]/success/+page.svelte -->
<script lang="ts">
  export let data

  const { booking } = data
</script>

<div class="container mx-auto px-4 py-16 max-w-2xl">
  <div class="card p-8 text-center">
    <div class="text-6xl mb-4">✅</div>
    <h1 class="h1 mb-2">Booking Confirmed!</h1>
    <p class="mb-8">
      We've sent a confirmation email to {booking.customer_email}
    </p>

    <div class="card variant-soft p-6 text-left mb-8">
      <h2 class="h2 mb-4">Booking Details</h2>
      <dl class="grid grid-cols-2 gap-4">
        <dt class="font-semibold">Service:</dt>
        <dd>{booking.service.name}</dd>

        <dt class="font-semibold">Staff:</dt>
        <dd>{booking.staff.user.full_name}</dd>

        <dt class="font-semibold">Date:</dt>
        <dd>{format(new Date(booking.booking_date), 'PPP')}</dd>

        <dt class="font-semibold">Time:</dt>
        <dd>{booking.start_time}</dd>

        <dt class="font-semibold">Price:</dt>
        <dd>${booking.price}</dd>
      </dl>
    </div>

    <a href="/" class="btn variant-ghost">Back to Home</a>
  </div>
</div>
```

**Deliverables:**
- [ ] Success page
- [ ] Booking summary
- [ ] Email confirmation

---

## Week 3: Backend & Real-Time (Days 15-21)

### Day 15: Supabase Edge Functions Setup

**Initialize Edge Functions:**
```bash
cd supabase
supabase functions new send-booking-confirmation
supabase functions new process-payment
supabase functions new send-booking-reminders
```

**Deliverables:**
- [ ] Edge Functions initialized
- [ ] Local testing setup
- [ ] Environment variables

---

### Day 16: Email Confirmation Function

**Implement from `optimized-architecture.md`:**
- [ ] Resend API integration
- [ ] Email template HTML
- [ ] Function deployment
- [ ] Test with real booking

---

### Day 17: Payment Processing Function

**Stripe Integration:**
```typescript
// Implement Stripe payment intent creation
// Handle payment webhooks
// Update booking payment status
```

**Deliverables:**
- [ ] Stripe test keys configured
- [ ] Payment intent creation
- [ ] Webhook handler
- [ ] Test payment flow

---

### Day 18: Real-Time Subscriptions

**Implement real-time updates:**
```typescript
// src/lib/stores/bookings.ts
// Setup Supabase Realtime channels
// Handle INSERT/UPDATE/DELETE events
// Update UI automatically
```

**Deliverables:**
- [ ] Realtime channel setup
- [ ] Booking updates listener
- [ ] UI auto-refresh
- [ ] Test with 2 browsers

---

### Day 19: Availability Calculation Logic

```typescript
// src/lib/utils/availability.ts
export async function getAvailableSlots(
  staffId: string,
  serviceId: string,
  date: Date,
  timezone: string
): Promise<string[]> {
  // 1. Get service details
  const service = await getService(serviceId)

  // 2. Get staff working hours
  const staff = await getStaff(staffId)
  const workingHours = getWorkingHoursForDate(staff.working_hours, date)

  // 3. Check exceptions
  const exceptions = staff.working_hours.exceptions?.[format(date, 'yyyy-MM-dd')]
  if (exceptions && !exceptions.available) return []

  // 4. Get existing bookings
  const bookings = await getExistingBookings(staffId, date)

  // 5. Generate possible slots
  const slots = generateTimeSlots(
    workingHours.start,
    workingHours.end,
    service.duration_minutes
  )

  // 6. Filter available slots
  return slots.filter(slot => !hasConflict(slot, bookings, service.duration_minutes))
}
```

**Deliverables:**
- [ ] Availability algorithm
- [ ] Working hours parsing
- [ ] Conflict detection
- [ ] Test edge cases

---

### Day 20: Timezone Handling

```typescript
// src/lib/utils/timezone.ts
import { formatInTimeZone, utcToZonedTime, zonedTimeToUtc } from 'date-fns-tz'

export function convertToOrgTimezone(date: Date, timezone: string): Date {
  return utcToZonedTime(date, timezone)
}

export function convertToUTC(date: Date, timezone: string): Date {
  return zonedTimeToUtc(date, timezone)
}
```

**Deliverables:**
- [ ] Timezone conversion utils
- [ ] Display in local time
- [ ] Store in UTC
- [ ] Test multiple timezones

---

### Day 21: Cron Job for Reminders

**Setup:**
```sql
-- In Supabase dashboard > Database > Cron Jobs
SELECT cron.schedule(
  'send-booking-reminders',
  '0 9 * * *',  -- 9 AM daily
  $$
  SELECT net.http_post(
    url:='https://xxx.supabase.co/functions/v1/send-booking-reminders',
    headers:='{"Authorization": "Bearer xxx"}'::jsonb
  );
  $$
);
```

**Deliverables:**
- [ ] Cron job configured
- [ ] Reminder function
- [ ] Test manually
- [ ] Verify in production

---

## Week 4: Dashboard & Management (Days 22-28)

### Day 22: Dashboard Layout

```svelte
<!-- src/routes/(dashboard)/+layout.svelte -->
<script lang="ts">
  import Sidebar from '$lib/components/layout/Sidebar.svelte'
  import Navbar from '$lib/components/layout/Navbar.svelte'
</script>

<div class="flex h-screen">
  <Sidebar />
  <div class="flex-1 flex flex-col">
    <Navbar />
    <main class="flex-1 overflow-auto p-6 bg-surface-50 dark:bg-surface-900">
      <slot />
    </main>
  </div>
</div>
```

**Deliverables:**
- [ ] Dashboard layout
- [ ] Sidebar navigation
- [ ] Top navbar
- [ ] Auth guard

---

### Day 23: Analytics Dashboard

**Create stats cards:**
```svelte
<!-- src/routes/(dashboard)/dashboard/+page.svelte -->
<script lang="ts">
  export let data
  const { stats } = data
</script>

<div class="grid md:grid-cols-4 gap-6 mb-8">
  <div class="card p-6">
    <h3 class="text-sm opacity-75 mb-2">Today's Bookings</h3>
    <p class="text-3xl font-bold">{stats.todayBookings}</p>
  </div>

  <div class="card p-6">
    <h3 class="text-sm opacity-75 mb-2">This Week</h3>
    <p class="text-3xl font-bold">{stats.weekBookings}</p>
  </div>

  <div class="card p-6">
    <h3 class="text-sm opacity-75 mb-2">Revenue (Month)</h3>
    <p class="text-3xl font-bold">${stats.monthRevenue}</p>
  </div>

  <div class="card p-6">
    <h3 class="text-sm opacity-75 mb-2">Total Customers</h3>
    <p class="text-3xl font-bold">{stats.totalCustomers}</p>
  </div>
</div>

<!-- Charts -->
<div class="grid md:grid-cols-2 gap-6">
  <div class="card p-6">
    <h2 class="h2 mb-4">Bookings Trend</h2>
    <BookingsChart data={stats.bookingsTrend} />
  </div>

  <div class="card p-6">
    <h2 class="h2 mb-4">Popular Services</h2>
    <ServicesChart data={stats.popularServices} />
  </div>
</div>
```

**Deliverables:**
- [ ] Stats cards
- [ ] Chart.js integration
- [ ] Data queries
- [ ] Real-time updates

---

### Day 24: Service Management (CRUD)

**Create service pages:**
```
src/routes/(dashboard)/services/
├── +page.svelte           # List services
├── +page.ts              # Load services
├── new/+page.svelte      # Create service
└── [id]/edit/+page.svelte # Edit service
```

**Deliverables:**
- [ ] Service list table
- [ ] Create service form
- [ ] Edit service form
- [ ] Delete confirmation

---

### Day 25: Staff Management (CRUD)

**Similar structure to services:**
```
src/routes/(dashboard)/staff/
├── +page.svelte
├── new/+page.svelte
└── [id]/edit/+page.svelte
```

**Deliverables:**
- [ ] Staff list
- [ ] Add staff form
- [ ] Working hours editor
- [ ] Service assignment

---

### Day 26: Booking Management

```svelte
<!-- src/routes/(dashboard)/bookings/+page.svelte -->
<script lang="ts">
  import { DataTable } from '@skeletonlabs/skeleton'
  import type { Booking } from '$lib/types/database'

  export let data
  const { bookings } = data

  const tableHeaders = ['Customer', 'Service', 'Staff', 'Date', 'Time', 'Status', 'Actions']

  async function updateStatus(bookingId: string, status: string) {
    await supabase
      .from('bookings')
      .update({ status })
      .eq('id', bookingId)
  }
</script>

<div class="card">
  <header class="card-header flex justify-between items-center">
    <h2 class="h2">Bookings</h2>
    <div class="input-group w-64">
      <input type="search" placeholder="Search..." />
    </div>
  </header>

  <div class="p-4">
    <DataTable
      source={bookings}
      headers={tableHeaders}
    />
  </div>
</div>
```

**Deliverables:**
- [ ] Bookings table
- [ ] Status updates
- [ ] Filters (date, status)
- [ ] Search

---

### Day 27: Calendar View

```svelte
<!-- src/routes/(dashboard)/calendar/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte'
  import { subscribeToBookings } from '$lib/stores/bookings'

  export let data
  let bookings = data.bookings

  onMount(() => {
    const unsubscribe = subscribeToBookings(data.organizationId)
    return unsubscribe
  })
</script>

<div class="card p-6">
  <Calendar bookings={bookings} />
</div>
```

**Deliverables:**
- [ ] Week view calendar
- [ ] Booking display
- [ ] Real-time sync
- [ ] Click to view details

---

### Day 28: Settings Page

**Organization settings:**
```svelte
<!-- src/routes/(dashboard)/settings/+page.svelte -->
<script lang="ts">
  import { TabGroup, Tab } from '@skeletonlabs/skeleton'

  let tabSet = 0
</script>

<div class="card">
  <TabGroup>
    <Tab bind:group={tabSet} name="general" value={0}>General</Tab>
    <Tab bind:group={tabSet} name="hours" value={1}>Business Hours</Tab>
    <Tab bind:group={tabSet} name="payment" value={2}>Payment</Tab>
  </TabGroup>

  {#if tabSet === 0}
    <!-- General settings form -->
  {:else if tabSet === 1}
    <!-- Business hours editor -->
  {:else}
    <!-- Stripe connection -->
  {/if}
</div>
```

**Deliverables:**
- [ ] General settings
- [ ] Business hours
- [ ] Stripe connection
- [ ] Save functionality

---

## Week 5: Polish & Testing (Days 29-35)

### Day 29: Responsive Design Audit

**Test on:**
- [ ] Mobile (375px)
- [ ] Tablet (768px)
- [ ] Desktop (1024px+)

**Fix:**
- [ ] Navigation on mobile
- [ ] Forms on small screens
- [ ] Tables overflow
- [ ] Calendar on mobile

---

### Day 30: Svelte Transitions

**Add animations:**
```svelte
<script>
  import { fade, slide, fly } from 'svelte/transition'
</script>

<div in:fade>
  <!-- Content -->
</div>

<div in:fly={{ y: 20, duration: 300 }}>
  <!-- Card -->
</div>
```

**Deliverables:**
- [ ] Page transitions
- [ ] Modal animations
- [ ] Toast notifications
- [ ] Loading spinners

---

### Day 31: Error Handling & Loading States

**Implement:**
- [ ] Global error boundary
- [ ] 404 page
- [ ] Loading skeletons
- [ ] Toast notifications
- [ ] Form validation errors

---

### Day 32: Performance Optimization

**Optimize:**
```bash
# Build and analyze
npm run build
```

**Tasks:**
- [ ] Code splitting (automatic)
- [ ] Lazy load charts
- [ ] Image optimization
- [ ] Remove unused CSS
- [ ] Minification check

**Run Lighthouse:**
- [ ] Performance > 95
- [ ] Accessibility > 95
- [ ] Best Practices > 95
- [ ] SEO > 95

---

### Day 33: SEO Optimization

```svelte
<!-- Add to pages -->
<svelte:head>
  <title>BookEase - Appointment Scheduling</title>
  <meta name="description" content="..." />
  <meta property="og:title" content="..." />
  <meta property="og:description" content="..." />
  <meta property="og:image" content="..." />
</svelte:head>
```

**Deliverables:**
- [ ] Meta tags
- [ ] Open Graph
- [ ] Sitemap
- [ ] robots.txt

---

### Day 34: Testing

**Write tests:**
```typescript
// src/lib/utils/availability.test.ts
import { describe, it, expect } from 'vitest'
import { getAvailableSlots } from './availability'

describe('Availability Calculator', () => {
  it('should return empty slots for day off', async () => {
    // Test implementation
  })

  it('should exclude booked slots', async () => {
    // Test implementation
  })
})
```

**Deliverables:**
- [ ] Unit tests (utils)
- [ ] Component tests
- [ ] Integration tests
- [ ] E2E test (booking flow)

---

### Day 35: Documentation

**Create:**
```markdown
# README.md
- Project overview
- Features
- Tech stack
- Setup instructions
- Environment variables
- Deployment guide
- Screenshots
```

**Deliverables:**
- [ ] README.md
- [ ] CONTRIBUTING.md
- [ ] API documentation
- [ ] Architecture diagram
- [ ] Demo credentials

---

## Week 6: Deployment & Demo (Days 36-42)

### Day 36: Azure Static Web Apps Setup

**Configure:**
```bash
# Install Azure CLI
az login

# Create resource
az staticwebapp create \
  --name bookease \
  --resource-group my-rg \
  --source https://github.com/username/bookease \
  --location "West US 2" \
  --branch main \
  --app-location "/" \
  --output-location "build"
```

**Deliverables:**
- [ ] Azure Static Web App created
- [ ] GitHub Actions workflow
- [ ] Custom domain (optional)
- [ ] Environment variables set

---

### Day 37: Supabase Production

**Setup:**
- [ ] Create production project
- [ ] Run migrations
- [ ] Enable RLS
- [ ] Deploy Edge Functions
- [ ] Configure secrets
- [ ] Test database connection

---

### Day 38: Environment Configuration

**Production `.env`:**
```env
PUBLIC_SUPABASE_URL=https://prod.supabase.co
PUBLIC_SUPABASE_ANON_KEY=prod_key
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
PUBLIC_SITE_URL=https://bookease.azurestaticapps.net
```

**Azure Static Web Apps Configuration:**
- [ ] Add environment variables
- [ ] Configure build settings
- [ ] Test deployment

---

### Day 39: Seed Demo Data

```sql
-- Insert demo organizations
INSERT INTO organizations (slug, name, email, timezone) VALUES
  ('serenity-spa', 'Serenity Spa', 'info@serenityspa.com', 'America/New_York'),
  ('healthfirst-clinic', 'HealthFirst Clinic', 'contact@healthfirst.com', 'America/Los_Angeles');

-- Insert demo services
-- Insert demo staff
-- Insert sample bookings
```

**Deliverables:**
- [ ] 3 demo organizations
- [ ] 10+ services
- [ ] 5+ staff members
- [ ] 20+ sample bookings

---

### Day 40: Testing in Production

**Test all flows:**
- [ ] Signup/Login
- [ ] Public booking
- [ ] Email delivery
- [ ] Payment (test mode)
- [ ] Real-time updates
- [ ] Dashboard analytics
- [ ] CRUD operations

---

### Day 41: Performance Monitoring

**Setup:**
- [ ] Azure Application Insights
- [ ] Supabase dashboard
- [ ] Error tracking
- [ ] Analytics

**Verify:**
- [ ] Page load times
- [ ] API response times
- [ ] Error rates
- [ ] Resource usage

---

### Day 42: Final Polish & Demo Video

**Create demo video:**
1. Landing page overview
2. Public booking flow
3. Dashboard tour
4. Real-time updates demo
5. Analytics showcase

**Deliverables:**
- [ ] Screen recording
- [ ] Demo script
- [ ] LinkedIn post
- [ ] Portfolio update

---

## Daily Checklist Template

```markdown
### Day X: [Task Name]

**Morning (2-3 hours):**
- [ ] Review task requirements
- [ ] Setup/research
- [ ] Start implementation

**Afternoon (3-4 hours):**
- [ ] Continue implementation
- [ ] Test functionality
- [ ] Fix issues

**Evening (1-2 hours):**
- [ ] Polish & refactor
- [ ] Documentation
- [ ] Commit & push

**Deliverables:**
- [ ] Feature X complete
- [ ] Tests passing
- [ ] Documentation updated
```

---

## Key Success Metrics

By end of 6 weeks, you should have:

**Technical:**
- ✅ Lighthouse score 95+ (all categories)
- ✅ Bundle size < 100KB
- ✅ Page load < 1s
- ✅ Zero console errors
- ✅ Mobile responsive

**Features:**
- ✅ Complete booking flow
- ✅ Real-time calendar
- ✅ Email notifications
- ✅ Payment integration (demo)
- ✅ Analytics dashboard
- ✅ CRUD operations
- ✅ Multi-tenant architecture

**Portfolio:**
- ✅ Live demo URL
- ✅ Demo video
- ✅ GitHub repository
- ✅ Comprehensive README
- ✅ Professional UI/UX

---

## Cost Verification

**Monthly costs should remain $0:**
- Azure Static Web Apps: Free tier ✅
- Supabase: Free tier ✅
- Resend: Free tier (3K emails) ✅
- Stripe: Test mode ✅

**Monitor:**
- Bandwidth usage
- Database size
- Function invocations
- Email sends

---

## Next Actions

1. **Start Day 1** - Initialize project
2. **Setup tracking** - Use GitHub Projects or Trello
3. **Daily commits** - Commit progress daily
4. **Document learnings** - Keep notes of challenges/solutions
5. **Ask for help** - When stuck > 30 min

**Ready to build! 🚀**
