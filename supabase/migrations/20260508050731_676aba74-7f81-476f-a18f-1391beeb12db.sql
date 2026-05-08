
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile upsert" on public.profiles for insert with check (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- per-user keyed json store
create table public.user_data (
  user_id uuid not null references auth.users(id) on delete cascade,
  key text not null,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);
alter table public.user_data enable row level security;
create policy "own data select" on public.user_data for select using (auth.uid() = user_id);
create policy "own data insert" on public.user_data for insert with check (auth.uid() = user_id);
create policy "own data update" on public.user_data for update using (auth.uid() = user_id);
create policy "own data delete" on public.user_data for delete using (auth.uid() = user_id);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
create trigger user_data_touch before update on public.user_data
for each row execute function public.touch_updated_at();

-- new user → profile
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email,'@',1)));
  return new;
end;
$$;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- private vision board bucket
insert into storage.buckets (id, name, public) values ('vision-board','vision-board', false)
on conflict (id) do nothing;

create policy "vb own select" on storage.objects for select
  using (bucket_id = 'vision-board' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "vb own insert" on storage.objects for insert
  with check (bucket_id = 'vision-board' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "vb own update" on storage.objects for update
  using (bucket_id = 'vision-board' and auth.uid()::text = (storage.foldername(name))[1]);
create policy "vb own delete" on storage.objects for delete
  using (bucket_id = 'vision-board' and auth.uid()::text = (storage.foldername(name))[1]);
