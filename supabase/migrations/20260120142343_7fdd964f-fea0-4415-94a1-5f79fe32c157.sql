-- Create enum for association member roles
CREATE TYPE public.association_role AS ENUM ('owner', 'admin', 'gestionnaire', 'contributeur', 'membre');

-- Create association_members table linking users to associations with roles
CREATE TABLE public.association_members (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
    role association_role NOT NULL DEFAULT 'membre',
    person_id UUID REFERENCES public.people(id) ON DELETE SET NULL,
    invited_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    invited_at TIMESTAMP WITH TIME ZONE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, association_id)
);

-- Enable RLS
ALTER TABLE public.association_members ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check association membership
CREATE OR REPLACE FUNCTION public.is_association_member(_user_id UUID, _association_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.association_members
        WHERE user_id = _user_id AND association_id = _association_id
    )
$$;

-- Create security definer function to check association role
CREATE OR REPLACE FUNCTION public.has_association_role(_user_id UUID, _association_id UUID, _role association_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.association_members
        WHERE user_id = _user_id 
          AND association_id = _association_id 
          AND role = _role
    )
$$;

-- Create function to check if user is admin or owner of association
CREATE OR REPLACE FUNCTION public.is_association_admin(_user_id UUID, _association_id UUID)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.association_members
        WHERE user_id = _user_id 
          AND association_id = _association_id 
          AND role IN ('owner', 'admin')
    )
$$;

-- RLS Policies for association_members

-- Users can view members of associations they belong to
CREATE POLICY "Users can view members of their associations"
ON public.association_members
FOR SELECT
TO authenticated
USING (
    public.is_association_member(auth.uid(), association_id)
);

-- Admins and owners can insert new members (invitations)
CREATE POLICY "Admins can invite members"
ON public.association_members
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_association_admin(auth.uid(), association_id)
);

-- Admins can update member roles (except for owners)
CREATE POLICY "Admins can update member roles"
ON public.association_members
FOR UPDATE
TO authenticated
USING (
    public.is_association_admin(auth.uid(), association_id)
    AND role != 'owner'
);

-- Admins can remove members (except owners)
CREATE POLICY "Admins can remove members"
ON public.association_members
FOR DELETE
TO authenticated
USING (
    public.is_association_admin(auth.uid(), association_id)
    AND role != 'owner'
);

-- Create association invitations table for pending invitations
CREATE TABLE public.association_invitations (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    association_id UUID NOT NULL REFERENCES public.associations(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role association_role NOT NULL DEFAULT 'membre',
    token TEXT NOT NULL UNIQUE,
    invited_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + interval '7 days'),
    accepted_at TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(association_id, email, status)
);

-- Enable RLS
ALTER TABLE public.association_invitations ENABLE ROW LEVEL SECURITY;

-- Policies for association_invitations
CREATE POLICY "Admins can view invitations"
ON public.association_invitations
FOR SELECT
TO authenticated
USING (
    public.is_association_admin(auth.uid(), association_id)
);

CREATE POLICY "Admins can create invitations"
ON public.association_invitations
FOR INSERT
TO authenticated
WITH CHECK (
    public.is_association_admin(auth.uid(), association_id)
);

CREATE POLICY "Admins can update invitations"
ON public.association_invitations
FOR UPDATE
TO authenticated
USING (
    public.is_association_admin(auth.uid(), association_id)
);

-- Add user_id column to people table to link volunteers to auth users
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_people_user_id ON public.people(user_id);

-- Create updated_at trigger for association_members
CREATE TRIGGER update_association_members_updated_at
BEFORE UPDATE ON public.association_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Migrate existing owner_id relationships to association_members
INSERT INTO public.association_members (user_id, association_id, role, joined_at)
SELECT owner_id, id, 'owner'::association_role, created_at
FROM public.associations
WHERE owner_id IS NOT NULL
ON CONFLICT (user_id, association_id) DO NOTHING;