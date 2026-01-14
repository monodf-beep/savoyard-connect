-- ===========================================
-- ASSOCIATIONS TABLE FOR MULTI-ASSO SUPPORT
-- ===========================================

-- Create user_profiles table for extended user info
CREATE TABLE public.user_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  region TEXT, -- Savoie, VdA, Piémont, Alpes-Maritimes
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create associations table
CREATE TABLE public.associations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  siret TEXT,
  rna TEXT,
  naf_ape TEXT,
  logo_url TEXT,
  instagram_url TEXT,
  linkedin_url TEXT,
  statuts_url TEXT, -- PDF statuts document
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create trigger for updated_at on associations
CREATE OR REPLACE FUNCTION public.update_association_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_associations_updated_at
  BEFORE UPDATE ON public.associations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_association_updated_at();

-- Create trigger for updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_association_updated_at();

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.associations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for associations
CREATE POLICY "Users can view their own associations"
  ON public.associations
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own associations"
  ON public.associations
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own associations"
  ON public.associations
  FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own associations"
  ON public.associations
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Storage buckets for logos and documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('association-logos', 'association-logos', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('association-documents', 'association-documents', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for logos (public bucket)
CREATE POLICY "Anyone can view association logos"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'association-logos');

CREATE POLICY "Users can upload their own logos"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'association-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own logos"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'association-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own logos"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'association-logos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for documents (private bucket)
CREATE POLICY "Users can view their own documents"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'association-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'association-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own documents"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'association-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'association-documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to auto-create profile
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();