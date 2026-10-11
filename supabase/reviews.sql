-- =====================================================================
-- Goianeiro Restaurant — customer reviews (Supabase / Postgres)
-- Run once in Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run: every object is created with IF NOT EXISTS / OR REPLACE.
--
-- Model: reviews are published immediately (no approval queue).
-- Protections live in the database, so nobody can bypass them from the browser:
--   • the public (anon) key can only INSERT a review and READ visible reviews —
--     never update or delete, never read hidden rows or rate-limit data;
--   • strict checks on every field (lengths, 1–5 ratings, no links in text);
--   • rate limit: 3 reviews per connection per hour, 40 per hour site-wide;
--   • optional photo (published with the review): stored in the public bucket
--     "review-photos" — JPG/WebP only, max 2 MB, random UUID names, the public key
--     can upload but never overwrite, list or delete; 5 photos per connection per
--     hour, 60 per hour site-wide; a review can only point to a photo that exists;
--   • to take a review down: Table Editor → reviews → set "hidden" = true
--     (to also delete its photo: Storage → review-photos → delete the file).
-- =====================================================================

create schema if not exists private;

-- ---------- table ----------
create table if not exists public.reviews (
  id         bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name       text     not null check (char_length(btrim(name)) between 2 and 40),
  rating     smallint not null check (rating between 1 and 5),            -- overall
  food       smallint not null check (food between 1 and 5),              -- food quality
  service    smallint          check (service between 1 and 5),
  ambience   smallint          check (ambience between 1 and 5),
  visit      text              check (visit in ('dine-in', 'takeout', 'breakfast', 'burgers')),
  dish       text              check (char_length(dish) <= 60),
  comment    text     not null check (char_length(btrim(comment)) between 10 and 800
                                      -- no links (\y = word boundary in Postgres regex)
                                      and comment !~* '(https?://|www\.|\.(com|net|org|io|co|br|us|info|biz|xyz)\y)'),
  lang       text     not null default 'en' check (lang in ('en', 'pt')),
  hidden     boolean  not null default false
);
create index if not exists reviews_visible_created_idx on public.reviews (created_at desc) where hidden = false;

