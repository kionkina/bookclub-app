# Book Club App

A mobile-first web app for managing book clubs. Create clubs, invite members via shareable links, vote on meeting dates, track reading progress, and get SMS reminders.

## Stack

- **Next.js** (App Router) + TypeScript
- **Supabase** — Postgres, auth (magic link + Google), real-time
- **Tailwind v4** + shadcn/ui
- **Twilio** — SMS reminders (optional)

## Features

- Magic link + Google auth
- Shareable invite links
- Date-poll voting for meetings
- SMS reminders (24h + 1h before confirmed meeting)
- Real-time feed with posts and comments
- Book tracking + per-member page progress

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then run the migrations in the SQL editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_fix_club_members_rls.sql`

3. **Configure environment variables** — copy `.env.local.example` to `.env.local` and fill in your Supabase and (optionally) Twilio credentials.

4. **Run the dev server**
   ```bash
   npm run dev
   ```

## SMS Reminders (optional)

Reminders are triggered by a Supabase Edge Function (`supabase/functions/check-reminders/`) on a cron schedule. Deploy it and set a `*/5 * * * *` cron job in the Supabase dashboard once you have Twilio credentials.
