-- Run once in Supabase → SQL Editor. Safe to re-run (idempotent).
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  name text not null
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references users(id) on delete cascade,
  title text not null default 'Untitled document' check (char_length(title) between 1 and 200),
  content jsonb not null default '{"type":"doc","content":[]}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists documents_owner_idx on documents(owner_id);

create table if not exists document_shares (
  document_id uuid not null references documents(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (document_id, user_id)
);
create index if not exists document_shares_user_idx on document_shares(user_id);

-- RLS on with no policies: the public anon key can read nothing.
-- The app's server uses the secret key and enforces access in src/lib/access.ts.
alter table users enable row level security;
alter table documents enable row level security;
alter table document_shares enable row level security;

insert into users (email, name) values
  ('alice@ajaia.dev', 'Alice'),
  ('bob@ajaia.dev',   'Bob'),
  ('carol@ajaia.dev', 'Carol')
on conflict (email) do nothing;
