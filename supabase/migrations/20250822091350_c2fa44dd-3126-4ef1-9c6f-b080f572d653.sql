-- Supprimer les doublons de Franck (garder seulement la version avec section_id et nom complet)
DELETE FROM people 
WHERE first_name = 'Franck' 
  AND (
    last_name IS NULL 
    OR last_name = '' 
    OR (last_name = 'Monod' AND section_id IS NULL)
  );

-- Vérifier qu'il ne reste que les bonnes entrées
-- (celle avec section_id et nom complet)