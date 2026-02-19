

# Adhesion Federation -- Modele "convention association"

## Contexte

Deux niveaux distincts :
- **Adherent d'une association** (B2C) : l'individu qui paie sa cotisation via HelloAsso a son association locale
- **Membre de la faitiere** (B2B) : l'association qui paie un % de son budget pour adherer au reseau

Quand une association est conventionnee (membre de la faitiere), ses adherents individuels actifs peuvent reclamer gratuitement une adhesion a la faitiere via un **portail externe** (une autre app). Cette app consommera l'API Supabase du projet actuel.

## Ce qu'on construit maintenant

On pose uniquement la **base de donnees** et les **requetes cote admin** (pas de portail self-service, pas de gestion des avantages). Le portail externe sera une autre app qui lira/ecrira dans les memes tables Supabase.

### 1. Migration base de donnees

**Nouveau champ sur `associations`** :

```text
ALTER TABLE associations ADD COLUMN is_federation_member boolean DEFAULT false;
ALTER TABLE associations ADD COLUMN federation_joined_at timestamptz;
ALTER TABLE associations ADD COLUMN helloasso_slug text;
```

- `is_federation_member` : l'association est conventionnee avec la faitiere
- `federation_joined_at` : date de la convention
- `helloasso_slug` : stocke le slug HelloAsso en base plutot qu'en localStorage (plus fiable, multi-utilisateur)

**Nouvelle table `federation_members`** :

```text
CREATE TABLE public.federation_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  last_name text,
  association_id uuid REFERENCES public.associations(id) ON DELETE CASCADE NOT NULL,
  helloasso_member_id uuid REFERENCES public.helloasso_members(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'pending',
  activated_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.federation_members ENABLE ROW LEVEL SECURITY;

-- Index unique : un seul enregistrement par email + association
CREATE UNIQUE INDEX idx_federation_members_email_asso ON public.federation_members (email, association_id);
```

RLS policies :
- Les admins de la faitiere (role `admin` global) peuvent tout voir et modifier
- Les admins d'une association (via `is_association_admin`) peuvent voir les `federation_members` lies a leur association
- Le portail externe appellera via service_role (edge function), pas besoin de RLS specifique pour les adherents

### 2. Modifier `/members` : colonne "Federation" + stockage slug en base

Changements dans `src/pages/Members.tsx` :
- Ajouter une colonne "Fédération" dans le tableau, montrant un badge si l'adherent a un enregistrement `federation_members` actif
- Remplacer le stockage du slug HelloAsso de `localStorage` vers le champ `associations.helloasso_slug` (requete Supabase)
- Ajouter un bouton toggle "Conventionnée" pour les admins de la faitiere (met a jour `is_federation_member`)

### 3. Ajouter une section dans les settings association

Dans les settings de l'association (ou directement sur la page /members), afficher :
- Le statut de convention avec la faitiere ("Conventionnée" ou "Non conventionnée")
- Le nombre d'adherents ayant active leur adhesion federation
- Ces infos ne sont visibles que par les admins de l'association

### 4. Ce qu'on ne construit PAS maintenant

- Portail self-service pour les adherents (sera une autre app)
- Gestion des avantages (reductions partenaires, cartes, etc.)
- Paiement de la cotisation association (sera traite separement)

## Fichiers modifies

| Fichier | Action |
|---|---|
| Migration SQL | Ajouter colonnes sur `associations` + creer table `federation_members` avec RLS |
| `src/pages/Members.tsx` | Ajouter colonne "Federation", migrer slug de localStorage vers base, bouton toggle convention |
| `src/integrations/supabase/types.ts` | Sera auto-regenere apres migration |

## Point critique : securite du portail externe

Le portail externe (autre app) devra valider que :
1. L'email de l'adherent existe dans `helloasso_members` pour une association conventionnee
2. L'adhesion HelloAsso est active (membership_date + 1 an > now)
3. L'adherent n'a pas deja un enregistrement `federation_members` actif

Cela sera gere par une edge function dediee (a construire plus tard avec le portail).

