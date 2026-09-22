# Frontend Rules — Serenity

- Follow `docs/implementation/02-ui-ux.md` and `03-frontend.md`.
- Use Inter, white background, near-black text, high contrast and mobile-first responsive layouts.
- Do not add bounce/zoom hover effects. Keep motion minimal and respect `prefers-reduced-motion`.
- All form controls need visible labels, keyboard behavior, focus states and understandable validation errors in Vietnamese.
- Check-in state must survive moving between wizard steps and analysis failures; never discard user text without explicit action.
- Do not call Gemini, Supabase service-role APIs, encryption/decryption helpers, or any secret-bearing endpoint directly from client components.
- Hide admin navigation unless role is verified by server-rendered auth state; UI hiding is not authorization.
