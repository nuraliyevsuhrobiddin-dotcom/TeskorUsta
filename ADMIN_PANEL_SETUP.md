# Admin Panel Setup

This admin panel is backed by Next.js App Router and Supabase Auth, Database,
Storage, and RLS.

## Functional Modules

- `/admin/dashboard` - live listing stats and quick actions.
- `/admin/listings` - listing management entry point.
- `/admin/add` - create listings with multiple images.
- `/admin/edit/[id]` - edit listings and media.
- `/admin/vip` - manage `is_vip`, `vip_until`, and `vip_priority`.
- `/admin/reviews` - moderate review status and delete reviews.
- `/admin/users` - manage profile name, phone, role, and active/blocked status.
- `/admin/settings` - save site-level settings in `site_settings`.
- `/admin/crm` - create, update, filter, and delete CRM leads.

## Schema

Run the base schema first for a new project:

```sql
-- Supabase SQL Editor
-- paste and run supabase-schema.sql
```

Then run the full admin panel migration:

```sql
-- Supabase SQL Editor
-- paste and run supabase/migrations/20260505_admin_full_panel.sql
```

The migration adds:

- `profiles.status`, `profiles.updated_at`
- `reviews.status`, `reviews.updated_at`
- `listings.vip_until`, `listings.vip_priority`
- `site_settings`
- `crm_leads`
- RLS policies for admin management of users, reviews, settings, and CRM

Run analytics migration:

```sql
-- Supabase SQL Editor
-- paste and run supabase/migrations/20260505_app_analytics.sql
```

Analytics tracks:

- `page_view`
- `job_request_created`
- `listing_view`
- `favorite_added`
- `pwa_install_prompt`
- `pwa_installed`
- `telegram_sent`

## Admin User

Create or confirm the admin user in Supabase Auth, then mark the profile as
admin:

```sql
update public.profiles
set role = 'admin', status = 'active'
where lower(email) = lower('your-admin-email@example.com');
```

## Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
```

`TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are used by `/api/jobs` to notify
Telegram when a new "Usta chaqirish" request is saved.

## Verify

```bash
npm run lint
npm run build
npm run dev
```

Open:

```text
http://localhost:3000/admin
```
