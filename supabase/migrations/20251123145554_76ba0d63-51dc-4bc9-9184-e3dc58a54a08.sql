-- Ajouter le rôle section_leader à l'enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'section_leader';

-- Fonction pour vérifier si un utilisateur est leader d'une section spécifique
CREATE OR REPLACE FUNCTION public.is_section_leader(_user_id uuid, _section_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.sections s
    INNER JOIN public.people p ON s.leader_id = p.id
    INNER JOIN auth.users u ON p.email = u.email
    WHERE u.id = _user_id AND s.id = _section_id
  )
$$;

-- Fonction pour obtenir toutes les sections dont un utilisateur est leader
CREATE OR REPLACE FUNCTION public.get_user_led_sections(_user_id uuid)
RETURNS TABLE(section_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.id as section_id
  FROM public.sections s
  INNER JOIN public.people p ON s.leader_id = p.id
  INNER JOIN auth.users u ON p.email = u.email
  WHERE u.id = _user_id
$$;

-- Ajouter une colonne status et created_by aux projets pour gérer les approbations
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Ajouter colonnes similaires aux value_chains
ALTER TABLE public.value_chains
ADD COLUMN IF NOT EXISTS approved_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- RLS Policies pour projects
DROP POLICY IF EXISTS "Section leaders can view their section projects" ON public.projects;
CREATE POLICY "Section leaders can view their section projects"
ON public.projects FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.is_section_leader(auth.uid(), section_id)
);

DROP POLICY IF EXISTS "Section leaders can create projects" ON public.projects;
CREATE POLICY "Section leaders can create projects"
ON public.projects FOR INSERT
TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin') OR
  public.is_section_leader(auth.uid(), section_id)
);

DROP POLICY IF EXISTS "Section leaders can update their section projects" ON public.projects;
CREATE POLICY "Section leaders can update their section projects"
ON public.projects FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  (public.is_section_leader(auth.uid(), section_id) AND approval_status = 'approved')
);

DROP POLICY IF EXISTS "Admins can approve projects" ON public.projects;
CREATE POLICY "Admins can approve projects"
ON public.projects FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Section leaders can delete their approved projects" ON public.projects;
CREATE POLICY "Section leaders can delete their approved projects"
ON public.projects FOR DELETE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  (public.is_section_leader(auth.uid(), section_id) AND approval_status = 'approved')
);

-- RLS Policies pour section_members
DROP POLICY IF EXISTS "Section leaders can manage their section members" ON public.section_members;
CREATE POLICY "Section leaders can manage their section members"
ON public.section_members FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.is_section_leader(auth.uid(), section_id)
);

-- RLS Policies pour vacant_positions (recherche de bénévoles)
DROP POLICY IF EXISTS "Section leaders can manage vacant positions" ON public.vacant_positions;
CREATE POLICY "Section leaders can manage vacant positions"
ON public.vacant_positions FOR ALL
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.is_section_leader(auth.uid(), section_id)
);

-- RLS Policies pour spontaneous_applications
DROP POLICY IF EXISTS "Section leaders can view applications for their sections" ON public.spontaneous_applications;
CREATE POLICY "Section leaders can view applications for their sections"
ON public.spontaneous_applications FOR SELECT
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.is_section_leader(auth.uid(), section_id)
);

DROP POLICY IF EXISTS "Section leaders can update applications for their sections" ON public.spontaneous_applications;
CREATE POLICY "Section leaders can update applications for their sections"
ON public.spontaneous_applications FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.is_section_leader(auth.uid(), section_id)
);

-- RLS Policies pour people (section leaders peuvent modifier les profils de leurs membres)
DROP POLICY IF EXISTS "Section leaders can update their section members profiles" ON public.people;
CREATE POLICY "Section leaders can update their section members profiles"
ON public.people FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  EXISTS (
    SELECT 1 FROM public.section_members sm
    WHERE sm.person_id = people.id
    AND public.is_section_leader(auth.uid(), sm.section_id)
  )
);

-- RLS Policies pour sections (section leaders peuvent modifier leur section)
DROP POLICY IF EXISTS "Section leaders can update their section" ON public.sections;
CREATE POLICY "Section leaders can update their section"
ON public.sections FOR UPDATE
TO authenticated
USING (
  public.has_role(auth.uid(), 'admin') OR
  public.is_section_leader(auth.uid(), id)
);