-- Disable RLS on orders and profiles to allow our secure backend API routes to manage them
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
