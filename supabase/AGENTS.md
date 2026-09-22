# Supabase Rules — Serenity

- Follow `docs/implementation/06-database-security.md` and `08-admin-console.md`.
- Write all database changes as ordered, idempotent migrations; do not edit production data manually.
- Enable RLS on every new user-related table in the same migration that creates it.
- User-owned rows require `user_id`; policies must constrain access to `auth.uid() = user_id`.
- Admin write policies must use a server-verified `is_admin()` helper or equivalent safe pattern; do not accept a client-supplied role.
- Add foreign keys and cascade rules required for full per-session/account deletion.
- Sensitive free text is encrypted before insertion. Database migrations must not create plaintext logging/audit copies.
- Seed data may contain only fictional, non-sensitive content and must not include credentials.
