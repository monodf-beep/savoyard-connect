-- Create storage bucket for organization logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('organization-logos', 'organization-logos', true);

-- Create RLS policies for logo bucket
CREATE POLICY "Public can view organization logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

CREATE POLICY "Admins can upload organization logos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'organization-logos' 
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can update organization logos"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'organization-logos'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

CREATE POLICY "Admins can delete organization logos"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'organization-logos'
  AND auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- Create organization settings table
CREATE TABLE organization_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Mon Association',
  logo_url TEXT,
  primary_color TEXT NOT NULL DEFAULT '222.2 47.4% 11.2%',
  secondary_color TEXT NOT NULL DEFAULT '210 40% 96.1%',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read organization settings
CREATE POLICY "Everyone can view organization settings"
ON organization_settings FOR SELECT
USING (true);

-- Only admins can update organization settings
CREATE POLICY "Admins can update organization settings"
ON organization_settings FOR UPDATE
USING (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- Only admins can insert organization settings
CREATE POLICY "Admins can insert organization settings"
ON organization_settings FOR INSERT
WITH CHECK (
  auth.uid() IN (
    SELECT user_id FROM user_roles WHERE role = 'admin'
  )
);

-- Create default settings
INSERT INTO organization_settings (name, primary_color, secondary_color)
VALUES ('Mon Association', '222.2 47.4% 11.2%', '210 40% 96.1%');

-- Create trigger for updated_at
CREATE TRIGGER update_organization_settings_updated_at
BEFORE UPDATE ON organization_settings
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();