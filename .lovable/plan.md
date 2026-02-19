

# Scraping des associations culturelles pour l'annuaire

## Objectif

Scraper les associations culturelles de 5 zones et les injecter dans la table `associations` de Supabase pour peupler l'annuaire.

## Sources identifiees

| Source | Zone | Format | Methode |
|---|---|---|---|
| **data.gouv.fr (RNA)** | Savoie (73), Haute-Savoie (74), Alpes-Maritimes (06/Nice) | CSV telechargeables | Telecharger le CSV, filtrer par objet "culture" et departement |
| **net1901.org** | Savoie (73), Haute-Savoie (74), Nice (06) | HTML pagine | Firecrawl scrape des pages de listing |
| **RUNTS (servizicivili.gov.it)** | Piemonte, Valle d'Aosta | Registre national italien (API/HTML) | Firecrawl search + scrape |
| **regione.piemonte.it** | Piemonte | PDF du registre des personnes morales | Firecrawl scrape |

## Contrainte technique : `owner_id`

La table `associations` a un champ `owner_id` NOT NULL (uuid, reference a auth.users). Les associations scrapees n'ont pas de proprietaire. 

**Solution** : Creer un utilisateur "systeme" dans auth.users via l'interface Supabase, ou utiliser votre propre user_id comme owner par defaut. Les associations scrapees seront marquees `is_public = true` et `is_active = true` mais sans owner fonctionnel. Alternative : rendre `owner_id` nullable par migration.

## Architecture technique

### 1. Edge Function `scrape-associations`

Une seule edge function qui orchestre le scraping multi-sources :

- **Etape 1** : Firecrawl Search pour trouver des associations culturelles par zone
- **Etape 2** : Firecrawl Scrape pour extraire les details de chaque association trouvee
- **Etape 3** : OpenAI pour normaliser/structurer les donnees extraites (nom, ville, description, coordonnees GPS)
- **Etape 4** : Upsert dans la table `associations` avec deduplication par nom + ville

### 2. Strategie par source

**data.gouv.fr (RNA)** :
- Le RNA est un fichier CSV de ~4M lignes. Trop gros pour Firecrawl.
- Mieux : utiliser l'API RNA de data.gouv.fr qui permet de filtrer par departement et objet social.
- URL : `https://tabular-api.data.gouv.fr/api/resources/...` ou bien scraper les pages de resultats filtrees.
- Alternative pragmatique : utiliser Firecrawl Search avec query `"association culturelle Savoie"` etc.

**net1901.org** :
- URLs structurees : `https://www.net1901.org/associations.html?go=1&id_theme=150&num_dpt=73` (theme 150 = culture)
- Scraper page par page avec Firecrawl, extraire nom + ville + objet
- Pagination a gerer

**Italie (RUNTS + Piemonte)** :
- Le Registro Unico Nazionale del Terzo Settore (RUNTS) remplace les registres regionaux
- Consultable sur servizicivili.gov.it mais acces complexe
- Alternative : Firecrawl Search `"associazione culturale Valle d'Aosta"` et `"associazione culturale Piemonte"`

### 3. Schema de donnees inserees

Pour chaque association scrapee :

```text
name:          Nom de l'association
description:   Objet social / description
silo:          'culture'
primary_zone:  'savoie' | 'vallee-aoste' | 'piemont' | 'alpes-maritimes'
city:          Ville du siege
latitude:      Coordonnees GPS (geocodees via Mapbox si absentes)
longitude:     Coordonnees GPS
is_public:     true
is_active:     true
owner_id:      ID admin systeme (a definir)
```

### 4. Interface admin pour lancer le scraping

Un bouton dans la page Annuaire (visible uniquement pour les admins) qui :
- Permet de choisir la zone et la source
- Lance l'edge function
- Affiche la progression et le nombre d'associations importees

## Fichiers concernes

| Fichier | Action |
|---|---|
| `supabase/functions/scrape-associations/index.ts` | Creer : edge function de scraping multi-sources |
| `supabase/config.toml` | Ajouter la config de la nouvelle function |
| `src/pages/DirectoryHub.tsx` | Ajouter un bouton "Importer des associations" pour les admins |
| `src/components/directory/ImportAssociationsDialog.tsx` | Creer : dialog d'import avec choix de zone/source |
| Migration SQL (optionnel) | Rendre `owner_id` nullable ou creer un owner systeme |

## Prerequis

- **FIRECRAWL_API_KEY** : deja configure
- **OPENAI_API_KEY** : deja configure (pour normalisation des donnees)
- **MAPBOX_PUBLIC_TOKEN** : deja configure (pour geocoding des villes sans coordonnees)

## Limites et risques

- net1901.org peut bloquer le scraping (rate limiting)
- Les registres italiens sont souvent en PDF ou derriere des formulaires complexes
- Le geocoding des villes italiennes peut etre imprecis
- Le volume peut etre important (des centaines d'associations culturelles par zone)
- **Recommandation** : commencer par Firecrawl Search (le plus simple), puis affiner avec les sources specifiques si les resultats sont insuffisants

