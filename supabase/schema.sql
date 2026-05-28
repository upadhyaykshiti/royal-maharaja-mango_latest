-- Run this in your Supabase SQL editor

create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  delivery_address text not null,
  city text not null,
  postal_code text not null,
  kesar_qty integer not null default 0,
  alphonso_qty integer not null default 0,
  banganapalli_qty integer not null default 0,
  totapuri_qty integer not null default 0,
  jumbo_kesar_qty integer not null default 0,
  total_amount numeric not null,
  delivery_date text not null,
  special_instructions text,
  status text not null default 'pending'
),
 order_type text not null default 'home_delivery'
    check (order_type in ('home_delivery', 'courier'));

-- Enable Row Level Security
alter table orders enable row level security;

-- Allow inserts from anon (public form submissions)
create policy "Allow public inserts" on orders
  for insert to anon with check (true);

-- Only service role can read orders (admin use only)
create policy "Service role can read" on orders
  for select using (auth.role() = 'service_role');



-- ============================================================
-- Settings table for admin controls (e.g. orders on/off)
-- ============================================================
create table if not exists settings (
  key text primary key,
  value text not null,
  updated_at timestamptz default now()
);

alter table settings enable row level security;

-- Allow anon to READ settings (so the order form can check)
create policy "Allow public read settings" on settings
  for select to anon using (true);

-- Only service role can update settings
create policy "Service role update settings" on settings
  for update using (auth.role() = 'service_role');


-- Insert defaults: orders open + all varieties available
insert into settings (key, value) values ('orders_open', 'true') on conflict (key) do nothing;
-- insert into settings (key, value) values ('kesar_open', 'true') on conflict (key) do nothing;
insert into settings (key, value) values ('kesar_home_open', 'true') on conflict (key) do nothing;
insert into settings (key, value) values ('kesar_courier_open', 'true') on conflict (key) do nothing;
insert into settings (key, value) values ('alphonso_open', 'true') on conflict (key) do nothing;
insert into settings (key, value) values ('banganapalli_open', 'true') on conflict (key) do nothing;
insert into settings (key, value) values ('totapuri_open', 'true') on conflict (key) do nothing;
insert into settings (key, value) values ('jumbo_kesar_open', 'true') on conflict (key) do nothing;


