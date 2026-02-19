
# Simplification RH et Benevolat (sans toucher aux Members)

## Recapitulatif

L'utilisateur confirme que les donnees Members sont reelles (proviennent de l'organigramme). On ne touche pas au module Members. On applique les etapes 1, 3, 4, 5 et 6 du plan approuve.

---

## Modifications

### 1. Page Jobs : supprimer les donnees fictives (`src/pages/Jobs.tsx`)

- Supprimer le tableau `initialJobPostings` (lignes 14-52) avec ses fausses annonces startup
- Initialiser `jobPostings` avec un tableau vide : `useState<JobPosting[]>([])`
- Supprimer le `TutorialDialog` (lignes 103-135)
- L'etat vide existant (lignes 149-156) s'affichera naturellement
- Supprimer l'import de `TutorialDialog` et `Settings`/`Info` non utilises

### 2. Organigramme : retirer la vue "Tuiles" (`src/components/Organigramme.tsx`)

**Desktop** (lignes 904-913) : supprimer le bouton "Tuiles" du toggle de vue

**Mobile** (lignes 778-786) : supprimer le bouton "Tuiles" du menu mobile

**Rendu** (lignes 1038-1141) : supprimer le bloc `else` qui rend la vue grid. Le ternaire `viewMode === 'members' ? ... : viewMode === 'line' ? ...` devient un simple ternaire a 2 branches.

Supprimer `LayoutGrid` de l'import lucide-react (ligne 18).

### 3. Organigramme : retirer le bandeau "Mode Administrateur" (`src/components/Organigramme.tsx`)

Supprimer le bloc lignes 952-960 (bandeau bleu permanent).

### 4. Page organigramme : retirer TutorialDialog et description (`src/pages/Index.tsx`)

- Supprimer le `TutorialDialog` (lignes 87-123) et son import
- Supprimer la ligne de description "Vue complete de la structure organisationnelle" (ligne 125)
- Garder : titre + badge membres + bouton postes vacants

---

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/pages/Jobs.tsx` | Supprimer donnees fictives, supprimer TutorialDialog |
| `src/components/Organigramme.tsx` | Retirer vue Tuiles (desktop + mobile + rendu), retirer bandeau Admin |
| `src/pages/Index.tsx` | Retirer TutorialDialog et description |
