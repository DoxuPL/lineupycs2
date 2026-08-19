-- Uruchom cały ten plik w Supabase: SQL Editor > New query.
create table if not exists public.lineups (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(title) between 1 and 70),
  map text not null check (map in ('Cache','Inferno','Mirage','Nuke','Dust II','Ancient','Anubis')),
  type text not null check (type in ('Smoke','Flash','Molotov','HE','Decoy')),
  description text,
  image_url text not null,
  created_at timestamptz not null default now()
);
alter table public.lineups enable row level security;
create policy "Publiczny odczyt lineupow" on public.lineups for select using (true);
create policy "Publiczne dodawanie lineupow" on public.lineups for insert with check (true);

insert into storage.buckets (id, name, public) values ('lineup-images', 'lineup-images', true) on conflict (id) do update set public = true;
create policy "Publiczny odczyt obrazkow" on storage.objects for select using (bucket_id = 'lineup-images');
create policy "Publiczne wysylanie obrazkow" on storage.objects for insert with check (bucket_id = 'lineup-images');
