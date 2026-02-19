

# Critique et refonte de la page Chaines de Valeur

## Diagnostic : ce qui ne va pas

### 1. Trop de couches de navigation -- "usine a gaz"

L'utilisateur arrive sur la page et voit **trois zones en meme temps** :
- La **sidebar gauche** (liste des chaines, recherche, bouton creer) = 288px
- Le **canvas central** (ReactFlow avec noeuds draggables, zoom, pan, grille)
- Le **panneau detail droit** qui s'ouvre en overlay quand on clique un segment = 320px

Ca fait **3 niveaux de navigation sur une seule page**, en plus de la sidebar principale de l'app. Sur un ecran 1366px, il reste ~700px pour le canvas. C'est claustrophobe.

### 2. Le workflow ReactFlow est over-engineere

Le canvas ReactFlow offre :
- Drag & drop libre des noeuds avec snap-to-grid (20px)
- Sauvegarde des positions X/Y et du viewport (zoom/pan)
- Detection de "unsaved changes" avec alerte avant de quitter
- Hover highlighting des edges connectes
- Bouton "+" dynamique qui suit le dernier noeud
- Bouton "Reorganiser" avec annulation
- Bouton "Sauvegarder les positions"

**Pour quoi faire ?** Les chaines de valeur d'une association ont typiquement 3-7 etapes lineaires. C'est un flux sequentiel (A -> B -> C), pas un graphe complexe. ReactFlow est un outil prevu pour des workflows DAG avec des branches, des conditions, des boucles. Ici c'est un marteau-pilon pour ecraser une mouche.

L'utilisateur moyen ne comprend pas pourquoi il peut deplacer les cartes, ne sait pas qu'il faut sauvegarder les positions, et n'a aucun besoin de zoom/pan sur 5 cartes.

### 3. Toggle Workflow/Kanban : deux vues pour rien

Il y a un toggle entre mode "Workflow" (ReactFlow) et "Kanban" (colonnes horizontales). Les deux montrent exactement la meme information (nom du segment + acteurs) dans deux presentations differentes. Ca force l'utilisateur a choisir sans raison.

### 4. Fusionner/Scinder : fonctions expertes exposees

Les boutons "Fusionner" et "Scinder" sont dans la barre d'outils principale. Ce sont des operations avancees que 99% des utilisateurs ne feront jamais. Leur presence ajoute du bruit cognitif.

### 5. Systeme d'approbation visible en permanence

Le badge "En attente" et les actions "Approuver/Rejeter" sont toujours visibles. Pour une association avec 3-4 chaines, ce workflow d'approbation est disproportionne.

### 6. Fichiers morts

- `ValueChainFlowDiagram.tsx` : jamais importe nulle part (ancien composant remplace par WorkflowCanvas)
- `MinimalChainDisplay.tsx` : jamais importe nulle part (ancien composant remplace par KanbanChainDisplay)

### 7. Le panneau de details : repetitif

Le `SegmentDetailPanel` affiche exactement les memes infos que le noeud du canvas (nom + acteurs), juste en plus grand. Il n'ajoute aucune information supplementaire. C'est un clic de plus pour rien.

---

## Solution : une seule vue, zero sidebar supplementaire

### Principe

Supprimer la complexite et adopter une vue unique, lineaire, lisible immediatement. Pas de ReactFlow, pas de sidebar de selection, pas de panneau de details en overlay.

### Nouvelle architecture

```text
+--------------------------------------------------+
| Chaines de valeur                    [+ Creer]   |
| Visualisez les processus operationnels            |
+--------------------------------------------------+
| [Recherche...] (filtre inline, pas de sidebar)    |
+--------------------------------------------------+
|                                                    |
| === Production editoriale ===        [Modifier]   |
|                                                    |
| [Acquisition] --> [Edition] --> [Publication]      |
|  Marie D.          Jean M.       Section Com.      |
|  Paul R.           Lucie B.                        |
|                                                    |
| === Gestion evenementielle ===       [Modifier]   |
|                                                    |
| [Planification] --> [Logistique] --> [Suivi]       |
|  Section Bureau     Pierre K.        Marie D.      |
|                                                    |
+--------------------------------------------------+
```

### Ce qu'on garde
- Formulaire de creation/edition (dialog existant, il fonctionne bien)
- Suppression avec confirmation
- Donnees Supabase (hook `useValueChains` -- intact)

### Ce qu'on supprime
- **ChainSidebar** : la liste des chaines sera inline dans la page, pas dans une sidebar separee
- **WorkflowCanvas** : remplace par un affichage lineaire simple (fleches entre blocs)
- **SegmentDetailPanel** : les acteurs sont deja visibles sur chaque segment, pas besoin d'un panneau supplementaire
- **ValueChainFlowDiagram.tsx** : code mort
- **MinimalChainDisplay.tsx** : code mort
- **KanbanChainDisplay** : plus besoin de deux vues
- Toggle Workflow/Kanban
- Boutons Fusionner/Scinder (garder les fonctions dans le hook mais retirer de l'UI)
- Boutons "Sauvegarder positions" / "Reorganiser" / "Annuler"
- ReactFlow (la dependance `reactflow` peut rester pour le moment mais n'est plus utilisee sur cette page)

### La nouvelle vue

Chaque chaine s'affiche comme un **bloc accordeon** :
- **Ferme** : titre + nombre d'etapes + badge "En attente" si applicable
- **Ouvert** : affichage lineaire horizontal des segments (fleches entre eux), chaque segment montre son nom et ses acteurs (avatars + noms)

Pour editer, on clique "Modifier" qui ouvre le dialog existant (`ValueChainForm`). C'est tout.

## Fichiers

| Fichier | Action |
|---|---|
| `src/pages/ValueChains.tsx` | Refonte : supprimer sidebar/canvas/panneau detail, afficher les chaines en blocs accordeon avec vue lineaire |
| `src/components/valueChain/ValueChainFlowDiagram.tsx` | Supprimer (code mort) |
| `src/components/valueChain/MinimalChainDisplay.tsx` | Supprimer (code mort) |
| `src/components/valueChain/KanbanChainDisplay.tsx` | Supprimer (remplace par vue inline) |
| `src/components/valueChain/WorkflowCanvas.tsx` | Supprimer (remplace par vue lineaire) |
| `src/components/valueChain/ChainSidebar.tsx` | Supprimer (remplace par recherche inline) |
| `src/components/valueChain/SegmentDetailPanel.tsx` | Supprimer (info deja visible sur les segments) |

Le hook `useValueChains.ts` reste intact -- les fonctions `mergeChains`, `splitChain`, `saveSegmentPositions` restent disponibles si besoin futur mais ne sont plus exposees dans l'UI.

Le `ValueChainForm.tsx` reste intact -- c'est le dialog d'edition qui fonctionne bien.

