-- Create a table for collaborative trip sessions
CREATE TABLE IF NOT EXISTS public.shared_trips (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    trip_data jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on Row Level Security
ALTER TABLE public.shared_trips ENABLE ROW LEVEL SECURITY;

-- Allow anyone with the link to read the shared trip (SELECT)
CREATE POLICY "Allow public read access" ON public.shared_trips
    FOR SELECT USING (true);

-- Allow anyone to create a new shared trip link (INSERT)
CREATE POLICY "Allow public insert access" ON public.shared_trips
    FOR INSERT WITH CHECK (true);

-- Allow anyone with the link to edit the shared trip (UPDATE)
CREATE POLICY "Allow public update access" ON public.shared_trips
    FOR UPDATE USING (true);
