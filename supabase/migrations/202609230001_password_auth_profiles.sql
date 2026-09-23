alter table public.profiles
add column if not exists display_name text check (char_length(display_name) between 2 and 60);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    case
      when char_length(trim(new.raw_user_meta_data ->> 'display_name')) between 2 and 60
        then trim(new.raw_user_meta_data ->> 'display_name')
      else null
    end
  )
  on conflict (id) do update
  set display_name = coalesce(public.profiles.display_name, excluded.display_name);
  return new;
end;
$$;
