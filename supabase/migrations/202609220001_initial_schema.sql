create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'user' check (role in ('user', 'admin')),
  timezone text not null default 'Asia/Bangkok',
  reminder_enabled boolean not null default false,
  reminder_time time,
  consented_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end; $$;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public
as $$ select exists(select 1 from public.profiles where id = auth.uid() and role = 'admin'); $$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

create table public.artwork_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  selection_rules jsonb not null default '{}'::jsonb,
  version integer not null default 1 check (version > 0),
  published_at timestamptz,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.artworks (
  id uuid primary key default gen_random_uuid(),
  artwork_set_id uuid not null references public.artwork_sets(id) on delete restrict,
  image_url text,
  storage_path text,
  alt_text text not null,
  emotion_tags text[] not null default '{}',
  intensity_min smallint not null default 1 check (intensity_min between 1 and 5),
  intensity_max smallint not null default 5 check (intensity_max between 1 and 5),
  license text not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint artwork_has_source check (image_url is not null or storage_path is not null)
);

create table public.question_sets (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version integer not null default 1 check (version > 0),
  published_at timestamptz,
  updated_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  question_set_id uuid not null references public.question_sets(id) on delete restrict,
  question_key text not null,
  prompt text not null,
  input_type text not null check (input_type in ('single_select', 'scale', 'textarea')),
  options jsonb not null default '[]'::jsonb,
  is_required boolean not null default false,
  display_condition jsonb,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(question_set_id, question_key)
);

create table public.check_ins (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  idempotency_key uuid not null,
  status text not null default 'pending' check (status in ('pending', 'completed', 'safety', 'analysis_failed')),
  primary_emotion text not null,
  energy_score smallint check (energy_score between 1 and 5),
  stress_score smallint not null check (stress_score between 1 and 5),
  cause_category text,
  artwork_id uuid references public.artworks(id) on delete restrict,
  artwork_set_version integer,
  question_set_version integer,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, idempotency_key)
);

create table public.checkin_texts (
  check_in_id uuid primary key references public.check_ins(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  art_description_encrypted text not null,
  additional_sharing_encrypted text,
  encryption_key_version text not null default 'v1',
  created_at timestamptz not null default now()
);

create table public.emotion_analyses (
  check_in_id uuid primary key references public.check_ins(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  nlp_emotion_scores jsonb not null,
  final_emotion_scores jsonb not null,
  final_emotion text not null,
  intensity smallint not null check (intensity between 1 and 5),
  reason_short text not null,
  action_suggestion text not null,
  content_tags text[] not null default '{}',
  safety_level text not null check (safety_level in ('normal', 'elevated', 'urgent')),
  created_at timestamptz not null default now()
);

create table public.emotion_feedback (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references public.check_ins(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  is_accurate boolean not null,
  corrected_emotion text,
  note_encrypted text,
  created_at timestamptz not null default now()
);

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('music', 'podcast', 'exercise')),
  title text not null,
  description text not null default '',
  provider text not null,
  external_url text not null,
  emotion_tags text[] not null default '{}',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recommendations (
  id uuid primary key default gen_random_uuid(),
  check_in_id uuid not null references public.check_ins(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content_item_id uuid not null references public.content_items(id) on delete restrict,
  position smallint not null,
  opened_at timestamptz,
  saved_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.artwork_sets enable row level security;
alter table public.artworks enable row level security;
alter table public.question_sets enable row level security;
alter table public.questions enable row level security;
alter table public.check_ins enable row level security;
alter table public.checkin_texts enable row level security;
alter table public.emotion_analyses enable row level security;
alter table public.emotion_feedback enable row level security;
alter table public.content_items enable row level security;
alter table public.recommendations enable row level security;

create policy "profile owner read" on public.profiles for select using (id = auth.uid() or public.is_admin());
create policy "profile owner update" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());

revoke update on public.profiles from authenticated;
grant update (timezone, reminder_enabled, reminder_time, consented_at, updated_at) on public.profiles to authenticated;

create policy "published artwork sets read" on public.artwork_sets for select to authenticated using (status = 'published' or public.is_admin());
create policy "admin artwork sets write" on public.artwork_sets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "published artworks read" on public.artworks for select to authenticated using (is_active and exists(select 1 from public.artwork_sets s where s.id = artwork_set_id and s.status = 'published') or public.is_admin());
create policy "admin artworks write" on public.artworks for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "published question sets read" on public.question_sets for select to authenticated using (status = 'published' or public.is_admin());
create policy "admin question sets write" on public.question_sets for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "published questions read" on public.questions for select to authenticated using (is_active and exists(select 1 from public.question_sets s where s.id = question_set_id and s.status = 'published') or public.is_admin());
create policy "admin questions write" on public.questions for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "owner checkins" on public.check_ins for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner checkin texts" on public.checkin_texts for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner analyses" on public.emotion_analyses for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "owner feedback" on public.emotion_feedback for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "active content read" on public.content_items for select to authenticated using (is_active or public.is_admin());
create policy "admin content write" on public.content_items for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "owner recommendations" on public.recommendations for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('artworks', 'artworks', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public artwork files read" on storage.objects for select using (bucket_id = 'artworks');
create policy "admin artwork files insert" on storage.objects for insert to authenticated with check (bucket_id = 'artworks' and public.is_admin());
create policy "admin artwork files update" on storage.objects for update to authenticated using (bucket_id = 'artworks' and public.is_admin());
create policy "admin artwork files delete" on storage.objects for delete to authenticated using (bucket_id = 'artworks' and public.is_admin());