-- optional photo: the object name inside the "review-photos" bucket (<uuid>.webp / .jpg)
alter table public.reviews add column if not exists photo text;
do $$ begin
  alter table public.reviews add constraint reviews_photo_check
    check (photo ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(webp|jpg)$');
exception when duplicate_object then null; end $$;
create unique index if not exists reviews_photo_unique on public.reviews (photo) where photo is not null;

-- ---------- permissions: column-level, least privilege ----------
alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select (id, created_at, name, rating, food, service, ambience, visit, dish, comment, lang, photo)
  on public.reviews to anon, authenticated;
grant insert (name, rating, food, service, ambience, visit, dish, comment, lang, photo)
  on public.reviews to anon, authenticated;

drop policy if exists "Visible reviews are public" on public.reviews;
create policy "Visible reviews are public" on public.reviews
  for select to anon, authenticated using (hidden = false);

drop policy if exists "Anyone can post a review" on public.reviews;
create policy "Anyone can post a review" on public.reviews
  for insert to anon, authenticated with check (hidden = false);

-- ---------- rate limiting (private: not reachable through the API) ----------
create table if not exists private.review_hits (
  key text not null,
  at  timestamptz not null default now()
);
create index if not exists review_hits_key_at_idx on private.review_hits (key, at);
revoke all on schema private from anon, authenticated;
revoke all on private.review_hits from anon, authenticated;

create or replace function private.reviews_guard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := coalesce(
    nullif(headers ->> 'cf-connecting-ip', ''),
    nullif(headers ->> 'x-real-ip', ''),
    nullif(btrim(split_part(coalesce(headers ->> 'x-forwarded-for', ''), ',', 1)), ''),
    'unknown');
  k text := md5(ip || ':goianeiro-reviews');
begin
  if (select count(*) from private.review_hits where key = k and at > now() - interval '1 hour') >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Try again later.';
  end if;
  if (select count(*) from private.review_hits where at > now() - interval '1 hour') >= 40 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Try again later.';
  end if;
  -- a review may only reference a photo that was really uploaded to the bucket
  if new.photo is not null and not exists (
    select 1 from storage.objects o where o.bucket_id = 'review-photos' and o.name = new.photo
  ) then
    raise exception 'photo_missing' using errcode = 'P0001';
  end if;

  insert into private.review_hits (key) values (k);
  delete from private.review_hits where at < now() - interval '1 day';

  -- server decides these; the browser cannot set them
  new.name       := btrim(regexp_replace(new.name, '\s+', ' ', 'g'));
  new.comment    := btrim(new.comment);
  new.dish       := nullif(btrim(new.dish), '');
  new.created_at := now();
  new.hidden     := false;
  return new;
end;
$$;

drop trigger if exists reviews_guard on public.reviews;
create trigger reviews_guard
  before insert on public.reviews
  for each row execute function private.reviews_guard();

-- ---------- public summary (counts + averages of visible reviews) ----------
create or replace function public.review_summary()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select json_build_object(
    'count',    count(*),
    'rating',   round(avg(rating)::numeric, 2),
    'food',     round(avg(food)::numeric, 2),
    'service',  round(avg(service)::numeric, 2),
    'ambience', round(avg(ambience)::numeric, 2),
    'dist', json_build_array(
      count(*) filter (where rating = 5), count(*) filter (where rating = 4),
      count(*) filter (where rating = 3), count(*) filter (where rating = 2),
      count(*) filter (where rating = 1))
  )
  from public.reviews
  where hidden = false;
$$;
revoke all on function public.review_summary() from public;
grant execute on function public.review_summary() to anon, authenticated;

-- ---------- review photos (Supabase Storage) ----------
-- Public bucket: anyone can VIEW a photo by its URL; the size and file-type limits
-- are enforced by Supabase Storage itself before anything is stored.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('review-photos', 'review-photos', true, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create table if not exists private.photo_hits (
  key text not null,
  at  timestamptz not null default now()
);
create index if not exists photo_hits_key_at_idx on private.photo_hits (key, at);
revoke all on private.photo_hits from anon, authenticated;

-- Called by the upload policy: counts the upload and enforces the photo rate limit.
create or replace function private.photo_upload_ok()
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  headers json := coalesce(nullif(current_setting('request.headers', true), ''), '{}')::json;
  ip text := coalesce(
    nullif(headers ->> 'cf-connecting-ip', ''),
    nullif(headers ->> 'x-real-ip', ''),
    nullif(btrim(split_part(coalesce(headers ->> 'x-forwarded-for', ''), ',', 1)), ''),
    'unknown');
  k text := md5(ip || ':goianeiro-photos');
begin
  if (select count(*) from private.photo_hits where key = k and at > now() - interval '1 hour') >= 5 then
    return false;
  end if;
  if (select count(*) from private.photo_hits where at > now() - interval '1 hour') >= 60 then
    return false;
  end if;
  insert into private.photo_hits (key) values (k);
  delete from private.photo_hits where at < now() - interval '1 day';
  return true;
end;
$$;
revoke all on function private.photo_upload_ok() from public;
grant usage on schema private to anon, authenticated;            -- only to call the function below
grant execute on function private.photo_upload_ok() to anon, authenticated;

-- Upload only: new files with a random-UUID name in this bucket, within the rate limit.
-- No update/delete policies → the public key can never overwrite or remove files,
-- and no select policy → it cannot list the bucket either.
drop policy if exists "Review photos: public upload" on storage.objects;
create policy "Review photos: public upload" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'review-photos'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(webp|jpg)$'
    and private.photo_upload_ok()
  );
