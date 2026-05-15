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
  total_amount numeric not null,
  delivery_date text not null,
  special_instructions text,
  status text not null default 'pending'
);

-- Enable Row Level Security
alter table orders enable row level security;

-- Allow inserts from anon (public form submissions)
create policy "Allow public inserts" on orders
  for insert to anon with check (true);

-- Only service role can read orders (admin use only)
create policy "Service role can read" on orders
  for select using (auth.role() = 'service_role');
