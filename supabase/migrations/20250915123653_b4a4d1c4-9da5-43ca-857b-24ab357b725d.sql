-- Vider d'abord la table pour éviter les doublons
TRUNCATE TABLE section_members;

-- Créer les liaisons selon l'organigramme
-- Bureau
INSERT INTO section_members (section_id, person_id, role) VALUES
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Arnaud' AND last_name = 'Frasse'), 'Président'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Alain' AND last_name = 'Favre'), 'Vice-président'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Marc' AND last_name = 'Bron'), 'Vice-président'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Secrétaire & Responsable des opérations'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Benjamin' AND last_name = 'Honegger'), 'Trésorier');

-- Conseil d'administration
INSERT INTO section_members (section_id, person_id, role) VALUES
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Arnaud' AND last_name = 'Frasse'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Alain' AND last_name = 'Favre'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Marc' AND last_name = 'Bron'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Benjamin' AND last_name = 'Honegger'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Rodolphe' AND last_name = 'Simon'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Pierre' AND last_name = 'Vincent'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Odile' AND last_name = 'Rousseau'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Régis' AND last_name = 'Vachoux'), 'Membre');