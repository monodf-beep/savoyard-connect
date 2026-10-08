// Données factices pour le mode développement (VITE_MOCK_BACKEND=true).
export const MOCK_USER_ID = '00000000-0000-4000-8000-000000000001';

const now = new Date().toISOString();
const inDays = (d: number) => new Date(Date.now() + d * 86400000).toISOString().slice(0, 10);

const SECTION_CULTURE = '10000000-0000-4000-8000-000000000001';
const SECTION_JEUNESSE = '10000000-0000-4000-8000-000000000002';
const SECTION_COMM = '10000000-0000-4000-8000-000000000003';

const P_FESTIVAL = '20000000-0000-4000-8000-000000000001';
const P_LIVRE = '20000000-0000-4000-8000-000000000002';
const P_ATELIER = '20000000-0000-4000-8000-000000000003';
const P_SITE = '20000000-0000-4000-8000-000000000004';

export const seed: Record<string, any[]> = {
  user_roles: [{ id: 'r1', user_id: MOCK_USER_ID, role: 'admin', created_at: now }],

  organization_settings: [
    { id: 'o1', name: 'Association Démo', logo_url: null, primary_color: '#0052FF', secondary_color: '#00C48C', created_at: now, updated_at: now },
  ],

  associations: [
    {
      id: '30000000-0000-4000-8000-000000000001', name: 'Association Démo', city: 'Chambéry',
      description: 'Association fictive pour le développement.', is_active: true, is_public: true,
      is_federation_member: true, show_organigramme: true, owner_id: MOCK_USER_ID, silo: 'culture',
      primary_zone: 'Savoie', helloasso_slug: 'association-demo', created_at: now, updated_at: now,
      cover_image_url: null, logo_url: null, latitude: 45.5646, longitude: 5.9178,
    },
    {
      id: '30000000-0000-4000-8000-000000000002', name: 'Maison des Cultures Alpines', city: 'Annecy',
      description: 'Seconde association fictive.', is_active: true, is_public: true,
      is_federation_member: false, show_organigramme: false, owner_id: null, silo: 'culture',
      primary_zone: 'Haute-Savoie', created_at: now, updated_at: now, cover_image_url: null, logo_url: null,
      latitude: 45.8992, longitude: 6.1294,
    },
  ],

  sections: [
    { id: SECTION_CULTURE, title: 'Culture & Patrimoine', parent_id: null, display_order: 0, is_expanded: true, is_hidden: false, leader_id: null, created_at: now, updated_at: now },
    { id: SECTION_JEUNESSE, title: 'Jeunesse', parent_id: null, display_order: 1, is_expanded: true, is_hidden: false, leader_id: null, created_at: now, updated_at: now },
    { id: SECTION_COMM, title: 'Communication', parent_id: null, display_order: 2, is_expanded: true, is_hidden: false, leader_id: null, created_at: now, updated_at: now },
  ],

  people: [
    { id: '40000000-0000-4000-8000-000000000001', first_name: 'Claire', last_name: 'Martin', title: 'Présidente', email: 'claire@example.org', user_id: MOCK_USER_ID, created_at: now, updated_at: now },
    { id: '40000000-0000-4000-8000-000000000002', first_name: 'Julien', last_name: 'Dupont', title: 'Trésorier', email: 'julien@example.org', user_id: null, created_at: now, updated_at: now },
    { id: '40000000-0000-4000-8000-000000000003', first_name: 'Amélie', last_name: 'Rey', title: 'Responsable jeunesse', email: 'amelie@example.org', user_id: null, created_at: now, updated_at: now },
  ],

  projects: [
    {
      id: P_FESTIVAL, section_id: SECTION_CULTURE, title: 'Festival des traditions alpines',
      description: 'Trois jours de concerts, contes et ateliers pour faire vivre le patrimoine local.',
      status: 'in_progress', is_funding_project: true, funding_goal: 8000, funded_amount: 5350,
      ha_net_total: 4200, manual_cash_total: 1150, supporter_count: 64, funding_deadline: inDays(5),
      cover_image_url: null, approval_status: 'approved', documents: [], created_at: now, updated_at: now,
    },
    {
      id: P_LIVRE, section_id: SECTION_CULTURE, title: 'Édition du livre de contes',
      description: 'Collecte et illustration de contes traditionnels, édition papier.',
      status: 'planned', is_funding_project: true, funding_goal: 3000, funded_amount: 3100,
      ha_net_total: 2600, manual_cash_total: 500, supporter_count: 41, funding_deadline: inDays(-10),
      cover_image_url: null, approval_status: 'approved', documents: [], created_at: now, updated_at: now,
    },
    {
      id: P_ATELIER, section_id: SECTION_JEUNESSE, title: 'Ateliers langue pour les enfants',
      description: 'Cycle d’ateliers hebdomadaires dans trois écoles.',
      status: 'in_progress', is_funding_project: true, funding_goal: 5000, funded_amount: 450,
      ha_net_total: 0, manual_cash_total: 450, supporter_count: 7, funding_deadline: inDays(60),
      cover_image_url: null, approval_status: 'approved', documents: [], created_at: now, updated_at: now,
    },
    {
      id: P_SITE, section_id: SECTION_COMM, title: 'Refonte du site web',
      description: 'Projet interne, hors financement participatif.',
      status: 'planned', is_funding_project: false, funding_goal: 0, funded_amount: 0,
      ha_net_total: 0, manual_cash_total: 0, supporter_count: 0, funding_deadline: null,
      cover_image_url: null, approval_status: 'approved', documents: [], created_at: now, updated_at: now,
    },
  ],

  manual_funds: [
    { id: 'm1', project_id: P_FESTIVAL, amount: 500, source: 'cash', donor_name: 'Mairie de Chambéry', note: 'Don en main propre', is_public: true, created_at: now },
    { id: 'm2', project_id: P_FESTIVAL, amount: 650, source: 'cheque', donor_name: 'Entreprise Alpina', note: 'Mécénat', is_public: true, created_at: now },
    { id: 'm3', project_id: P_LIVRE, amount: 500, source: 'cash', donor_name: null, note: null, is_public: false, created_at: now },
    { id: 'm4', project_id: P_ATELIER, amount: 450, source: 'cheque', donor_name: 'Fondation du Mont-Blanc', note: 'Mécénat', is_public: true, created_at: now },
  ],

  helloasso_donors: [
    { id: 'd1', first_name: 'Sophie', last_name: 'Bernard', city: 'Annecy', email: null, total_donated: 450, donation_count: 6, is_hidden: false, helloasso_id: 'ha1', last_donation_date: now, created_at: now, updated_at: now },
    { id: 'd2', first_name: 'Marc', last_name: 'Favre', city: 'Chambéry', email: null, total_donated: 300, donation_count: 3, is_hidden: false, helloasso_id: 'ha2', last_donation_date: now, created_at: now, updated_at: now },
    { id: 'd3', first_name: 'Léa', last_name: 'Girard', city: 'Grenoble', email: null, total_donated: 120, donation_count: 2, is_hidden: false, helloasso_id: 'ha3', last_donation_date: now, created_at: now, updated_at: now },
    { id: 'd4', first_name: 'Anonyme', last_name: '', city: null, email: null, total_donated: 900, donation_count: 1, is_hidden: true, helloasso_id: 'ha4', last_donation_date: now, created_at: now, updated_at: now },
  ],

  financial_reports: [
    {
      id: 'f1', year: new Date().getFullYear() - 1, report_name: 'Bilan annuel', is_published: true, is_provisional: false,
      ventes_prestations: 12000, subventions: 18000, dons_cotisations: 9500, autres_produits: 800, produits_financiers: 120,
      total_produits: 40420, achats: 6000, services_exterieurs: 9000, autres_services: 3500, charges_personnel: 15000,
      charges_financieres: 200, dotations_amortissements: 900, total_charges: 34600, resultat: 5820,
      tresorerie: 21000, reserves: 14000, total_actif: 36000, total_passif: 36000,
      documents: [], notes: null, created_at: now, updated_at: now, created_by: MOCK_USER_ID,
    },
  ],

  opportunities: [
    { id: 'op1', title: 'Appel à projets Patrimoine immatériel', description: 'Soutien aux projets de transmission culturelle.', amount: 15000, category: 'subvention', deadline: inDays(30), region: 'Auvergne-Rhône-Alpes', source: 'Région', application_url: 'https://example.org', is_active: true, created_at: now, updated_at: now },
    { id: 'op2', title: 'Fonds jeunesse et éducation populaire', description: 'Financement d’actions pour les jeunes.', amount: 8000, category: 'subvention', deadline: inDays(75), region: 'Savoie', source: 'Département', application_url: 'https://example.org', is_active: true, created_at: now, updated_at: now },
  ],
};
