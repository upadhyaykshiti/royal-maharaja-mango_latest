# 👑 Royal Maharaja Mango — Website

A professional one-page e-commerce site for Royal Maharaja Mango. Built with **Next.js 14**, **Supabase**, and deployed on **Vercel**.

---

## Features

- 🥭 Product listings for Kesar ($44 CAD) & Alphonso ($46 CAD) mangoes
- 📅 Friday & Saturday delivery scheduling
- 📋 Order form with full validation
- 🗄️ Orders saved to Supabase database
- 📧 Email notification to Bhavin via Resend
- 💬 WhatsApp notification via CallMeBot
- 🚀 One-click deploy to Vercel

---

## Tech Stack

| Layer | Tool |
|-------|------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Email | Resend |
| WhatsApp | CallMeBot |
| Deployment | Vercel |

---

## Setup Instructions

### 1. Clone & Install

```bash
git clone https://github.com/YOUR_USERNAME/royal-maharaja-mango.git
cd royal-maharaja-mango
npm install
```

---

### 2. Supabase Setup

1. Go to [supabase.com](https://supabase.com) → Create a new project
2. In the **SQL Editor**, paste and run the contents of `supabase/schema.sql`
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

---

### 3. Resend Email Setup

1. Go to [resend.com](https://resend.com) → Create a free account
2. Create an API key → `RESEND_API_KEY`
3. Add & verify your domain (or use `onboarding@resend.dev` for testing)
4. Update the `from` email in `app/api/order/route.ts` if needed

---

### 4. WhatsApp Setup (CallMeBot)

1. Save `+34 644 68 15 81` in your contacts as **CallMeBot**
2. Send this WhatsApp message to that number:
   ```
   I allow callmebot to send me messages
   ```
3. You'll receive your `apikey` in reply
4. Set `WHATSAPP_PHONE` to your WhatsApp number in international format (no `+`), e.g. `16478895292`
5. Set `WHATSAPP_API_KEY` to the key you received

---

### 5. Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

RESEND_API_KEY=re_...

WHATSAPP_PHONE=16478895292
WHATSAPP_API_KEY=your_callmebot_key

BUSINESS_EMAIL=shahbhavin2022@gmail.com
```

---

### 6. Run Locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel

### Option A: Vercel Dashboard (Recommended)

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import from GitHub
3. Add all environment variables from `.env.local` in the Vercel dashboard
4. Click **Deploy** ✅

### Option B: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

Add environment variables when prompted, or add them in the Vercel dashboard after.

---

## Project Structure

```
royal-maharaja-mango/
├── app/
│   ├── api/
│   │   └── order/
│   │       └── route.ts       # POST /api/order — saves order, sends notifications
│   ├── globals.css             # Global styles + Google Fonts
│   ├── layout.tsx              # Root layout with metadata
│   └── page.tsx                # Full one-page site
├── lib/
│   ├── supabase.ts             # Supabase client + Order type
│   └── dates.ts                # Next 8 Fri/Sat delivery dates
├── supabase/
│   └── schema.sql              # Run in Supabase SQL editor
├── .env.local.example          # Copy to .env.local and fill in values
├── vercel.json
├── tailwind.config.js
└── README.md
```

---

## Viewing Orders (Admin)

Orders are stored in your Supabase database. To view them:

1. Go to your Supabase project → **Table Editor → orders**
2. All orders show customer details, quantities, delivery date, and status
3. You can change `status` from `pending` → `confirmed` / `delivered` manually

---

## Customisation

| What | Where |
|------|-------|
| Prices | `app/page.tsx` → `PRODUCTS` array |
| Cities | `app/page.tsx` → `CITIES` array |
| Delivery days | `lib/dates.ts` → change day numbers (5=Fri, 6=Sat) |
| Business email | `app/api/order/route.ts` → `to:` field |
| WhatsApp number | `.env.local` → `WHATSAPP_PHONE` |

---

## Support

Instagram: [@royal_mango_worldwide](https://www.instagram.com/royal_mango_worldwide)  
Email: shahbhavin2022@gmail.com
