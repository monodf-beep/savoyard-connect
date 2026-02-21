
-- Add website_url if not exists (already exists per schema)
-- Bulk insert 49 associations from the Excel file
INSERT INTO public.associations (name, description, city, primary_zone, silo, latitude, longitude, website_url, is_public, is_active, owner_id)
VALUES
-- Savoie (73) - 13 associations
('Académie des Sciences, Belles Lettres et Arts de Savoie', 'Principale académie savoyarde, recherches en histoire, sciences et arts', 'Chambéry', 'savoie', 'culture', 45.5646, 5.9178, 'https://www.societes-savantes-savoie.org/union/academie-des-sciences-belles-lettres-et-arts-de-savoie/', true, true, NULL),
('Société Savoisienne d''Histoire et d''Archéologie (SSHA)', 'Histoire et archéologie des pays de Savoie', 'Chambéry', 'savoie', 'culture', 45.569, 5.921, 'https://www.ssha.fr/', true, true, NULL),
('Société d''Histoire Naturelle de la Savoie', 'Sciences naturelles du territoire savoyard', 'Chambéry', 'savoie', 'culture', 45.573, 5.905, 'https://shnsmuseum.wordpress.com/', true, true, NULL),
('Académie de la Val d''Isère', 'Histoire et patrimoine de la Tarentaise', 'Moûtiers', 'savoie', 'culture', 45.4856, 6.5331, 'https://valisere.ovh/', true, true, NULL),
('Société d''Histoire et d''Archéologie de Maurienne', 'Patrimoine historique et archéologique de la Maurienne', 'Saint-Jean-de-Maurienne', 'savoie', 'culture', 45.2756, 6.3455, 'http://www.sha-maurienne.fr/', true, true, NULL),
('Société d''Histoire et d''Archéologie d''Aime (SHAA)', 'Histoire locale d''Aime et environs', 'Aime-la-Plagne', 'savoie', 'culture', 45.5555, 6.6518, 'https://www.societes-savantes-savoie.org/union/societe-dhistoire-et-darcheologie-daime/', true, true, NULL),
('Société des Amis du Vieux Chambéry', 'Sauvegarde du patrimoine architectural de Chambéry', 'Chambéry', 'savoie', 'culture', 45.5646, 5.9178, 'http://www.amisduvieuxchambery.org', true, true, NULL),
('Les Amis du Vieux Conflans', 'Patrimoine de la cité médiévale de Conflans', 'Albertville', 'savoie', 'culture', 45.6757, 6.3929, 'http://www.amisduvieuxconflans.fr', true, true, NULL),
('Les Amis de Montmélian et de ses environs', 'Histoire et patrimoine de Montmélian', 'Montmélian', 'savoie', 'culture', 45.5024, 6.0443, 'https://www.amisdemontmelian.com', true, true, NULL),
('Société d''Art et d''Histoire d''Aix-les-Bains', 'Art et histoire locale d''Aix-les-Bains', 'Aix-les-Bains', 'savoie', 'culture', 45.6884, 5.9152, 'http://www.art-et-histoire.fr', true, true, NULL),
('Connaissance du canton de la Motte-Servolex', 'Patrimoine local Bourget-du-Lac, La Motte-Servolex', 'La Motte-Servolex', 'savoie', 'culture', 45.597, 5.879, 'https://www.connaissanceducanton.org/', true, true, NULL),
('Histoire et Patrimoine de Bissy', 'Patrimoine du quartier de Bissy', 'Chambéry', 'savoie', 'culture', 45.57, 5.9, 'http://www.hpbissy.fr/', true, true, NULL),
('Kronos – Archéologie, Histoire et Témoignages de l''Albanais', 'Archéologie et histoire de l''Albanais', 'Rumilly', 'savoie', 'culture', 45.867, 5.943, 'https://www.kronos-albanais.org', true, true, NULL),
-- Haute-Savoie (74) - 11 associations
('Académie Florimontane', 'Fondée par François de Sales et Antoine Favre, refondée 1851', 'Annecy', 'haute-savoie', 'culture', 45.8992, 6.1294, 'https://www.societes-savantes-savoie.org/union/academie-florimontane/', true, true, NULL),
('Académie Salésienne', 'Études historiques et religieuses, mémoires salésiens', 'Annecy', 'haute-savoie', 'culture', 45.8992, 6.1294, 'http://www.academie-salesienne.org', true, true, NULL),
('Académie Chablaisienne', 'Histoire et patrimoine du Chablais', 'Thonon-les-Bains', 'haute-savoie', 'culture', 46.3706, 6.4797, 'https://www.academie-chablaisienne.com/', true, true, NULL),
('Académie du Faucigny', 'Patrimoine historique du Faucigny', 'Bonneville', 'haute-savoie', 'culture', 46.0789, 6.4078, 'https://www.societes-savantes-savoie.org/union/academie-du-faucigny/', true, true, NULL),
('La Salévienne', 'Histoire et nature autour du Salève', 'Saint-Julien-en-Genevois', 'haute-savoie', 'culture', 46.1435, 6.0822, 'https://www.societes-savantes-savoie.org/union/la-salevienne/', true, true, NULL),
('Société d''Histoire Naturelle de la Haute-Savoie', 'Sciences naturelles de Haute-Savoie', 'Annecy', 'haute-savoie', 'culture', 45.8992, 6.1294, NULL, true, true, NULL),
('Société des Amis du Vieil Annecy', 'Sauvegarde du patrimoine d''Annecy', 'Annecy', 'haute-savoie', 'culture', 45.8992, 6.1294, 'https://www.societes-savantes-savoie.org/union/les-amis-du-vieil-annecy/', true, true, NULL),
('Les Amis du Vieux Chamonix', 'Histoire et patrimoine de la vallée de Chamonix', 'Chamonix', 'haute-savoie', 'culture', 45.9237, 6.8694, 'http://www.amis-vieux-chamonix.org', true, true, NULL),
('Les Amis du Val de Thônes', 'Patrimoine du Val de Thônes', 'Thônes', 'haute-savoie', 'culture', 45.881, 6.326, 'https://www.societes-savantes-savoie.org/union/amis-du-val-de-thones/', true, true, NULL),
('Les Amis du Vieux Rumilly et de l''Albanais', 'Patrimoine de Rumilly et du Pays de l''Albanais', 'Rumilly', 'haute-savoie', 'culture', 45.867, 5.943, 'https://www.amis-vieux-rumilly.org/', true, true, NULL),
('Les Amis de Viuz-Faverges', 'Archéologie, Musée de Viuz', 'Faverges-Seythenex', 'haute-savoie', 'culture', 45.7465, 6.2945, 'https://www.archeoviuz.ch', true, true, NULL),
-- Savoie / Haute-Savoie - 1
('Union des Sociétés Savantes de Savoie (USSS)', 'Fédère les 23 sociétés savantes des deux Savoie', 'Saint-Jeoire-Prieuré', 'savoie', 'culture', 45.535, 5.937, 'https://www.societes-savantes-savoie.org/', true, true, NULL),
-- Valle d'Aosta - 11
('Académie Saint-Anselme', 'Plus ancienne institution culturelle valdôtaine, histoire et patrimoine', 'Aoste', 'vallee-aoste', 'culture', 45.7211, 7.2804, 'https://www.academiestanselme.eu/', true, true, NULL),
('Centre d''Études Francoprovençales René Willien (CEFP)', 'Linguistique et ethnologie francoprovençale, Atlas des Patois', 'Saint-Nicolas', 'vallee-aoste', 'culture', 45.715, 7.168, 'https://www.centre-etudes-francoprovencales.eu/', true, true, NULL),
('Association Valdôtaine Archives Sonores (AVAS)', 'Collecte mémoire sonore, iconographique et filmée', 'Aoste', 'vallee-aoste', 'culture', 45.7375, 7.3153, 'https://www.avasvalleedaoste.it/', true, true, NULL),
('Associazione Augusta', 'Promotion sociale, études patrimoine culturel, revue Augusta', 'Aoste', 'vallee-aoste', 'culture', 45.7375, 7.3153, NULL, true, true, NULL),
('Société de la Flore Valdôtaine', 'Botanique et sciences naturelles valdôtaines', 'Aoste', 'vallee-aoste', 'culture', 45.7375, 7.3153, NULL, true, true, NULL),
('Société Valdôtaine de Préhistoire et d''Archéologie (SvaPA)', 'Études préhistoriques et archéologiques alpines', 'Aoste', 'vallee-aoste', 'culture', 45.7375, 7.3153, NULL, true, true, NULL),
('Comité des Traditions Valdôtaines', 'Traditions valdôtaines, revue Lo Flambò, Groupe Folklorique', 'Aoste', 'vallee-aoste', 'culture', 45.7375, 7.3153, NULL, true, true, NULL),
('Lo Charaban – Compagnie de théâtre en patois', 'Théâtre populaire en francoprovençal', 'Aoste', 'vallee-aoste', 'culture', 45.7375, 7.3153, NULL, true, true, NULL),
('Fédération Valdôtaine de Théâtre Populaire', 'Regroupe compagnies théâtrales en patois, Printemps Théâtral', 'Aoste', 'vallee-aoste', 'culture', 45.7375, 7.3153, NULL, true, true, NULL),
('Istituto Storico della Resistenza (IstorecoVDA)', 'Histoire contemporaine, Résistance, didactique', 'Aoste', 'vallee-aoste', 'culture', 45.7375, 7.3153, 'https://www.istorecovda.it/', true, true, NULL),
('Maison des Anciens Remèdes', 'Mémoire des plantes officinales et savoirs traditionnels', 'Jovençan', 'vallee-aoste', 'culture', 45.723, 7.265, 'https://www.anciensremedesjovencan.it/', true, true, NULL),
-- Piemonte - 5
('Accademia delle Scienze di Torino', 'Sciences physiques et morales, 350+ membres, Palazzo Carignano', 'Turin', 'piemont', 'culture', 45.0686, 7.6836, 'https://www.accademiadellescienze.it/', true, true, NULL),
('Deputazione Subalpina di Storia Patria', 'Recherche historique subalpine, Bollettino storico-bibliografico', 'Turin', 'piemont', 'culture', 45.0686, 7.6836, 'http://www.deputazionesubalpina.it/', true, true, NULL),
('Centro Studi Piemontesi', 'Études piémontaises, éditions, patrimoine linguistique', 'Turin', 'piemont', 'culture', 45.071, 7.678, 'https://www.studipiemontesi.it/', true, true, NULL),
('Società Piemontese di Archeologia e Belle Arti', 'Archéologie et beaux-arts piémontais', 'Turin', 'piemont', 'culture', 45.0703, 7.6869, NULL, true, true, NULL),
('Società Storica Vercellese', 'Histoire locale de Verceil et du Piémont oriental', 'Vercelli', 'piemont', 'culture', 45.3258, 8.4184, NULL, true, true, NULL),
-- Nice / Alpes-Maritimes - 8
('Acadèmia Nissarda', 'Défense parlers et traditions niçois, revue Nice Historique', 'Nice', 'alpes-maritimes', 'culture', 43.7102, 7.262, 'https://www.academia-nissarda.org/', true, true, NULL),
('Société des Lettres, Sciences et Arts des Alpes-Maritimes', 'Conférences lettres, arts, sciences, bibliothèque Villa Carlonia', 'Nice', 'alpes-maritimes', 'culture', 43.7002, 7.265, NULL, true, true, NULL),
('ASPEAM – Sauvegarde du Patrimoine Écrit des Alpes-Maritimes', 'Sauvegarde archives et documents privés des Alpes-Maritimes', 'Nice', 'alpes-maritimes', 'culture', 43.699, 7.278, NULL, true, true, NULL),
('SAHAM – Société Archéologique et Historique des Alpes Méditerranéennes', 'Archéologie et histoire des Alpes méridionales', 'Nice', 'alpes-maritimes', 'culture', 43.7102, 7.262, NULL, true, true, NULL),
('Centre d''Études Préhistoriques de Terra Amata (CEPTA)', 'Préhistoire des Alpes méridionales, fouilles', 'Nice', 'alpes-maritimes', 'culture', 43.695, 7.286, NULL, true, true, NULL),
('Compagnie de Savoie – Bailliage de Nice', 'Culture et patrimoine des Pays de Savoie à Nice, action sociale', 'Nice', 'alpes-maritimes', 'culture', 43.7102, 7.262, NULL, true, true, NULL),
('Association Patrimoine et Traditions Brigasques', 'Patrimoine culturel et architectural de La Brigue', 'La Brigue', 'alpes-maritimes', 'culture', 44.06, 7.614, 'https://www.nicerendezvous.com/association-patrimoine-et-traditions-brigasques.html', true, true, NULL),
('AHVAE – Histoire Vivante et Archéologie Expérimentale', 'Reconstitution historique du Comté de Nice', 'La Trinité', 'alpes-maritimes', 'culture', 43.745, 7.314, NULL, true, true, NULL)
ON CONFLICT DO NOTHING;
