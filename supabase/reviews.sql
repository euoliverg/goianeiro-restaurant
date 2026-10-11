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
--   • to take a review down: Table Editor → reviews → set "hidden" = true.
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

-- ---------- permissions: column-level, least privilege ----------
alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select (id, created_at, name, rating, food, service, ambience, visit, dish, comment, lang)
  on public.reviews to anon, authenticated;
grant insert (name, rating, food, service, ambience, visit, dish, comment, lang)
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
