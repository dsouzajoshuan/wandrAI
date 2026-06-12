-- Database Schema Migration
-- Phase 1 - Database Schema for Wandr AI

-- Enable UUID generation extension if not enabled
create extension if not exists "uuid-ossp";

-- ==========================================
-- 1. Create Tables
-- ==========================================

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  trust_score int default 80,
  id_verified boolean default false,
  interests text[] default '{}',
  bio text,
  created_at timestamptz default now()
);

-- destinations
create table if not exists public.destinations (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  country text not null,
  cover_image text,
  description text
);

-- itineraries
create table if not exists public.itineraries (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete cascade not null,
  duration_days int not null, -- 3 or 5
  day_number int not null,
  time_label text,
  title text not null,
  description text,
  order_index int not null
);

-- trips
create table if not exists public.trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  destination_id uuid references public.destinations(id) on delete cascade not null,
  start_date date not null,
  duration_days int not null,
  status text not null default 'planning', -- planning, confirmed, active, completed
  created_at timestamptz default now()
);

-- trip_bookings
create table if not exists public.trip_bookings (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  name text not null,
  type text not null, -- cruise, dining, hotel etc.
  scheduled_time time,
  lat float8,
  lng float8,
  status text not null default 'pending', -- confirmed, pending, cancelled
  provider_ref text -- n8n booking reference
);

-- companions
create table if not exists public.companions (
  id uuid primary key references public.profiles(id) on delete cascade,
  specialty text,
  tags text[] default '{}',
  current_destination_id uuid references public.destinations(id) on delete set null,
  availability_status text not null default 'available'
);

-- companion_matches
create table if not exists public.companion_matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  companion_id uuid references public.companions(id) on delete cascade not null,
  fit_score int not null default 0,
  status text not null default 'suggested', -- suggested, liked, passed, matched
  created_at timestamptz default now(),
  constraint companion_matches_user_companion_key unique (user_id, companion_id)
);

-- chat_messages
create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  recipient_id uuid references public.profiles(id) on delete cascade, -- nullable for group/Wandr Zones
  message text not null,
  created_at timestamptz default now()
);

-- ai_chat_logs
create table if not exists public.ai_chat_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  context text not null, -- assistant, companion_ai, orchestrator
  role text not null, -- user, assistant
  content text not null,
  created_at timestamptz default now()
);

-- safety_alerts
create table if not exists public.safety_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  trip_id uuid references public.trips(id) on delete cascade not null,
  lat float8 not null,
  lng float8 not null,
  status text not null default 'active', -- active, resolved
  created_at timestamptz default now()
);

-- wandr_zones
create table if not exists public.wandr_zones (
  id uuid primary key default gen_random_uuid(),
  destination_id uuid references public.destinations(id) on delete cascade not null,
  name text not null,
  lat float8 not null,
  lng float8 not null
);

-- ==========================================
-- 2. Create Views
-- ==========================================

-- companion_profiles view (limited columns)
create or replace view public.companion_profiles as
  select 
    p.id,
    p.full_name,
    p.avatar_url,
    p.trust_score,
    p.id_verified,
    p.interests,
    p.bio,
    c.specialty,
    c.tags,
    c.current_destination_id,
    c.availability_status
  from public.profiles p
  join public.companions c on p.id = c.id;

-- ==========================================
-- 3. Row Level Security (RLS) Configuration
-- ==========================================

alter table public.profiles enable row level security;
alter table public.destinations enable row level security;
alter table public.itineraries enable row level security;
alter table public.trips enable row level security;
alter table public.trip_bookings enable row level security;
alter table public.companions enable row level security;
alter table public.companion_matches enable row level security;
alter table public.chat_messages enable row level security;
alter table public.ai_chat_logs enable row level security;
alter table public.safety_alerts enable row level security;
alter table public.wandr_zones enable row level security;

-- profiles Policies
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- companions Policies
create policy "Authenticated users can read companion records" on public.companions
  for select using (auth.role() = 'authenticated');

create policy "Users can manage own companion record" on public.companions
  for all using (auth.uid() = id);

-- trips Policies
create policy "Owner can manage own trips" on public.trips
  for all using (auth.uid() = user_id);

-- trip_bookings Policies
create policy "Owner can manage own trip bookings" on public.trip_bookings
  for all using (
    exists (
      select 1 from public.trips 
      where trips.id = trip_bookings.trip_id 
      and trips.user_id = auth.uid()
    )
  );

-- companion_matches Policies
create policy "User and companion can read own matches" on public.companion_matches
  for select using (auth.uid() = user_id or auth.uid() = companion_id);

create policy "User can insert own matches" on public.companion_matches
  for insert with check (auth.uid() = user_id);

create policy "User and companion can update own matches" on public.companion_matches
  for update using (auth.uid() = user_id or auth.uid() = companion_id);

-- chat_messages Policies
create policy "Sender or recipient can read messages" on public.chat_messages
  for select using (
    auth.uid() = sender_id 
    or auth.uid() = recipient_id 
    or (recipient_id is null and auth.role() = 'authenticated')
  );

create policy "Sender can insert messages" on public.chat_messages
  for insert with check (auth.uid() = sender_id);

-- ai_chat_logs Policies
create policy "User can manage own AI logs" on public.ai_chat_logs
  for all using (auth.uid() = user_id);

-- safety_alerts Policies
create policy "User can manage own safety alerts" on public.safety_alerts
  for all using (auth.uid() = user_id);

-- destinations (public read)
create policy "Allow public read access to destinations" on public.destinations
  for select using (true);

-- itineraries (public read)
create policy "Allow public read access to itineraries" on public.itineraries
  for select using (true);

-- wandr_zones (public read)
create policy "Allow public read access to wandr_zones" on public.wandr_zones
  for select using (true);

-- ==========================================
-- 4. Triggers
-- ==========================================

-- Trigger to automatically create a profile when auth.users is populated
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    coalesce(new.phone, '')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 5. Seed Data (Destinations & Sample Itineraries)
-- ==========================================

insert into public.destinations (slug, title, country, cover_image, description) values
('ziro', 'Ziro Valley', 'India', 'https://images.unsplash.com/photo-1588096344315-7dd1419a5a3a', 'Home to the Apatani tribe, famous for pine hills and the Ziro Music Festival.'),
('spiti', 'Spiti Valley', 'India', 'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec', 'A cold desert mountain valley located high in the Himalayas.'),
('meghalaya', 'Cherrapunji & Shillong', 'India', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e', 'The land of clouds, living root bridges, and heavy rainfall.'),
('hampi', 'Hampi Heritage Ruins', 'India', 'https://images.unsplash.com/photo-1600100397990-a4720d20ef3c', 'The majestic ancient ruins of the Vijayanagara Empire.'),
('ladakh', 'Leh Wilderness', 'India', 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2', 'A high-altitude region known for its dramatic mountain landscapes and Buddhist monasteries.'),
('munnar', 'Munnar Valleys', 'India', 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2', 'Rolling hills of tea plantations and mist-filled valleys.'),
('santorini', 'Santorini', 'Greece', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff', 'Sleek white architectures, blue domes, and stunning sunsets over the Aegean Sea.')
on conflict (slug) do nothing;
