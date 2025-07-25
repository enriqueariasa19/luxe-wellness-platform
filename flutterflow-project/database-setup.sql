-- Luxe Wellness Membership Platform - Supabase Database Setup
-- Run these commands in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  profile_image_url TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Memberships table
CREATE TABLE public.memberships (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE NOT NULL,
  tier TEXT CHECK (tier IN ('silver', 'gold', 'platinum')) NOT NULL,
  balance INTEGER DEFAULT 0, -- stored in cents
  currency TEXT DEFAULT 'MXN',
  discount_percentage INTEGER NOT NULL,
  vip_events_remaining INTEGER NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  amount INTEGER NOT NULL, -- stored in cents
  currency TEXT DEFAULT 'MXN',
  type TEXT CHECK (type IN ('debit', 'credit', 'refund')) NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT, -- for tracking purchases/services
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- VIP Events table
CREATE TABLE public.vip_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  required_tier TEXT CHECK (required_tier IN ('silver', 'gold', 'platinum')) NOT NULL,
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  image_url TEXT,
  location TEXT,
  price INTEGER DEFAULT 0, -- stored in cents, 0 for free events
  currency TEXT DEFAULT 'MXN',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Event Bookings table
CREATE TABLE public.event_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.vip_events(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  booking_status TEXT CHECK (booking_status IN ('confirmed', 'cancelled', 'waitlist')) DEFAULT 'confirmed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(event_id, user_id)
);

-- Welcome Gifts table
CREATE TABLE public.welcome_gifts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tier TEXT CHECK (tier IN ('silver', 'gold', 'platinum')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  value INTEGER, -- stored in cents
  currency TEXT DEFAULT 'MXN',
  image_url TEXT,
  is_claimed_by_default BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Services table (for booking treatments)
CREATE TABLE public.services (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- stored in cents
  currency TEXT DEFAULT 'MXN',
  duration_minutes INTEGER,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service Bookings table
CREATE TABLE public.service_bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id UUID REFERENCES public.services(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')) DEFAULT 'scheduled',
  notes TEXT,
  final_price INTEGER, -- after discounts
  currency TEXT DEFAULT 'MXN',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security (RLS) Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_bookings ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Memberships policies
CREATE POLICY "Users can view own membership" ON public.memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all memberships" ON public.memberships
  FOR ALL USING (
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" ON public.transactions
  FOR ALL USING (
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Event bookings policies
CREATE POLICY "Users can view own bookings" ON public.event_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own bookings" ON public.event_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bookings" ON public.event_bookings
  FOR ALL USING (
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Service bookings policies
CREATE POLICY "Users can view own service bookings" ON public.service_bookings
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own service bookings" ON public.service_bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all service bookings" ON public.service_bookings
  FOR ALL USING (
    EXISTS(SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Public read policies for reference tables
CREATE POLICY "Anyone can view VIP events" ON public.vip_events
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view welcome gifts" ON public.welcome_gifts
  FOR SELECT USING (TRUE);

CREATE POLICY "Anyone can view services" ON public.services
  FOR SELECT USING (TRUE);

-- Functions for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, profile_image_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to create membership when user signs up
CREATE OR REPLACE FUNCTION public.create_default_membership()
RETURNS TRIGGER AS $$
BEGIN
  -- Create a default Silver membership for new users
  INSERT INTO public.memberships (user_id, tier, balance, discount_percentage, vip_events_remaining, expires_at)
  VALUES (
    NEW.id,
    'silver',
    1200000, -- $12,000 MXN in cents
    5,
    1,
    NOW() + INTERVAL '1 year'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic membership creation
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE public.create_default_membership();

-- Insert sample data
INSERT INTO public.welcome_gifts (tier, title, description, value, currency) VALUES
('silver', 'Welcome Facial', 'Complimentary signature facial treatment', 150000, 'MXN'),
('silver', 'Wellness Consultation', 'Free consultation with our wellness expert', 80000, 'MXN'),
('gold', 'Premium Massage', '90-minute full body massage', 250000, 'MXN'),
('gold', 'Skincare Kit', 'Luxury skincare products starter kit', 200000, 'MXN'),
('gold', 'Nutritional Assessment', 'Complete dietary analysis and plan', 120000, 'MXN'),
('platinum', 'Spa Day Experience', 'Full day luxury spa package', 500000, 'MXN'),
('platinum', 'Personal Training', '5 sessions with personal trainer', 300000, 'MXN'),
('platinum', 'Executive Health Check', 'Comprehensive health screening', 400000, 'MXN');

INSERT INTO public.services (name, description, price, duration_minutes, category) VALUES
('Signature Facial', 'Deep cleansing and rejuvenating facial treatment', 150000, 90, 'Facial'),
('Swedish Massage', 'Relaxing full body massage', 180000, 60, 'Massage'),
('Deep Tissue Massage', 'Therapeutic muscle tension relief', 220000, 90, 'Massage'),
('Anti-Aging Treatment', 'Advanced skincare for mature skin', 280000, 120, 'Facial'),
('Body Wrap', 'Detoxifying and moisturizing body treatment', 200000, 90, 'Body'),
('Manicure & Pedicure', 'Complete nail care service', 120000, 120, 'Nails'),
('Hair Styling', 'Professional hair cut and styling', 150000, 90, 'Hair'),
('Couples Massage', 'Relaxing massage for two', 350000, 90, 'Massage');

INSERT INTO public.vip_events (title, description, date, required_tier, max_attendees, location) VALUES
('Wine & Wellness Evening', 'Exclusive wine tasting with wellness expert talks', NOW() + INTERVAL '2 weeks', 'silver', 30, 'Main Lounge'),
('Luxury Skincare Workshop', 'Learn professional skincare techniques', NOW() + INTERVAL '3 weeks', 'gold', 20, 'Treatment Room A'),
('Executive Health Seminar', 'Advanced wellness strategies for busy professionals', NOW() + INTERVAL '1 month', 'platinum', 15, 'Private Dining Room'),
('Meditation & Mindfulness Retreat', 'Half-day wellness retreat experience', NOW() + INTERVAL '5 weeks', 'gold', 25, 'Wellness Garden'),
('Platinum Members Gala', 'Exclusive annual celebration dinner', NOW() + INTERVAL '2 months', 'platinum', 50, 'Grand Ballroom');

-- Create indexes for better performance
CREATE INDEX idx_memberships_user_id ON public.memberships(user_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_event_bookings_user_id ON public.event_bookings(user_id);
CREATE INDEX idx_event_bookings_event_id ON public.event_bookings(event_id);
CREATE INDEX idx_service_bookings_user_id ON public.service_bookings(user_id);
CREATE INDEX idx_vip_events_date ON public.vip_events(date);
CREATE INDEX idx_vip_events_required_tier ON public.vip_events(required_tier);