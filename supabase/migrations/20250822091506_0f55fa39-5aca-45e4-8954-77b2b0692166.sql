-- Créer une table de liaison pour gérer les membres dans plusieurs sections
CREATE TABLE public.section_members (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    section_id uuid REFERENCES public.sections(id) ON DELETE CASCADE NOT NULL,
    person_id uuid REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
    role text, -- 'Responsable', 'Membre', 'Président', etc.
    created_at timestamp with time zone DEFAULT now(),
    UNIQUE(section_id, person_id)
);

-- Activer RLS
ALTER TABLE public.section_members ENABLE ROW LEVEL SECURITY;

-- Politique pour l'accès public
CREATE POLICY "Section members are publicly accessible" 
ON public.section_members 
FOR ALL 
USING (true);

-- Supprimer la colonne section_id de la table people car nous utilisons maintenant la table de liaison
ALTER TABLE public.people DROP COLUMN section_id;