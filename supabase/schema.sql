-- Create custom types for branch and type
CREATE TYPE legal_branch AS ENUM ('Income Tax', 'VAT', 'Customs');
CREATE TYPE legal_doc_type AS ENUM ('ACT', 'SRO', 'GO', 'SO', 'Circular');

-- Create the legal_documents table
CREATE TABLE legal_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  branch legal_branch NOT NULL,
  type legal_doc_type NOT NULL,
  year INTEGER NOT NULL,
  content TEXT NOT NULL, -- Supports Markdown
  section_reference TEXT,
  effective_date DATE,
  is_latest BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Add full-text search index for titles and content
CREATE INDEX legal_docs_search_idx ON legal_documents USING GIN (to_tsvector('english', title || ' ' || content));

-- Enable Row Level Security
ALTER TABLE legal_documents ENABLE ROW LEVEL SECURITY;

-- Create policy for public read-only access
CREATE POLICY "Allow public read-only access"
ON legal_documents
FOR SELECT
TO public
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_legal_documents_updated_at
BEFORE UPDATE ON legal_documents
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- =============================================
-- PROFILES TABLE & AUTH SYSTEM
-- =============================================

-- Create profiles table linked to Supabase Auth
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update any profile's role
CREATE POLICY "Admins can update profiles"
ON profiles FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- =============================================

-- Trigger function: first user gets 'admin', rest get 'user'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_count INTEGER;
  user_role TEXT;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  IF user_count = 0 THEN
    user_role := 'admin';
  ELSE
    user_role := 'user';
  END IF;

  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, user_role);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- ADMIN POLICIES FOR LEGAL DOCUMENTS
-- =============================================

-- Admins can insert documents
CREATE POLICY "Admins can insert documents"
ON legal_documents FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can update documents
CREATE POLICY "Admins can update documents"
ON legal_documents FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Admins can delete documents
CREATE POLICY "Admins can delete documents"
ON legal_documents FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
  )
);
