# BookEase - Multi-Tenant Booking & Appointment Scheduler

A production-ready, zero-cost booking and appointment scheduling platform built with modern web technologies.

## 🎯 Project Overview

**BookEase** is a full-featured multi-tenant appointment scheduling system designed as a portfolio showcase project. It demonstrates enterprise-grade architecture, modern development practices, and zero operational costs.

### Key Features

- ✅ **Real-time Calendar Updates** - Live booking synchronization via WebSocket
- ✅ **Payment Integration** - Stripe payment processing (test mode)
- ✅ **Analytics Dashboard** - Revenue tracking and booking analytics
- ✅ **Multi-tenant Architecture** - Organization-based data isolation with RLS
- ✅ **Email Notifications** - Automated booking confirmations and reminders
- ✅ **Mobile Responsive** - Works flawlessly on all devices

## 🚀 Tech Stack

### Frontend
- **SvelteKit 2.x** - Modern meta-framework with SSG/SSR
- **Skeleton UI** - Tailwind-based Svelte component library
- **TailwindCSS v3** - Utility-first CSS framework
- **TypeScript** - Type-safe development
- **Chart.js** - Data visualization

### Backend
- **Supabase PostgreSQL** - Database with Row-Level Security
- **Supabase Auth** - JWT-based authentication
- **Supabase Realtime** - WebSocket subscriptions
- **Supabase Edge Functions** - Serverless functions (Deno)
- **Supabase Storage** - File storage (logos, avatars)

### External Services
- **Resend** - Email delivery (3K emails/month free)
- **Stripe** - Payment processing (test mode)
- **Azure Static Web Apps** - Hosting and CDN

## 💰 Cost Breakdown

| Service | Free Tier | Expected Usage | Cost |
|---------|-----------|----------------|------|
| Azure Static Web Apps | 100 GB bandwidth | 5-10 GB | **$0** |
| Supabase | 500 MB DB + 2 GB bandwidth | 50 MB + 500 MB | **$0** |
| Supabase Edge Functions | 500K invocations | 5-10K | **$0** |
| Resend | 3,000 emails/month | 100-200 | **$0** |
| Stripe | Test mode | Unlimited | **$0** |

**Total Monthly Cost: $0**

## 📚 Documentation

- **[Executive Summary](docs/EXECUTIVE_SUMMARY.md)** - Strategic overview and architecture decisions
- **[Quick Start Guide](docs/QUICK_START.md)** - Get running in 30 minutes
- **[Optimized Architecture](docs/optimized-architecture.md)** - Complete technical specification
- **[Implementation Roadmap](docs/implementation-roadmap.md)** - 42-day development plan
- **[Original PRD](docs/booking-scheduler-prd.md)** - Initial requirements document

## 🏃 Quick Start

### Prerequisites

- Node.js 20.x or higher
- Git
- Supabase account (free)

### Setup (30 minutes)

1. **Clone the repository**
   ```bash
   git clone https://github.com/My2ndLovE/Booking-Appointment-Scheduler.git
   cd Booking-Appointment-Scheduler
   ```

2. **Follow the Quick Start Guide**
   ```bash
   # Read the detailed setup instructions
   cat docs/QUICK_START.md
   ```

3. **Install dependencies** (when ready to start development)
   ```bash
   npm install
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

## 📋 Implementation Status

This project is currently in the **planning phase**. Follow the [Implementation Roadmap](docs/implementation-roadmap.md) for the 6-week development plan.

### Timeline

- **Week 1-2:** Foundation & Core Booking Flow
- **Week 3-4:** Backend & Dashboard
- **Week 5:** Polish & Testing
- **Week 6:** Deployment & Demo

## 🎨 Features Showcase

### For Business Owners
- Customizable booking pages
- Real-time calendar management
- Analytics and reporting
- Staff and service management
- Email automation

### For Customers
- Easy online booking
- Service browsing
- Staff selection
- Instant confirmation
- Payment processing

### For Developers
- Multi-tenant architecture
- Row-Level Security (RLS)
- Real-time WebSocket updates
- Serverless Edge Functions
- Type-safe development
- Comprehensive testing

## 🔒 Security

- JWT-based authentication
- Row-Level Security (RLS) policies
- Input validation with Zod
- XSS/SQL injection prevention
- HTTPS-only in production
- Environment variable protection

## 📈 Performance Targets

- **Lighthouse Score:** 95+ (all categories)
- **Initial Bundle:** < 100KB JavaScript
- **Page Load:** < 1 second
- **Time to Interactive:** < 2 seconds
- **First Contentful Paint:** < 0.8 seconds

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run tests with UI
npm run test:ui

# Type checking
npm run check

# Linting
npm run lint

# Format code
npm run format
```

## 🚢 Deployment

### Azure Static Web Apps

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

Deployment is automated via GitHub Actions when pushing to the `main` branch.

## 📝 License

This project is created as a portfolio showcase. Feel free to use it as a reference for your own projects.

## 🤝 Contributing

This is a personal portfolio project, but suggestions and feedback are welcome! Feel free to open an issue or submit a pull request.

## 📧 Contact

- **GitHub:** [@My2ndLovE](https://github.com/My2ndLovE)
- **Project Link:** [https://github.com/My2ndLovE/Booking-Appointment-Scheduler](https://github.com/My2ndLovE/Booking-Appointment-Scheduler)

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) - Amazing meta-framework
- [Skeleton UI](https://skeleton.dev/) - Beautiful component library
- [Supabase](https://supabase.com/) - Incredible backend platform
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework

---

**Built with ❤️ using modern web technologies**

**Status:** 📋 Planning Phase | **Timeline:** 6 weeks | **Cost:** $0/month
