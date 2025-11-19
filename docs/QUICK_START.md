# BookEase - Quick Start Guide
**Get Started in 30 Minutes**

This guide will help you set up your development environment and get the project running locally.

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js 20.x or higher** ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **A Supabase account** ([Sign up free](https://supabase.com/))
- **Code editor** (VS Code recommended)

---

## Step 1: Clone or Initialize Project (5 min)

```bash
# Navigate to project directory
cd C:\WebDev\Booking-Appointment-Scheduler

# Initialize SvelteKit project
npm create svelte@latest .
# Choose:
# - Skeleton project
# - Yes, using TypeScript syntax
# - Add ESLint for code linting
# - Add Prettier for code formatting
# - Add Vitest for unit testing

# Install dependencies
npm install
```

---

## Step 2: Install Core Dependencies (2 min)

```bash
# UI & Styling
npm install -D tailwindcss postcss autoprefixer
npm install -D @tailwindcss/forms @tailwindcss/typography
npm install @skeletonlabs/skeleton

# Supabase
npm install @supabase/supabase-js @supabase/ssr

# Utilities
npm install zod date-fns date-fns-tz

# Charts
npm install chart.js svelte-chartjs

# Stripe (for payments)
npm install @stripe/stripe-js

# Initialize Tailwind
npx tailwindcss init -p
```

---

## Step 3: Configure Tailwind & Skeleton UI (3 min)

### `tailwind.config.ts`
```typescript
import { skeleton } from '@skeletonlabs/skeleton/plugin'
import * as themes from '@skeletonlabs/skeleton/themes'
import type { Config } from 'tailwindcss'

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
      themes: [themes.cerberus]
    })
  ],
} satisfies Config
```

### `src/app.css`
```css
@import '@skeletonlabs/skeleton/themes/theme-cerberus.css';
@import '@skeletonlabs/skeleton/styles/core.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

### Update `src/routes/+layout.svelte`
```svelte
<script lang="ts">
  import '../app.css'
</script>

<div class="min-h-screen bg-surface-50 dark:bg-surface-900">
  <slot />
</div>
```

---

## Step 4: Create Supabase Project (5 min)

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in:
   - **Name:** bookease-dev
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to you
   - **Pricing Plan:** Free
4. Wait for project to be ready (~2 min)

### Get Your Credentials

From your Supabase project dashboard:
1. Go to **Settings** > **API**
2. Copy:
   - Project URL
   - `anon` public key
   - `service_role` secret key (for Edge Functions)

---

## Step 5: Environment Variables (2 min)

Create `.env` in project root:

```env
# Supabase (from Step 4)
PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Site Configuration
PUBLIC_SITE_URL=http://localhost:5173
PUBLIC_SITE_NAME=BookEase

# Stripe (Test Mode - get from https://dashboard.stripe.com/test/apikeys)
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

Create `.env.example` (for git):
```env
PUBLIC_SUPABASE_URL=your_supabase_url_here
PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
PUBLIC_SITE_URL=http://localhost:5173
PUBLIC_SITE_NAME=BookEase
PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
```

Add to `.gitignore`:
```
.env
.env.local
```

---

## Step 6: Setup Database Schema (5 min)

### Method 1: Supabase SQL Editor (Recommended for Quick Start)

1. Open your Supabase project
2. Go to **SQL Editor**
3. Click **New Query**
4. Copy the schema from `docs/optimized-architecture.md` (Database Schema section)
5. Run the query

### Method 2: Using Migrations (Better for Production)

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create migrations folder
mkdir -p supabase/migrations

# Create first migration
supabase migration new create_tables
```

Then add the schema SQL to the migration file and run:
```bash
supabase db push
```

---

## Step 7: Create Supabase Client (3 min)

### `src/lib/supabase/client.ts`
```typescript
import { createBrowserClient } from '@supabase/ssr'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export const supabase = createBrowserClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY
)
```

### `src/hooks.server.ts`
```typescript
import { createServerClient } from '@supabase/ssr'
import { type Handle } from '@sveltejs/kit'
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public'

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.supabase = createServerClient(
    PUBLIC_SUPABASE_URL,
    PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (key) => event.cookies.get(key),
        set: (key, value, options) => {
          event.cookies.set(key, value, { ...options, path: '/' })
        },
        remove: (key, options) => {
          event.cookies.delete(key, { ...options, path: '/' })
        },
      },
    }
  )

  event.locals.getSession = async () => {
    const {
      data: { session },
    } = await event.locals.supabase.auth.getSession()
    return session
  }

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === 'content-range'
    },
  })
}
```

### `src/app.d.ts`
```typescript
import { Session, SupabaseClient } from '@supabase/supabase-js'

