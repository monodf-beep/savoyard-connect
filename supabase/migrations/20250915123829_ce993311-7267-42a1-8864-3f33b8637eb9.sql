-- Créer toutes les liaisons section-membres
INSERT INTO section_members (section_id, person_id, role) VALUES
-- Bureau
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Arnaud' AND last_name = 'Frasse'), 'Président'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Alain' AND last_name = 'Favre'), 'Vice-président'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Marc' AND last_name = 'Bron'), 'Vice-président'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Secrétaire & Responsable des opérations'),
('00000000-0000-0000-0000-000000000001', (SELECT id FROM people WHERE first_name = 'Benjamin' AND last_name = 'Honegger'), 'Trésorier'),

-- Conseil d'administration
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Arnaud' AND last_name = 'Frasse'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Alain' AND last_name = 'Favre'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Marc' AND last_name = 'Bron'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Benjamin' AND last_name = 'Honegger'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Rodolphe' AND last_name = 'Simon'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Pierre' AND last_name = 'Vincent'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Odile' AND last_name = 'Rousseau'), 'Membre'),
('00000000-0000-0000-0000-000000000002', (SELECT id FROM people WHERE first_name = 'Régis' AND last_name = 'Vachoux'), 'Membre'),

-- Commission Littérature
('00000000-0000-0000-0000-000000000010', (SELECT id FROM people WHERE first_name = 'Rodolphe' AND last_name = 'Simon'), 'Responsable'),
('00000000-0000-0000-0000-000000000010', (SELECT id FROM people WHERE first_name = 'Dominique' AND last_name = 'Stich'), 'Membre'),
('00000000-0000-0000-0000-000000000010', (SELECT id FROM people WHERE first_name = 'Alain' AND last_name = 'Favre'), 'Membre'),
('00000000-0000-0000-0000-000000000010', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Membre'),

-- Commission Toponymie
('00000000-0000-0000-0000-000000000011', (SELECT id FROM people WHERE first_name = 'Alex' AND last_name = 'Dubois'), 'Membre'),
('00000000-0000-0000-0000-000000000011', (SELECT id FROM people WHERE first_name = 'Léothrim' AND last_name = 'Martin'), 'Membre'),
('00000000-0000-0000-0000-000000000011', (SELECT id FROM people WHERE first_name = 'Paul' AND last_name = 'Bernard'), 'Membre'),
('00000000-0000-0000-0000-000000000011', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Membre'),

-- Commission Pédagogie
('00000000-0000-0000-0000-000000000012', (SELECT id FROM people WHERE first_name = 'Alain' AND last_name = 'Favre'), 'Responsable'),
('00000000-0000-0000-0000-000000000012', (SELECT id FROM people WHERE first_name = 'Rodolphe' AND last_name = 'Simon'), 'Membre'),
('00000000-0000-0000-0000-000000000012', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Membre'),
('00000000-0000-0000-0000-000000000012', (SELECT id FROM people WHERE first_name = 'Noé' AND last_name = 'Petit'), 'Membre'),

-- Sous-groupe Ingénierie Pédagogie
('00000000-0000-0000-0000-000000000014', (SELECT id FROM people WHERE first_name = 'Tiffany' AND last_name = 'Moreau'), 'Membre'),
('00000000-0000-0000-0000-000000000014', (SELECT id FROM people WHERE first_name = 'Anne-Sophie' AND last_name = 'Laurent'), 'Membre'),
('00000000-0000-0000-0000-000000000014', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Membre'),

-- Commission Néologisme
('00000000-0000-0000-0000-000000000013', (SELECT id FROM people WHERE first_name = 'Noé' AND last_name = 'Petit'), 'Responsable'),
('00000000-0000-0000-0000-000000000013', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Membre'),

-- Groupe de travail Communication
('00000000-0000-0000-0000-000000000020', (SELECT id FROM people WHERE first_name = 'Nina' AND last_name = 'Garcia'), 'Membre (graphiste)'),
('00000000-0000-0000-0000-000000000020', (SELECT id FROM people WHERE first_name = 'Minh' AND last_name = 'Nguyen'), 'Membre (expert SEO)'),
('00000000-0000-0000-0000-000000000020', (SELECT id FROM people WHERE first_name = 'Sébastien' AND last_name = 'Roux'), 'Membre (expert SEO)'),
('00000000-0000-0000-0000-000000000020', (SELECT id FROM people WHERE first_name = 'Franck' AND last_name = 'Monod'), 'Membre'),
('00000000-0000-0000-0000-000000000020', (SELECT id FROM people WHERE first_name = 'Christian' AND last_name = 'Muller'), 'Membre (responsable Wikimedia)'),

-- Sous-groupe Développement Web
('00000000-0000-0000-0000-000000000022', (SELECT id FROM people WHERE first_name = 'Théo' AND last_name = 'Leroy'), 'Membre (développeur web)'),
('00000000-0000-0000-0000-000000000022', (SELECT id FROM people WHERE first_name = 'Stéphane' AND last_name = 'Fournier'), 'Membre (développeur web, UX/UI)'),

-- Groupe de travail Relations Externes
('00000000-0000-0000-0000-000000000021', (SELECT id FROM people WHERE first_name = 'Charlotte' AND last_name = 'Girard'), 'Membre (bibliothèques, musées, librairies)'),
('00000000-0000-0000-0000-000000000021', (SELECT id FROM people WHERE first_name = 'Serena' AND last_name = 'Bonnet'), 'Membre (université)'),

-- Statut particulier
('00000000-0000-0000-0000-000000000005', (SELECT id FROM people WHERE first_name = 'Sylvie' AND last_name = 'Dupont'), 'Bénévole chargée des ressources humaines');