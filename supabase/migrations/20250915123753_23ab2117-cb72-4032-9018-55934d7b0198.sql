-- Créer les personnes manquantes une par une pour éviter les doublons
INSERT INTO people (first_name, last_name, title) 
SELECT 'Rodolphe', 'Simon', 'Responsable Commission Littérature'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Rodolphe' AND last_name = 'Simon');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Pierre', 'Vincent', 'Membre Conseil'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Pierre' AND last_name = 'Vincent');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Odile', 'Rousseau', 'Membre Conseil'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Odile' AND last_name = 'Rousseau');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Alex', 'Dubois', 'Membre Commission Toponymie'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Alex' AND last_name = 'Dubois');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Léothrim', 'Martin', 'Membre Commission Toponymie'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Léothrim' AND last_name = 'Martin');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Paul', 'Bernard', 'Membre Commission Toponymie'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Paul' AND last_name = 'Bernard');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Noé', 'Petit', 'Responsable Commission Néologisme'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Noé' AND last_name = 'Petit');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Tiffany', 'Moreau', 'Membre Sous-groupe Ingénierie'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Tiffany' AND last_name = 'Moreau');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Anne-Sophie', 'Laurent', 'Membre Sous-groupe Ingénierie'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Anne-Sophie' AND last_name = 'Laurent');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Nina', 'Garcia', 'Graphiste'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Nina' AND last_name = 'Garcia');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Minh', 'Nguyen', 'Expert SEO'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Minh' AND last_name = 'Nguyen');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Sébastien', 'Roux', 'Expert SEO'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Sébastien' AND last_name = 'Roux');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Christian', 'Muller', 'Responsable Wikimedia'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Christian' AND last_name = 'Muller');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Théo', 'Leroy', 'Développeur web'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Théo' AND last_name = 'Leroy');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Stéphane', 'Fournier', 'Développeur web, UX/UI'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Stéphane' AND last_name = 'Fournier');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Charlotte', 'Girard', 'Relations bibliothèques/musées'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Charlotte' AND last_name = 'Girard');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Serena', 'Bonnet', 'Relations université'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Serena' AND last_name = 'Bonnet');

INSERT INTO people (first_name, last_name, title) 
SELECT 'Sylvie', 'Dupont', 'Bénévole RH'
WHERE NOT EXISTS (SELECT 1 FROM people WHERE first_name = 'Sylvie' AND last_name = 'Dupont');