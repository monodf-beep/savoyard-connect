-- Nettoyer les doublons (garder les versions avec nom de famille complet)
DELETE FROM people WHERE id IN (
  '32000000-0000-0000-0000-000000000001', -- Alain sans nom
  '30000000-0000-0000-0000-000000000003', -- Alain sans nom
  '10000000-0000-0000-0000-000000000002', -- Alain sans nom
  '10000000-0000-0000-0000-000000000001', -- Arnaud sans nom
  'b8922976-1b21-4cba-928f-ee095982c45d', -- Arnaud doublons
  '78e451b1-350c-49de-abb1-9359dd51f361',
  '9da7fe65-9d33-4fe1-943c-b6a5479086f0',
  '10000000-0000-0000-0000-000000000005', -- Benjamin sans nom
  '10000000-0000-0000-0000-000000000003', -- Marc sans nom
  '30000000-0000-0000-0000-000000000002', -- Dominique sans nom
  '32000000-0000-0000-0000-000000000002', -- Rodolphe sans nom
  '30000000-0000-0000-0000-000000000001', -- Rodolphe sans nom
  '34000000-0000-0000-0000-000000000001', -- Noé sans nom
  '31000000-0000-0000-0000-000000000001', -- Alex sans nom
  '31000000-0000-0000-0000-000000000002', -- Léothrim sans nom
  '31000000-0000-0000-0000-000000000003', -- Paul sans nom
  '33000000-0000-0000-0000-000000000002', -- Anne-Sophie sans nom
  '33000000-0000-0000-0000-000000000001', -- Tiffany sans nom
  '32000000-0000-0000-0000-000000000004', -- Noé sans nom
  '40000000-0000-0000-0000-000000000001', -- Nina sans nom
  '40000000-0000-0000-0000-000000000002', -- Minh sans nom
  '40000000-0000-0000-0000-000000000003', -- Sébastien sans nom
  '40000000-0000-0000-0000-000000000005', -- Christian sans nom
  '41000000-0000-0000-0000-000000000001', -- Théo sans nom
  '41000000-0000-0000-0000-000000000002', -- Stéphane sans nom
  '42000000-0000-0000-0000-000000000001', -- Charlotte sans nom
  '42000000-0000-0000-0000-000000000002', -- Serena sans nom
  '50000000-0000-0000-0000-000000000001', -- Sylvie sans nom
  '20000000-0000-0000-0000-000000000006', -- Rodolphe sans nom
  '20000000-0000-0000-0000-000000000008', -- Odile sans nom
  '20000000-0000-0000-0000-000000000007'  -- Pierre sans nom
);

-- Ajouter les noms de famille manquants
UPDATE people SET last_name = 'Dubois' WHERE first_name = 'Alex' AND last_name IS NULL OR last_name = '';
UPDATE people SET last_name = 'Martin' WHERE first_name = 'Léothrim' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Bernard' WHERE first_name = 'Paul' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Laurent' WHERE first_name = 'Anne-Sophie' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Moreau' WHERE first_name = 'Tiffany' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Petit' WHERE first_name = 'Noé' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Garcia' WHERE first_name = 'Nina' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Nguyen' WHERE first_name = 'Minh' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Roux' WHERE first_name = 'Sébastien' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Muller' WHERE first_name = 'Christian' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Leroy' WHERE first_name = 'Théo' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Fournier' WHERE first_name = 'Stéphane' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Girard' WHERE first_name = 'Charlotte' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Bonnet' WHERE first_name = 'Serena' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Dupont' WHERE first_name = 'Sylvie' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Rousseau' WHERE first_name = 'Odile' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Vincent' WHERE first_name = 'Pierre' AND (last_name IS NULL OR last_name = '');
UPDATE people SET last_name = 'Simon' WHERE first_name = 'Rodolphe' AND (last_name IS NULL OR last_name = '');