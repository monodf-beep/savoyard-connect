-- Créer les personnes manquantes
INSERT INTO people (first_name, last_name, title) VALUES
('Rodolphe', 'Simon', 'Responsable Commission Littérature'),
('Pierre', 'Vincent', 'Membre Conseil'),
('Odile', 'Rousseau', 'Membre Conseil'),
('Alex', 'Dubois', 'Membre Commission Toponymie'),
('Léothrim', 'Martin', 'Membre Commission Toponymie'),
('Paul', 'Bernard', 'Membre Commission Toponymie'),
('Noé', 'Petit', 'Responsable Commission Néologisme'),
('Tiffany', 'Moreau', 'Membre Sous-groupe Ingénierie'),
('Anne-Sophie', 'Laurent', 'Membre Sous-groupe Ingénierie'),
('Nina', 'Garcia', 'Graphiste'),
('Minh', 'Nguyen', 'Expert SEO'),
('Sébastien', 'Roux', 'Expert SEO'),
('Christian', 'Muller', 'Responsable Wikimedia'),
('Théo', 'Leroy', 'Développeur web'),
('Stéphane', 'Fournier', 'Développeur web, UX/UI'),
('Charlotte', 'Girard', 'Relations bibliothèques/musées'),
('Serena', 'Bonnet', 'Relations université'),
('Sylvie', 'Dupont', 'Bénévole RH')
ON CONFLICT (first_name, last_name) DO NOTHING;