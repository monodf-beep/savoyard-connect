-- Ajouter un champ pour contrôler l'ordre d'affichage
ALTER TABLE sections ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Définir l'ordre d'affichage selon les spécifications
UPDATE sections SET display_order = 1 WHERE title = 'Bureau';
UPDATE sections SET display_order = 2 WHERE title = 'Conseil d''administration';
UPDATE sections SET display_order = 3 WHERE title = 'Commissions';
UPDATE sections SET display_order = 4 WHERE title = 'Groupes de travail';
UPDATE sections SET display_order = 5 WHERE title = 'Statut particulier';

-- Mettre toutes les sections principales à expanded par défaut pour vérifier le fonctionnement
UPDATE sections SET is_expanded = true WHERE parent_id IS NULL;