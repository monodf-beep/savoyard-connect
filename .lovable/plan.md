

# Simplification de la page Projets (avec conservation de la Boite a Idees)

## Philosophie

Garder la Boite a Idees comme composant autonome (embeddable sur un site externe), mais la simplifier radicalement et la sortir de la sidebar pour liberer l'espace projet.

---

## Ce qui change

### 1. Page Projets : layout pleine largeur

**Avant** : Kanban (60%) + Sidebar IdeaBox (380px) cote a cote
**Apres** : Kanban 100% largeur, puis section Boite a Idees en dessous (pliable)

- Supprimer le toggle Grille/Kanban (garder Kanban seul)
- Supprimer le filtre par statut (inutile avec le Kanban qui filtre visuellement)
- Supprimer `ProjectGridCard.tsx` (plus utilise)
- Supprimer `ProjectDetailDrawer.tsx` (n'affiche que titre/description/statut, sans action possible -- inutile)
- Le clic sur une carte projet ouvre directement le formulaire d'edition (admin) ou ne fait rien (non-admin, les infos sont deja visibles sur la carte)

**Fichier** : `src/pages/Projects.tsx`

### 2. Boite a Idees : simplification du vote

**Avant** : 3 onglets (Soumettre / Voter / Classement), systeme de 25 points avec +/- par idee
**Apres** : Un seul ecran avec :
- Liste des idees triees par votes, chaque idee a un bouton "upvote" (pouce, 1 vote = 1 clic, toggle on/off)
- Un champ texte + bouton en bas pour soumettre une nouvelle idee
- Plus de systeme de points, plus d'onglets

Le composant reste autonome et embeddable. On ajoute une prop optionnelle `embedded?: boolean` pour masquer le padding/border quand utilise en iframe.

**Fichier** : `src/components/projects/IdeaBox.tsx`

### 3. Formulaire projet unique

Fusionner `ProjectForm` et `SimpleProjectForm` en un seul formulaire simple :
- Champs : Titre, Description, Section, Statut (4 champs)
- Supprimer : Roadmap, Documents par URL, Cover image URL, Funding toggle et sous-champs, Dates debut/fin
- Le financement est gere depuis la page Finance existante

**Fichiers** : `src/components/ProjectForm.tsx` (simplifier), `src/components/projects/SimpleProjectForm.tsx` (supprimer)

### 4. Integration dans la page

La Boite a Idees apparait sous le Kanban dans un `Collapsible` :
- Header : "Boite a Idees" avec icone ampoule + chevron
- Ouverte par defaut
- Peut etre fermee pour se concentrer sur les projets

---

## Fichiers impactes

| Fichier | Action |
|---------|--------|
| `src/pages/Projects.tsx` | Refactorer : layout plein ecran, retirer sidebar, ajouter IdeaBox en section pliable, retirer vue grille et toggle, retirer drawer |
| `src/components/projects/IdeaBox.tsx` | Refonte : vote simple upvote/toggle, un seul ecran, prop `embedded` |
| `src/components/ProjectForm.tsx` | Simplifier : garder 4 champs (titre, description, section, statut) |
| `src/components/projects/SimpleProjectForm.tsx` | Supprimer |
| `src/components/projects/ProjectGridCard.tsx` | Supprimer |
| `src/components/projects/ProjectDetailDrawer.tsx` | Supprimer |

---

## Section technique

### Vote simplifie (IdeaBox)

Logique actuelle : chaque utilisateur distribue 25 points entre les idees (insert/update `idea_votes` avec `points`).

Nouvelle logique : chaque utilisateur peut voter 1 fois par idee (toggle). La table `idea_votes` reste, mais `points` sera toujours 1 ou supprime. Le `votes_count` sur `ideas` continue de fonctionner.

### Prop embedded

```tsx
interface IdeaBoxProps {
  embedded?: boolean; // masque bordures/padding pour usage iframe
}
```

### Suppression du ProjectDetailDrawer

Le clic sur une carte Kanban ouvrira le formulaire projet en mode edition (si admin) ou affichera un Dialog lecture seule minimal (titre + description + statut) inline dans le meme composant.

