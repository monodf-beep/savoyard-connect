-- Créer la table section_members si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.section_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id uuid REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    person_id uuid REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
    role text,
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(section_id, person_id)
);

-- Activer RLS si ce n'est pas déjà fait
ALTER TABLE public.section_members ENABLE ROW LEVEL SECURITY;

-- Créer la politique si elle n'existe pas déjà
DROP POLICY IF EXISTS "Section members are publicly accessible" ON public.section_members;
CREATE POLICY "Section members are publicly accessible" 
ON public.section_members 
FOR ALL 
USING (true);