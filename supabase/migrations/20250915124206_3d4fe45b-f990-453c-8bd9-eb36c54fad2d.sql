-- Ajouter des champs supplémentaires à la table people
ALTER TABLE people 
ADD COLUMN IF NOT EXISTS formation TEXT,
ADD COLUMN IF NOT EXISTS experience TEXT,
ADD COLUMN IF NOT EXISTS competences TEXT[],
ADD COLUMN IF NOT EXISTS date_entree DATE,
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS specialite TEXT,
ADD COLUMN IF NOT EXISTS langues TEXT[],
ADD COLUMN IF NOT EXISTS hobbies TEXT;

-- Mettre à jour quelques profils avec des informations détaillées
UPDATE people SET 
  formation = 'École Normale Supérieure de Lyon, Agrégation de Lettres',
  experience = '15 ans d''expérience dans l''enseignement et la recherche linguistique',
  competences = ARRAY['Linguistique historique', 'Dialectologie', 'Enseignement', 'Recherche'],
  date_entree = '2020-01-15',
  adresse = 'Annecy, Haute-Savoie',
  specialite = 'Linguistique savoyarde',
  langues = ARRAY['Français', 'Savoyard', 'Italien', 'Anglais'],
  hobbies = 'Randonnée en montagne, lecture, musique traditionnelle',
  bio = 'Président de l''Institut de la Langue Savoyarde depuis 2020. Passionné par la préservation et la promotion du patrimoine linguistique savoyard.',
  email = 'arnaud.frasse@ils-savoie.org'
WHERE first_name = 'Arnaud' AND last_name = 'Frasse';

UPDATE people SET 
  formation = 'Université de Savoie, Master en Linguistique',
  experience = '12 ans dans l''enseignement du français et des langues régionales',
  competences = ARRAY['Pédagogie', 'Didactique des langues', 'Formation d''adultes'],
  date_entree = '2021-03-01',
  adresse = 'Chambéry, Savoie',
  specialite = 'Pédagogie des langues régionales',
  langues = ARRAY['Français', 'Savoyard', 'Occitan', 'Espagnol'],
  hobbies = 'Théâtre amateur, cuisine savoyarde',
  bio = 'Vice-président et responsable de la Commission Pédagogie. Développe des méthodes innovantes pour l''enseignement du savoyard.',
  email = 'alain.favre@ils-savoie.org'
WHERE first_name = 'Alain' AND last_name = 'Favre';

UPDATE people SET 
  formation = 'Sciences Po Grenoble, Master en Administration Publique',
  experience = '18 ans dans l''administration territoriale',
  competences = ARRAY['Gestion administrative', 'Communication institutionnelle', 'Relations publiques'],
  date_entree = '2020-06-01',
  adresse = 'Aix-les-Bains, Savoie',
  specialite = 'Administration et communication',
  langues = ARRAY['Français', 'Savoyard', 'Allemand'],
  hobbies = 'Cyclisme, photographie de paysages alpins',
  bio = 'Vice-président chargé des relations institutionnelles. Ancien fonctionnaire territorial.',
  email = 'marc.bron@ils-savoie.org'
WHERE first_name = 'Marc' AND last_name = 'Bron';

UPDATE people SET 
  formation = 'ESCP Business School, Master en Management',
  experience = '10 ans dans la gestion d''associations culturelles',
  competences = ARRAY['Gestion administrative', 'Comptabilité', 'Coordination de projets', 'Communication'],
  date_entree = '2019-09-15',
  adresse = 'Thonon-les-Bains, Haute-Savoie',
  specialite = 'Secrétariat et opérations',
  langues = ARRAY['Français', 'Savoyard', 'Anglais', 'Italien'],
  hobbies = 'Ski alpin, lecture de romans historiques, jardinage',
  bio = 'Secrétaire et responsable des opérations. Coordonne les activités quotidiennes de l''institut et participe à de nombreuses commissions.',
  email = 'franck.monod@ils-savoie.org'
WHERE first_name = 'Franck' AND last_name = 'Monod';

UPDATE people SET 
  formation = 'Université de Genève, Master en Finance',
  experience = '8 ans en comptabilité et gestion financière',
  competences = ARRAY['Comptabilité', 'Gestion financière', 'Audit', 'Fiscalité associative'],
  date_entree = '2021-01-10',
  adresse = 'Évian-les-Bains, Haute-Savoie',
  specialite = 'Trésorerie et finances',
  langues = ARRAY['Français', 'Savoyard', 'Allemand', 'Anglais'],
  hobbies = 'Voile sur le lac Léman, échecs',
  bio = 'Trésorier de l''institut. Assure la gestion financière et le suivi budgétaire des projets.',
  email = 'benjamin.honegger@ils-savoie.org'
WHERE first_name = 'Benjamin' AND last_name = 'Honegger';