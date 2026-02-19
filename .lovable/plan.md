
# Refonte Members + Contributors -- Connexion HelloAsso

## Objectif

Transformer deux pages (une vide avec du mock, une surchargee) en deux outils clairs et connectes aux vraies donnees.

## Page `/members` -- CRM operationnel

### Etat actuel
- 5 faux membres en dur, aucune connexion base de donnees
- Boutons Import/Export/Ajouter ne font rien
- 4 stat cards pour des faux chiffres

### Ce qu'on construit

```text
+--------------------------------------------------+
| Membres & Adhesions    [Sync HelloAsso] [Export]  |
| 42 actifs / 58 total -- 3 expirent ce mois       |
+--------------------------------------------------+
| [Recherche...]  [Statut v]  [Annee v]            |
+--------------------------------------------------+
| Av | Nom        | Type      | Statut   | Exp.    |
| MD | M. Dupont  | Adherent  | Actif    | 12/26   |
| JM | J. Martin  | Bienfait. | Expire   | 01/25   |
+--------------------------------------------------+
```

Changements :
- Supprimer tout le mock data
- Requeter `helloasso_members` via `useQuery`
- Calculer le statut cote client : actif si `membership_date` + 1 an > aujourd'hui, expirant si dans les 30 jours, expire sinon
- Remplacer les 4 stat cards par une ligne de resume concise
- Bouton "Sync HelloAsso" qui appelle `supabase.functions.invoke('sync-helloasso-members', { body: { organizationSlug } })`
- Premiere utilisation : prompt simple pour saisir le slug HelloAsso de l'association (stocke en `localStorage`)
- Export CSV fonctionnel (generation cote client)
- Supprimer les boutons Import et Ajouter (non fonctionnels)
- Ajouter un filtre par annee d'adhesion

---

## Page `/contributors` -- Visualisation des contributions

### Etat actuel
6 sections dont 4 sont du bruit : milestones/gamification, "Devenir Membre" avec prix, carte Mapbox, requetes sur learners/volunteers.

### Ce qu'on garde (2 elements utiles)
- **Grille des contributeurs** avec filtre par annee (voir qui revient d'une annee a l'autre)
- **Top Donateurs** depuis `helloasso_donors` (fidelite, montants cumules)

### Ce qu'on supprime
- Section "Force Collective" / milestones / barre de progression (gadget sans impact admin)
- Section "Devenir Membre" avec les options d'adhesion et prix (doublon avec HelloAsso)
- Carte Mapbox des contributeurs (bruit visuel, pas de cas d'usage concret)
- Requetes sur `learners`, `volunteers`, `community_milestones`, `membership_options`, `community_settings`, `mapbox-token`
- Bouton "Parametres" et `ContributorSettingsDialog`

### Resultat apres nettoyage

```text
+--------------------------------------------------+
| Contributeurs            [Filtre annee: 2025 v]  |
| 42 contributeurs cette annee                      |
+--------------------------------------------------+
| Grille d'avatars des contributeurs                |
| (15 affiches + "+X autres")                       |
+--------------------------------------------------+
| Top Donateurs                                     |
| 1. Marie D. -- 500 EUR (3 dons)                   |
| 2. Jean M. -- 300 EUR (2 dons)                    |
+--------------------------------------------------+
```

---

## Fichiers

| Fichier | Action |
|---|---|
| `src/pages/Members.tsx` | Refonte complete : supprimer mock, connecter a `helloasso_members`, calcul statut, bouton sync, export CSV, ligne de resume |
| `src/pages/Contributors.tsx` | Nettoyer : garder grille + top donateurs, supprimer milestones/adhesion/carte/learners/volunteers |
| `src/components/contributors/MembersMap.tsx` | Supprimer |
| `src/components/contributors/ContributorSettingsDialog.tsx` | Supprimer |

## Aucune migration base de donnees

Les tables `helloasso_members` et `helloasso_donors` existent deja avec les bonnes colonnes. L'edge function `sync-helloasso-members` est deployee. Rien a creer cote base.

## Details techniques

### Calcul du statut membre
```text
membership_date + 365 jours = date expiration
- Si expiration > aujourd'hui + 30j : "actif"
- Si expiration entre aujourd'hui et aujourd'hui + 30j : "expire bientot"
- Si expiration < aujourd'hui : "expire"
```

### Slug HelloAsso
Le bouton "Sync HelloAsso" demande le `organizationSlug`. A la premiere utilisation, un dialog simple demande a l'utilisateur de le saisir. Le slug est stocke en `localStorage` pour les syncs suivantes.

### Export CSV
Generation cote client a partir des donnees filtrees du tableau. Colonnes : Nom, Prenom, Email, Ville, Type, Date adhesion, Statut.
