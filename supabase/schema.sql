-- Create users table (extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create poems table
CREATE TABLE public.poems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  like_count INTEGER DEFAULT 0,
  dislike_count INTEGER DEFAULT 0
);

-- Create likes table
CREATE TABLE public.likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  poem_id UUID REFERENCES public.poems(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(user_id, poem_id)
);

-- Create follows table
CREATE TABLE public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  UNIQUE(follower_id, author_id)
);

-- Create reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  poem_id UUID REFERENCES public.poems(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Basic Policies (To be restricted later based on exact auth requirements)
CREATE POLICY "Public profiles are viewable by everyone." ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON public.users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Poems are viewable by everyone." ON public.poems FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert poems." ON public.poems FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Users can update own poems." ON public.poems FOR UPDATE USING (auth.uid() = author_id);
CREATE POLICY "Users can delete own poems." ON public.poems FOR DELETE USING (auth.uid() = author_id);

CREATE POLICY "Likes are viewable by everyone." ON public.likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can like." ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can unlike." ON public.likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Follows are viewable by everyone." ON public.follows FOR SELECT USING (true);
CREATE POLICY "Authenticated users can follow." ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow." ON public.follows FOR DELETE USING (auth.uid() = follower_id);

CREATE POLICY "Authenticated users can report poems." ON public.reports FOR INSERT WITH CHECK (auth.uid() = user_id);
