/**
 * Script pour corriger les noms dans la base de données
 * Basé sur le fichier Liste_des_bénévoles.ods
 */

export const nameCorrections = [
  // Corrections basées sur le fichier ODS et la base de données actuelle
  
  // Noms erronés dans la DB à corriger
  { search: { firstName: 'Paul', lastName: 'Bernard' }, correct: { firstName: 'Paul', lastName: 'Sxxx' } },
  { search: { firstName: 'Serena', lastName: 'Bonnet' }, correct: { firstName: 'Serena', lastName: 'Losorbo' } },
  { search: { firstName: 'Sylvie', lastName: 'Dupont' }, correct: { firstName: 'Sylvie', lastName: 'Rollin' } },
  { search: { firstName: 'Théo', lastName: 'Leroy' }, correct: { firstName: 'Théo', lastName: 'Beccu' } },
  { search: { firstName: 'Léothrim', lastName: 'Martin' }, correct: { firstName: 'Léotrim', lastName: 'Ramadani' } },
  { search: { firstName: 'Nina', lastName: 'Garcia' }, correct: { firstName: 'Nina', lastName: 'Mabboux' } },
  { search: { firstName: 'Charlotte', lastName: 'Girard' }, correct: { firstName: 'Charlotte', lastName: 'Genty' } },
  { search: { firstName: 'Tiffany', lastName: 'Moreau' }, correct: { firstName: 'Tiffany', lastName: 'Clerc-Brunside' } },
  { search: { firstName: 'Minh', lastName: 'Nguyen' }, correct: { firstName: 'Minh', lastName: 'Doan' } },
  { search: { firstName: 'Noé', lastName: 'Petit' }, correct: { firstName: 'Noé', lastName: '' } },
  { search: { firstName: 'Sébastien', lastName: 'Roux' }, correct: { firstName: 'Sébastien', lastName: 'Mayoux' } },
  { search: { firstName: 'Christian', lastName: 'Muller' }, correct: { firstName: 'Christian', lastName: 'Gxxxx' } },
  { search: { firstName: 'Anne-Sophie', lastName: 'Laurent' }, correct: { firstName: 'Anne-Sophie', lastName: 'Aguelmine' } },
  { search: { firstName: 'Stéphane', lastName: 'Fournier' }, correct: { firstName: 'Stéphane', lastName: 'Arrami' } },
  
  // Noms corrects dans la DB (Arnaud Frasse est le président)
  // Marc Bron, Alain Favre, Benjamin Honegger, Franck Monod sont déjà corrects
];

export const emailCorrections = [
  // Ajout des emails et téléphones manquants depuis le fichier ODS
  { firstName: 'Théo', lastName: 'Beccu', email: 'theo@patoue.fr', phone: '0638851950' },
  { firstName: 'Minh', lastName: 'Doan', email: 'minh@alveo3D.com', phone: '0661397949' },
  { firstName: 'Charlotte', lastName: 'Genty', email: 'charlotte.gty80@gmail.com', phone: '0662368291' },
  { firstName: 'Serena', lastName: 'Losorbo', email: 'serenalosorbo@gmail.com', phone: '0743284881' },
  { firstName: 'Léotrim', lastName: 'Ramadani', email: 'leotrim@laposte.net', phone: '0749228852' },
  { firstName: 'Sylvie', lastName: 'Rollin', email: 'silvrollin@gmail.com', phone: '0610707041' },
  { firstName: 'Amandine', lastName: 'Pinget', email: 'pingetamandine@yahoo.fr', phone: '0678895837' },
];
