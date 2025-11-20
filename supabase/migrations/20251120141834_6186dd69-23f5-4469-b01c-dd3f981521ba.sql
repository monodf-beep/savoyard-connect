-- Supprimer les assignments aux sections dupliquées
DELETE FROM section_members WHERE section_id IN ('7a3064dd-b7d1-44ef-842e-5397eae97060', '078d82af-40be-48af-9dbe-be900a965c7d');

-- Supprimer les sections dupliquées
DELETE FROM sections WHERE id = '7a3064dd-b7d1-44ef-842e-5397eae97060';
DELETE FROM sections WHERE id = '078d82af-40be-48af-9dbe-be900a965c7d';

-- Ajouter Margot au Groupe de travail Relations Externes avec Charlotte et Serena
INSERT INTO section_members (person_id, section_id) 
VALUES ('8a67ea9b-092b-4793-b356-15f707d7bb0e', '00000000-0000-0000-0000-000000000021')
ON CONFLICT DO NOTHING;