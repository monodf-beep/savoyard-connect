
# Timeline des reunions integree a la page Projets

## Pourquoi pas une page separee

Une page `/calendrier` cree une rupture : le membre doit naviguer entre deux ecrans pour comprendre "d'ou viennent ces projets". Le calendrier seul n'a pas assez de valeur pour justifier une page entiere -- c'est un outil de contexte, pas une destination.

## Ce qu'on construit a la place

Un **bandeau collapsible** en haut de la page Projets, au-dessus du Kanban :

```text
+---------------------------------------------------------------+
|  [v] Dernieres reunions                                        |
|                                                                |
|  19 fev  |  Reunion CA           | 5 participants | 3 actions  |
|           Resume IA en 3 lignes...                             |
|           [Voir les projets issus]                             |
|                                                                |
|  12 fev  |  Commission sport     | 3 participants | 1 action   |
|           Resume IA en 3 lignes...                             |
|                                                                |
+---------------------------------------------------------------+
|                                                                |
|  Planifie    |    En cours     |    Termine                    |
|  [Kanban cards filtered or not]                                |
+---------------------------------------------------------------+
```

### Comportement

- Par defaut : le bandeau est **replie** (juste le titre "Dernieres reunions" + nombre)
- Deplie : affiche les 5 dernieres reunions avec resume, participants, nombre d'actions generees
- Cliquer sur "Voir les projets issus" filtre le Kanban pour ne montrer que les projets crees depuis cette transcription
- Un bouton "Tout afficher" reinitialise le filtre

### Lien reunion-projet

Pour tracer l'origine, on ajoute un champ `source_meeting_id` a la table `projects`. Quand `process-transcript` cree des projets, il les lie a la reunion correspondante. Ca permet le filtre direct.

## Plan technique

### 1. Table `meetings` (migration SQL)

| Colonne | Type | Description |
|---------|------|-------------|
| id | uuid PK | |
| google_event_id | text unique | ID Google Calendar (nullable si pas encore connecte) |
| title | text | Titre de l'evenement |
| start_time | timestamptz | Debut |
| end_time | timestamptz | Fin |
| attendees | jsonb | Liste [{email, name, rsvp}] |
| ai_summary | text | Resume IA 3 lignes |
| transcript_filename | text | Nom du fichier source |
| association_id | uuid FK | Lien vers l'association |
| created_at | timestamptz | |

RLS : lecture pour tous les membres de l'association.

### 2. Colonne `source_meeting_id` sur `projects`

Ajout d'une colonne nullable `source_meeting_id uuid REFERENCES meetings(id)` a la table `projects`. Permet de filtrer les projets par reunion source.

### 3. Mise a jour de `process-transcript`

Quand une transcription est traitee :
1. Creer un enregistrement `meetings` avec le titre et la date extraits du fichier
2. Demander a Gemini un resume en 3 lignes (nouvel outil `generate_meeting_summary`)
3. Stocker le resume dans `meetings.ai_summary`
4. Lier chaque projet cree via `source_meeting_id`

### 4. Hook `useMeetings.ts`

- Charge les 10 dernieres reunions de l'association avec le nombre de projets lies
- Expose une fonction pour filtrer par meeting_id

### 5. Composant `MeetingsTimeline.tsx`

- Bandeau collapsible avec les dernieres reunions
- Chaque ligne : date, titre, nombre de participants, nombre de projets, resume IA
- Bouton "Voir les projets" qui emet un callback `onFilterByMeeting(meetingId)`
- Bouton "Tout afficher" pour reinitialiser

### 6. Integration dans `Projects.tsx`

- Ajout du composant `MeetingsTimeline` au-dessus du Kanban
- Etat `filterMeetingId` qui filtre `filteredProjects` par `source_meeting_id`
- Pas de nouvelle route, pas de nouvelle entree sidebar

### 7. Edge function `sync-google-calendar` (inchangee)

Toujours prevue pour plus tard. Pour l'instant, les reunions sont creees automatiquement par l'import de transcription. Quand Google Calendar sera connecte, il enrichira les reunions existantes avec les vrais participants et horaires.

## Fichiers a creer/modifier

| Fichier | Action |
|---------|--------|
| Migration SQL | Creer table `meetings` + colonne `source_meeting_id` sur `projects` |
| `src/hooks/useMeetings.ts` | Creer : charger les reunions recentes |
| `src/components/projects/MeetingsTimeline.tsx` | Creer : bandeau collapsible |
| `src/pages/Projects.tsx` | Ajouter le bandeau + filtre par meeting |
| `supabase/functions/process-transcript/index.ts` | Ajouter creation meeting + resume IA + lien projets |

## Ce qu'on ne fait PAS

- Pas de page `/calendrier` separee
- Pas d'entree dans la sidebar
- Pas de sync Google Calendar pour l'instant (sera ajoute quand le compte de service sera configure)
- Pas de vue calendrier mensuelle -- une simple timeline suffit pour le contexte
