-- =====================================================================
-- Goianeiro Restaurant — customer reviews (Supabase / Postgres)
-- Every object is prefixed goianeiro_ so this can live safely inside a project that
-- already hosts other apps: it never touches tables, schemas or buckets it did not create.
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
--     "goianeiro-review-photos" — JPG/WebP only, max 2 MB, random UUID names, the public key
--     can upload but never overwrite, list or delete; max 20 photos per hour and 100
--     per day site-wide, bucket capped at 500 MB; a review can only point to a photo that exists;
--   • to take a review down: Table Editor → goianeiro_reviews → set "hidden" = true
--     (to also delete its photo: Storage → goianeiro-review-photos → delete the file).
-- =====================================================================

create schema if not exists goianeiro_private;

-- ---------- table ----------
create table if not exists public.goianeiro_reviews (
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
create index if not exists goianeiro_reviews_visible_created_idx on public.goianeiro_reviews (created_at desc) where hidden = false;

-- optional photo: the object name inside the "goianeiro-review-photos" bucket (<uuid>.webp / .jpg)
alter table public.goianeiro_reviews add column if not exists photo text;
do $$ begin
  alter table public.goianeiro_reviews add constraint goianeiro_reviews_photo_check
    check (photo ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(webp|jpg)$');
exception when duplicate_object then null; end $$;
create unique index if not exists goianeiro_reviews_photo_unique on public.goianeiro_reviews (photo) where photo is not null;

-- ---------- permissions: column-level, least privilege ----------
alter table public.goianeiro_reviews enable row level security;
revoke all on public.goianeiro_reviews from anon, authenticated;
grant select (id, created_at, name, rating, food, service, ambience, visit, dish, comment, lang, photo)
  on public.goianeiro_reviews to anon, authenticated;
grant insert (name, rating, food, service, ambience, visit, dish, comment, lang, photo)
  on public.goianeiro_reviews to anon, authenticated;

drop policy if exists "Visible reviews are public" on public.goianeiro_reviews;
create policy "Visible reviews are public" on public.goianeiro_reviews
  for select to anon, authenticated using (hidden = false);

drop policy if exists "Anyone can post a review" on public.goianeiro_reviews;
create policy "Anyone can post a review" on public.goianeiro_reviews
  for insert to anon, authenticated with check (hidden = false);

-- ---------- rate limiting (private: not reachable through the API) ----------
create table if not exists goianeiro_private.review_hits (
  key text not null,
  at  timestamptz not null default now()
);
create index if not exists review_hits_key_at_idx on goianeiro_private.review_hits (key, at);
revoke all on schema goianeiro_private from anon, authenticated;
revoke all on goianeiro_private.review_hits from anon, authenticated;

create or replace function goianeiro_private.reviews_guard()
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
  if (select count(*) from goianeiro_private.review_hits where key = k and at > now() - interval '1 hour') >= 3 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Try again later.';
  end if;
  if (select count(*) from goianeiro_private.review_hits where at > now() - interval '1 hour') >= 40 then
    raise exception 'rate_limited' using errcode = 'P0001', hint = 'Try again later.';
  end if;
  -- a review may only reference a photo that was really uploaded to the bucket
  if new.photo is not null and not exists (
    select 1 from storage.objects o where o.bucket_id = 'goianeiro-review-photos' and o.name = new.photo
  ) then
    raise exception 'photo_missing' using errcode = 'P0001';
  end if;

  insert into goianeiro_private.review_hits (key) values (k);
  delete from goianeiro_private.review_hits where at < now() - interval '1 day';

  -- server decides these; the browser cannot set them
  new.name       := btrim(regexp_replace(new.name, '\s+', ' ', 'g'));
  new.comment    := btrim(new.comment);
  new.dish       := nullif(btrim(new.dish), '');
  new.created_at := now();
  new.hidden     := false;
  return new;
end;
$$;

drop trigger if exists goianeiro_reviews_guard on public.goianeiro_reviews;
create trigger goianeiro_reviews_guard
  before insert on public.goianeiro_reviews
  for each row execute function goianeiro_private.reviews_guard();

-- ---------- public summary (counts + averages of visible reviews) ----------
create or replace function public.goianeiro_review_summary()
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
  from public.goianeiro_reviews
  where hidden = false;
$$;
revoke all on function public.goianeiro_review_summary() from public;
grant execute on function public.goianeiro_review_summary() to anon, authenticated;

-- ---------- review photos (Supabase Storage) ----------
-- Public bucket: anyone can VIEW a photo by its URL; the size and file-type limits
-- are enforced by Supabase Storage itself before anything is stored.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('goianeiro-review-photos', 'goianeiro-review-photos', true, 2097152, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Supabase Storage runs the upload policy in a transaction it rolls back, so a counter
-- table would never keep its rows. The limit therefore counts the files really stored.
drop table if exists goianeiro_private.photo_hits;   -- earlier version, never used

-- Called by the upload policy: max 20 photos per hour and 100 per day site-wide, and the
-- bucket never grows past 500 MB (the free plan has 1 GB shared with the rest of the project).
create or replace function goianeiro_private.photo_upload_ok()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) filter (where o.created_at > now() - interval '1 hour') < 20
     and count(*) filter (where o.created_at > now() - interval '1 day') < 100
     and coalesce(sum((o.metadata ->> 'size')::bigint), 0) < 500 * 1024 * 1024
  from storage.objects o
  where o.bucket_id = 'goianeiro-review-photos';
$$;
revoke all on function goianeiro_private.photo_upload_ok() from public;
grant usage on schema goianeiro_private to anon, authenticated;            -- only to call the function below
grant execute on function goianeiro_private.photo_upload_ok() to anon, authenticated;

-- Upload only: new files with a random-UUID name in this bucket, within the rate limit.
-- No update/delete policies → the public key can never overwrite or remove files,
-- and no select policy → it cannot list the bucket either.
drop policy if exists "Goianeiro review photos: public upload" on storage.objects;
create policy "Goianeiro review photos: public upload" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'goianeiro-review-photos'
    and name ~ '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(webp|jpg)$'
    and goianeiro_private.photo_upload_ok()
  );
