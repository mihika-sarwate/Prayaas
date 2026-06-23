-- Supabase Database Schema Setup for Sankalp
-- Copy and paste this entire file into the Supabase SQL Editor and click "Run"



-- 1. Employees Table
create table if not exists employees (
  id text primary key,
  name text not null,
  pwd text not null,
  area text,
  designation text,
  role text not null, -- 'emp', 'manager', 'am', 'rm', 'zm', 'nsm', 'admin'
  manager_id text references employees(id),
  doj date,
  state text,
  status text not null default 'Active',
  leaves jsonb not null default '{"CL": 12, "SL": 10, "EL": 15, "LWP": 99, "CL_used": 0, "SL_used": 0, "EL_used": 0, "LWP_used": 0}'::jsonb
);
alter table employees add column if not exists designation text;

-- 2. Doctors Table
create table doctors (
  id text primary key,
  code text not null,
  name text not null,
  spec text,
  qual text,
  address text,
  city text,
  area text,
  phone text,
  assign_to text references employees(id),
  status text not null default 'Active',
  be_name text,
  hq text,
  manager_name text,
  state text,
  territory_type text
);

-- 3. Chemists Table
create table chemists (
  id text primary key,
  name text not null,
  area text,
  assign_to text references employees(id)
);

-- 3b. Stockists Table
create table stockists (
  id text primary key,
  name text not null,
  area text,
  assign_to text references employees(id)
);

-- 4. Daily Call Reports Table
create table reports (
  id text primary key,
  emp_id text references employees(id),
  emp_name text,
  date date not null,
  time text,
  target_type text not null, -- 'Doctor' or 'Chemist'
  classification text,
  call_type text,
  doc_id text references doctors(id),
  doc_name text,
  doc_spec text,
  doc_area text,
  promoted_products text[],
  samples jsonb,
  gifts jsonb,
  inputs jsonb,
  chem_id text references chemists(id),
  chem_name text,
  chem_area text,
  order_amount numeric default 0,
  stock_status text,
  jfw_mgr_id text references employees(id),
  jfw_mgr_name text,
  jfw_remarks text,
  lat text,
  lng text,
  remarks text,
  next_visit date,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table reports add column if not exists jfw_remarks text;

-- 5. Monthly Tour Plans Table
create table tour_plans (
  id text primary key,
  emp_id text references employees(id),
  emp_name text,
  month text not null, -- YYYY-MM
  manager_id text references employees(id),
  manager_name text,
  days jsonb not null, -- Array of planned days: [{date, workType, territory, stayCity, areaTerritory, plannedDocs, plannedChems}]
  status text not null default 'Draft', -- 'Draft', 'Submitted', 'Approved', 'Rejected'
  remarks text,
  submitted_at timestamp with time zone,
  approved_date date,
  approved_by text references employees(id),
  revision_history jsonb not null default '[]'::jsonb
);

-- 6. Expense Claims Table
create table expenses (
  id text primary key,
  emp_id text references employees(id),
  emp_name text,
  month text not null,
  manager_id text references employees(id),
  lines jsonb not null,
  total numeric not null,
  receipt_file text,
  status text not null default 'Submitted',
  submitted_at timestamp with time zone default timezone('utc'::text, now()),
  remarks text
);

-- 7. Leaves Table
create table leaves (
  id text primary key,
  emp_id text references employees(id),
  emp_name text,
  type text not null,
  start date not null,
  "end" date not null,
  days integer not null,
  reason text,
  manager_id text references employees(id),
  status text not null default 'Submitted',
  submitted_at timestamp with time zone default timezone('utc'::text, now()),
  remarks text
);

-- 8. SFC (Fare Chart) Table
create table sfc (
  id serial primary key,
  emp_id text,
  working_days text,
  emp_name text,
  hq text,
  state text,
  from_loc text not null,
  to_loc text not null,
  category text,
  distance numeric,
  mode text,
  fare numeric,
  da numeric,
  total numeric,
  doctors text,
  business text,
  lodge numeric,
  other numeric
);

-- 9. Inventory Tables
create table samples_inventory (
  id serial primary key,
  prod_name text not null,
  emp_id text references employees(id),
  opening integer default 0,
  received integer default 0,
  distributed integer default 0,
  balance integer default 0
);

create table gifts_inventory (
  id serial primary key,
  gift_name text not null,
  emp_id text references employees(id),
  opening integer default 0,
  received integer default 0,
  distributed integer default 0,
  balance integer default 0
);

create table inputs_inventory (
  id serial primary key,
  input_name text not null,
  emp_id text references employees(id),
  opening integer default 0,
  received integer default 0,
  distributed integer default 0,
  balance integer default 0
);

-- 10. Holidays Table (State/Region wise)
-- Run the following SQL to migrate the holidays table if you already have one:
-- ALTER TABLE holidays DROP CONSTRAINT holidays_pkey;
-- ALTER TABLE holidays ADD COLUMN state text not null default 'All';
-- ALTER TABLE holidays ADD PRIMARY KEY (date, state);
create table if not exists holidays (
  date date not null,
  name text not null,
  state text not null default 'All',
  primary key (date, state)
);
alter table holidays add column if not exists state text not null default 'All';
alter table holidays disable row level security;

-- 11. Announcements / Broadcast Messages Table
create table if not exists announcements (
  id text primary key,
  sender_id text not null,
  sender_name text not null,
  title text not null default 'Namaskaram!',
  message text not null,
  target_type text not null, -- 'all', 'role', 'users'
  target_value text, -- role name, or comma-separated list of employee IDs
  acknowledged_by text[] not null default '{}', -- array of employee IDs who acknowledged it
  file_data text,
  file_type text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);
alter table announcements add column if not exists file_data text;
alter table announcements add column if not exists file_type text;
alter table announcements disable row level security;

-- IMPORTANT: Disable Row Level Security (RLS) on all tables so public client credentials can read/write data.
alter table employees disable row level security;
alter table doctors disable row level security;
alter table chemists disable row level security;
alter table reports disable row level security;
alter table tour_plans disable row level security;
alter table expenses disable row level security;
alter table leaves disable row level security;
alter table sfc disable row level security;
alter table samples_inventory disable row level security;
alter table gifts_inventory disable row level security;
alter table inputs_inventory disable row level security;
alter table stockists disable row level security;
