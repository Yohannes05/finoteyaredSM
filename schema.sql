-- schema.sql
-- Run this script in your Supabase SQL Editor

-- 1. Create Students Table (unified table — students AND deacons)
CREATE TABLE IF NOT EXISTS public.students (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    age INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female')),
    phone TEXT NOT NULL,
    photo_url TEXT,
    learning_topic TEXT,
    learning_stage INTEGER DEFAULT 1,
    academic_grade TEXT,
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    is_deacon BOOLEAN DEFAULT FALSE,
    ordination_date DATE,
    deacon_accepted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create Payments Table
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    extra_contribution NUMERIC DEFAULT 0,
    payment_date DATE DEFAULT CURRENT_DATE,
    for_month TEXT NOT NULL,
    status TEXT DEFAULT 'paid' CHECK (status IN ('paid', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Deacons table kept for legacy data migration (new registrations use students.is_deacon)
CREATE TABLE IF NOT EXISTS public.deacons (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    phone TEXT,
    photo_url TEXT,
    ordination_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Create Deacon Schedules Table (references students now)
CREATE TABLE IF NOT EXISTS public.deacon_schedules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    deacon_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'served', 'cancelled')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deacons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deacon_schedules ENABLE ROW LEVEL SECURITY;

-- 7. Create Policies (Since Admin is the only actor, allow all for authenticated users)
-- 7. Create Policies (Since Admin is the only actor, allow all for authenticated users)
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.students;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.payments;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.attendance;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.deacons;
DROP POLICY IF EXISTS "Allow full access to authenticated users" ON public.deacon_schedules;

CREATE POLICY "Allow full access to authenticated users" ON public.students FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON public.payments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON public.attendance FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON public.deacons FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow full access to authenticated users" ON public.deacon_schedules FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 8. Storage Bucket for Avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 8a. Enforce 10MB max file size on the avatars bucket (server-side)
UPDATE storage.buckets
SET file_size_limit = 10485760
WHERE id = 'avatars';

DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
DROP POLICY IF EXISTS "Anyone can upload an avatar." ON storage.objects;

CREATE POLICY "Avatar images are publicly accessible." ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can upload an avatar." ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
