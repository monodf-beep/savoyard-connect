-- S'assurer que la vue people_public est accessible publiquement
GRANT SELECT ON public.people_public TO anon, authenticated;

-- Vérifier aussi que section_members est accessible
GRANT SELECT ON public.section_members TO anon, authenticated;