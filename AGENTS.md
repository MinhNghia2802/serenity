# Serenity — Codex Project Rules

## Source of truth

- Read `docs/implementation/README.md` before planning or coding.
- Follow the numbered implementation documents. Update the relevant document in the same change when behavior, schema, API, safety, or UI requirements change.
- Do not silently change product decisions documented in `docs/implementation/`.

## Working rules

- Use Next.js App Router, TypeScript strict, Tailwind CSS, Supabase and server-side Gemini only.
- Prefer small, focused changes. Preserve existing user changes and do not overwrite unrelated work.
- Before adding a dependency, check whether the project already has an equivalent capability; ask before adding a production dependency that is not required by the specification.
- Never expose secrets: no `GEMINI_API_KEY`, Supabase service-role key, encryption key, or raw sensitive text in client code, logs, test fixtures, documentation, or commits.
- Run the relevant lint, typecheck, test and build commands after code changes. Report commands not run and why.

## Privacy and safety are non-negotiable

- This is a wellbeing/self-reflection product, not a diagnosis or treatment product. Never add diagnostic language.
- Gemini is called only from server-side route handlers; validate all input and structured AI output with Zod.
- Encrypt user-written sensitive text before persistence; do not log it.
- Enforce authentication, ownership checks and Supabase RLS for every user-owned record.
- Any elevated/urgent safety signal bypasses ordinary recommendations and uses the safety flow defined in `05-ai-scoring.md`.
- Do not use user data, including anonymized data, for training or product improvement.

## Content and admin rules

- Content shown to users must be a published version only. Draft/admin content is never user-visible.
- Do not hard-delete content referenced by historical check-ins; archive or version it.
- Admin authorization must be verified on the server and in RLS. Never trust a role sent by the browser.

## Definition of done

- The change meets its acceptance criteria, is responsive and accessible, and has proportionate tests.
- For schema or RLS changes, add a migration and test cross-user/admin access boundaries.
- For AI, scoring, safety or recommendation changes, add/update unit tests for the altered decision path.

## Code review rules

- Flag any client-side secret, missing ownership check, missing RLS policy, raw sensitive-text log, or direct Gemini client call as blocking.
- Flag any change that permits a regular user to view draft content or access `/admin` / `/api/admin` as blocking.
- Flag normal music/podcast recommendations returned on an elevated/urgent safety path as blocking.
