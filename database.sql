-- Create a table for collaborative trip sessions
CREATE TABLE IF NOT EXISTS public.shared_trips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security for shared_trips
ALTER TABLE public.shared_trips ENABLE ROW LEVEL SECURITY;

-- Policies for shared_trips
CREATE POLICY "Allow public read access" ON public.shared_trips
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON public.shared_trips
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON public.shared_trips
    FOR UPDATE USING (true);

-- Create a table for user profiles to store badges
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    badges text[] DEFAULT '{}',
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile." ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile." ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Trigger to automatically create a profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