declare global {
  namespace App {
    interface Locals {
      supabase: SupabaseClient
      getSession(): Promise<Session | null>
    }
    interface PageData {
      session: Session | null
    }
  }
}

export {}
```

---

## Step 8: Test Your Setup (2 min)

### Create a test page: `src/routes/+page.svelte`
```svelte
<script lang="ts">
  import { Button } from '@skeletonlabs/skeleton'
</script>

<div class="container mx-auto px-4 py-16">
  <div class="text-center">
    <h1 class="h1 mb-4">
      Welcome to <span class="text-gradient">BookEase</span>
    </h1>
    <p class="text-xl mb-8">
      Your appointment scheduling solution
    </p>
    <div class="flex gap-4 justify-center">
      <Button variant="filled-primary">Get Started</Button>
      <Button variant="ghost">Learn More</Button>
    </div>
  </div>
</div>

<style>
  .text-gradient {
    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
</style>
```

### Run the development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

**You should see:**
- Landing page with BookEase title
- Skeleton UI buttons
- Tailwind styling working

---

## Step 9: Verify Database Connection (2 min)

Create `src/routes/test-db/+page.ts`:

```typescript
import type { PageLoad } from './$types'

export const load: PageLoad = async ({ locals: { supabase } }) => {
  // Test query
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .limit(1)

  return {
    organizations: data || [],
    error: error?.message
  }
}
```

Create `src/routes/test-db/+page.svelte`:
```svelte
<script lang="ts">
  export let data
</script>

<div class="container mx-auto px-4 py-16">
  <h1 class="h1 mb-4">Database Test</h1>

  {#if data.error}
    <div class="card variant-soft-error p-4">
      Error: {data.error}
    </div>
  {:else}
    <div class="card variant-soft-success p-4">
      ✅ Database connected! Found {data.organizations.length} organizations.
    </div>
  {/if}
</div>
```

Visit [http://localhost:5173/test-db](http://localhost:5173/test-db)

**Expected:** "Database connected!" message

---

## Step 10: Project Structure Setup (1 min)

Create the following directories:

```bash
mkdir -p src/lib/components/ui
mkdir -p src/lib/components/booking
mkdir -p src/lib/components/calendar
mkdir -p src/lib/components/dashboard
mkdir -p src/lib/components/layout
mkdir -p src/lib/stores
mkdir -p src/lib/utils
mkdir -p src/lib/constants
mkdir -p src/types
```

---

## Next Steps

Congratulations! Your development environment is ready. 🎉

**What you've accomplished:**
- ✅ SvelteKit project initialized
- ✅ Tailwind + Skeleton UI configured
- ✅ Supabase project created
- ✅ Database schema deployed
- ✅ Supabase client configured
- ✅ Development server running
- ✅ Database connection verified

**Continue with:**
1. **Week 1, Day 5** - Build authentication pages (from implementation-roadmap.md)
2. Review `docs/optimized-architecture.md` for full technical spec
3. Follow `docs/implementation-roadmap.md` day-by-day

---

## Troubleshooting

### Port 5173 already in use
```bash
# Kill existing process or change port
npm run dev -- --port 5174
```

### Supabase connection error
- Check `.env` has correct URL and keys
- Verify Supabase project is running
- Check firewall/network settings

### Tailwind styles not loading
- Ensure `app.css` is imported in `+layout.svelte`
- Clear `.svelte-kit` cache: `rm -rf .svelte-kit`
- Restart dev server

### TypeScript errors
```bash
# Regenerate types from Supabase
npm run build
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev -- --open    # Start and open browser

# Build
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run check            # Type checking
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Testing
npm run test             # Run Vitest tests
npm run test:ui          # Run tests with UI
```

---

## Resources

- **SvelteKit Docs:** https://kit.svelte.dev/docs
- **Skeleton UI Docs:** https://skeleton.dev/docs
- **Supabase Docs:** https://supabase.com/docs
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Project Roadmap:** `docs/implementation-roadmap.md`
- **Architecture:** `docs/optimized-architecture.md`

---

## Need Help?

- Check `docs/` folder for detailed guides
- Review the original PRD: `docs/booking-scheduler-prd.md`
- Follow the day-by-day roadmap: `docs/implementation-roadmap.md`

**Happy coding! 🚀**
