# FITZONE – COMPLETE LUXURY GYM MANAGEMENT SYSTEM & MEMBER PORTAL

[![Built with HTML5, CSS3 & Vanilla JavaScript](https://img.shields.io/badge/Stack-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20ES6+-ff5e14.svg)](https://developer.mozilla.org/)
[![Database-LocalStorage Persistence](https://img.shields.io/badge/Persistence-LocalStorage%20Reactive%20Engine-10b981.svg)](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
[![UI Theme-Electric Orange & Charcoal Dark](https://img.shields.io/badge/Theme-Dark%20Charcoal%20%26%20Electric%20Orange-ff5e14.svg)](#)

**FITZONE** is a modern, fully-featured, commercial-grade Gym Management System and Member Portal built for high-performance fitness clubs and athletic facilities. It delivers two seamlessly interconnected experiences sharing a unified real-time `LocalStorage` data architecture:

1. **Enterprise Admin Dashboard**: Full SaaS operations suite for front-desk staff, coaches, and gym owners.
2. **Client-Facing Website & Member Portal**: Energetic, luxury public brand showcase and member self-service portal.

---

## 🚀 Quick Start Instructions

No build step, compilers, or framework installations required. **FITZONE runs natively in any modern web browser.**

### Method 1: Direct File Launch
Simply double-click [`index.html`](file:///c:/Users/HP/OneDrive/Desktop/FITZONE/index.html) or [`login.html`](file:///c:/Users/HP/OneDrive/Desktop/FITZONE/login.html) to run the application immediately in your default browser.

### Method 2: Local HTTP Server (Recommended)
Run any lightweight static HTTP server from the project directory:

```bash
# Using Python:
python -m http.server 8000

# Using Node (npx):
npx serve .

# Using PHP:
php -S localhost:8000
```
Then navigate to: `http://localhost:8000`

---

## 🔑 Demo Access Credentials

The application includes one-click instant demo login buttons on [`login.html`](file:///c:/Users/HP/OneDrive/Desktop/FITZONE/login.html), or you may manually input the following credentials:

| Role | Email Address | Password | Assigned View & Portal |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@fitzone.com` | `admin123` | Complete Operations Control Center (`/admin/dashboard.html`) |
| **Gym Member** | `member@fitzone.com` | `member123` | Personal Member Portal & Digital Pass (`/client/my-dashboard.html`) |
| **New Member** | Register at `register.html` | Custom (min 6 chars) | Automatically assigned a digital member ID (`FZ-1021+`) |

---

## 📁 Project File Architecture

```text
FITZONE/
├── index.html                   # Public Client Home Landing Experience
├── login.html                   # Role-based Simulated Authentication with 1-Click Demo Logins
├── register.html                # New Member Registration (generates Member ID & profile in DB)
├── README.md                    # System Documentation & Run Guide
│
├── admin/                       # ENTERPRISE ADMIN OPERATIONS SUITE
│   ├── dashboard.html           # 8 Real-Time Calculated KPIs, 4 Dynamic Chart.js Visualizations
│   ├── members.html             # Complete Members CRUD, Search, Filter, Profile Drawer, Renewal
│   ├── memberships.html         # Subscription Tier Matrix, Pricing, Durations, Expiration Tracker
│   ├── attendance.html          # Front Desk Turnstile, Duplicate Prevention, QR Scanner Modal
│   ├── trainers.html            # Master Coaches Roster, Athlete Allocation, Shift Schedules
│   ├── workouts.html            # Workout Routines Builder, Exercise Database, Member Assignment
│   ├── payments.html            # Billing Invoices, Auto-Renewal Sync, Printable Tax Receipts
│   ├── classes.html             # Group Fitness Classes, Seat Capacities, Live Attendee Rosters
│   ├── equipment.html           # 3,000 m² Equipment Inventory, Maintenance Logs & Condition Audits
│   ├── notifications.html       # Centralized In-App Alert Center (Expirations, Bookings, Repairs)
│   ├── reports.html             # Executive Financial Audits, Occupancy Rates & Printable Summaries
│   └── settings.html            # Facility Info, Operating Hours, EGP Currency, Demo Data Reset
│
├── client/                      # PUBLIC PORTAL & ATHLETE SELF-SERVICE
│   ├── home.html                # Client Entry Portal (redirects to canonical index.html)
│   ├── plans.html               # Dynamic Pricing Cards, Feature Inclusions & Subscription Checkout
│   ├── classes.html             # Weekly Group Fitness Timetable with 1-Click Seat Reservation
│   ├── trainers.html            # Master Coaches Showcase, Biographies & Private PT Booking
│   ├── about.html               # Facility Architecture, Recovery Cryo Lounge & Gym Philosophy
│   ├── contact.html             # Inquiries Form (auto-notifies admin), Phone, Cairo Address
│   ├── profile.html             # Member Personal Data Settings & Password Change
│   └── my-dashboard.html        # Athlete Portal with Holographic Pass, QR Pass, Progress Tracker
│
├── css/                         # DESIGN SYSTEM & STYLESHEETS
│   ├── style.css                # CSS Variables, Reset, Typography, Modals, Badges, Toast System
│   ├── admin.css                # Dark Charcoal Admin Shell, Sidebar, Topbar, KPI Stat Cards
│   ├── client.css               # Motivational Glassmorphism, Digital Card, Hero Sections
│   └── responsive.css           # Mobile Drawers, Tablet Breakpoints & Print (@media print) Rules
│
└── js/                          # MODULAR REACTIVE JAVASCRIPT ENGINES
    ├── storage.js               # Reactive LocalStorage Engine, 20 Members, 5 Coaches, 4 Plans
    ├── auth.js                  # Session Management, Role Guards, Quick Login & Registration
    ├── app.js                   # Universal Toast System, Modal Helpers, Currency (EGP) Formatters
    ├── admin.js                 # Admin Master Shell, Notification Popovers, Global Search
    ├── members.js               # Member CRUD Controller, Multi-Criteria Search, History Tabs
    ├── attendance.js            # Check-In/Out Engine, Duplicate Block, QR Scanner Simulation
    ├── payments.js              # Billing Controller, Auto-Renewal Sync, Official Tax Receipts
    ├── workouts.js              # Routine Builder, Exercise Rows, Plan Assignment Engine
    └── client.js                # Public Dynamic Renderers, Class Seat Counters, Weight Chart
```

---

## ⚡ System Integration & Reactive Workflows

All pages are powered by **Vanilla JavaScript (ES6+)** communicating through a centralized data access layer in `js/storage.js`:

1. **Synchronized Membership Plans**: Any new plan or price change made by Admin in `admin/memberships.html` instantly updates the client website at `index.html` and `client/plans.html`.
2. **Real-Time Class Capacity**: When a client books a group fitness class on `client/classes.html` or `client/my-dashboard.html`, the available seats decrement in real-time. Overbooking is strictly prevented once capacity is reached.
3. **Turnstile Attendance & Duplicate Prevention**: The check-in system checks if an athlete is already active inside the gym without having checked out, preventing duplicate check-ins.
4. **Automated Expiration Auditing**: Expiration dates are checked against the current date. Expired members are automatically flagged with warning badges and blocked at check-in with a manager override or renewal option.
5. **Auto-Extending Payments**: When recording a payment for an expired member with the auto-extend checkbox selected, their subscription status immediately updates to `Active` and their expiration date advances by the plan duration.
6. **Dynamic In-App Notification Center**: Class reservations, new member enrollments, payment reminders, and contact inquiries instantly dispatch notifications to the Admin topbar bell.

---

## 🎨 Visual Identity & Design Tokens

- **Primary Brand Accent**: Electric Orange (`#ff5e14` / Hover: `#e64c05` / Glow: `rgba(255, 94, 20, 0.28)`)
- **Dark Theme Surfaces**: Dark Charcoal (`#0b0e14`, `#141822`, `#181d29`, `#222938`)
- **Status Colors**: Emerald Green (`#10b981`), Rose Red (`#ef4444`), Amber Warning (`#f59e0b`), Cyan Info (`#06b6d4`), Violet VIP (`#8b5cf6`)
- **Typography**: Google Fonts `'Montserrat'` for bold athletic headers, `'Plus Jakarta Sans'` for interfaces and body copy.
- **Currency**: Egyptian Pound (`EGP`) formatted throughout all financial modules and member invoices.

---

## 🔒 Security & Architectural Disclaimers

This application implements a **simulated role-based frontend authentication and session architecture** for demonstration and portfolio purposes. Sensitive credentials should never be stored in plain text in production environments. The codebase is organized with clear separation of concerns (Data Layer, Authentication Layer, Presentation Layer) to facilitate straightforward migration to a Node.js/Express, Python/Django, or PostgreSQL backend.
