

# Diagnostic : Projets internes vs Gestion des taches

## Le probleme

L'application propose **deux Kanban boards quasi-identiques** dans la sidebar :

| | Projets internes (`/projects`) | Gestion des taches (`/admin`) |
|---|---|---|
| Table Supabase | `projects` | `admin_tasks` |
| Colonnes | Planifie / En cours / Termine | A faire / En cours / Fait |
| Drag-and-drop | Oui (@dnd-kit) | Oui (@dnd-kit) |
| Visible par | Tous (avec approbation) | Admins uniquement |
| Champs | Titre, description, section, statut | Titre, description, priorite, echeance |
| Extras | Timeline reunions, boite a idees, import transcription | Templates auto (AG, cotisations, agrements) |

**Pour un utilisateur lambda, c'est la meme chose presentee deux fois.** La nuance entre "projet" et "tache" n'est pas evidente sans formation. Un admin doit naviguer entre deux pages pour gerer ses actions.

## Ce qui n'est pas valorise ou est de trop

1. **La page Admin (`/admin`) est une copie simplifiee de `/projects`** -- memes 3 colonnes, meme DnD, meme formulaire (titre + description + statut). La seule difference : priorite + echeance sur admin_tasks, et section + meetings sur projects.

2. **Les templates auto-crees** (AG annuelle, cotisations, agrements) sont utiles mais enfouis dans une page separee. Ils devraient etre des projets comme les autres.

3. **NetworkProjects (`/projets-reseau`)** est une vue en lecture seule des memes `projects` filtres par `is_funding_project`. C'est coherent comme vue inter-associations, pas de probleme ici.

4. **La Boite a Idees** fonctionne independamment (table `ideas`, pas liee aux projets). Elle est bien placee en collapsible en bas de page, mais elle pourrait etre supprimee si elle n'est pas utilisee -- c'est une micro-fonctionnalite de plus.

5. **La Timeline des reunions** ajoute une couche de complexite avec son propre formulaire de creation, ses filtres, et la notion de "RDV" vs "transcription importee". C'est un mini-calendrier cache dans la page projets.

## Solution proposee : fusionner en une seule page

### Principe

Supprimer la page Admin (`/admin`) et absorber ses fonctionnalites dans la page Projets (`/projects`). Un seul Kanban, une seule table, une seule entree dans la sidebar.

### Changements concrets

**1. Enrichir la table `projects` avec les champs manquants**

Migration SQL :
- Ajouter `priority` (text, default 'medium') -- les valeurs low/medium/high
- Ajouter `due_date` (date) -- echeance
- Ajouter `template_key` (text) -- pour les taches recurrentes type AG

Ces champs sont optionnels. Un projet peut avoir une echeance ou non, une priorite ou non. Ca ne surcharge pas le formulaire : on ajoute deux champs au dialog existant (un select priorite + un date picker echeance).

**2. Migrer les donnees existantes de `admin_tasks` vers `projects`**

Migration SQL qui copie les taches admin existantes dans `projects` avec un mapping de statut (todo -> planned, in_progress -> in_progress, done -> completed).

**3. Modifier la page Projets**

- Ajouter un badge de priorite sur les cartes Kanban (discret : juste un point colore ou un badge "Urgent" pour les high)
- Afficher l'echeance sur la carte si elle existe (ex: "3j restants" en jaune, "2j en retard" en rouge)
- Les templates (AG annuelle, cotisations, agrements) deviennent des projets crees automatiquement comme avant, mais dans la table `projects`

**4. Modifier le formulaire de creation de projet**

Le formulaire actuel a 4 champs : Titre, Description, Section, Statut. On ajoute :
- Priorite (select : Basse / Normale / Urgente) -- optionnel, defaut Normale
- Echeance (date picker) -- optionnel

Ca fait 6 champs, ca reste raisonnable.

**5. Supprimer la page Admin et ses dependances**

- Supprimer `src/pages/Admin.tsx`
- Retirer l'entree "Gestion des taches" de la sidebar (`HubSidebar.tsx`)
- Retirer le module "admin-tasks" du registre (`useModules.tsx`)
- Retirer la route `/admin` de `App.tsx`
- La table `admin_tasks` peut etre conservee temporairement (au cas ou) ou droppee apres migration

### Ce qu'on ne touche PAS

- La Boite a Idees : elle reste en collapsible en bas, c'est leger
- La Timeline des reunions : elle reste, c'est le lien entre decisions et actions
- NetworkProjects (`/projets-reseau`) : vue inter-associations, pas de changement
- L'import de transcription : reste tel quel

## Fichiers concernes

| Fichier | Action |
|---|---|
| Migration SQL | Ajouter `priority`, `due_date`, `template_key` a `projects` + migrer les donnees de `admin_tasks` |
| `src/pages/Admin.tsx` | Supprimer |
| `src/pages/Projects.tsx` | Ajouter la logique de templates auto-crees (AG, cotisations, agrements) |
| `src/components/ProjectForm.tsx` | Ajouter les champs Priorite et Echeance |
| `src/components/projects/ProjectsKanban.tsx` | Afficher priorite et echeance sur les cartes |
| `src/components/hub/HubSidebar.tsx` | Retirer l'entree `/admin` |
| `src/hooks/useModules.tsx` | Retirer le module `admin-tasks` |
| `src/App.tsx` | Retirer la route `/admin` |
| `src/integrations/supabase/types.ts` | Sera regenere apres migration |

## Resultat pour l'utilisateur

Avant : 2 pages Kanban, 2 tables, 2 entrees sidebar, confusion entre "projet" et "tache".

Apres : 1 seule page "Projets", un Kanban unifie. Les echeances et priorites sont visibles directement sur les cartes. Les taches recurrentes (AG, cotisations) apparaissent comme des projets normaux. Zero confusion.

