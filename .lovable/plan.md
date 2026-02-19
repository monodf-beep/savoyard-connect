

# Afficher les avatars des sous-sections dans les en-tetes des sections parentes

## Probleme

Quand une section parente comme "Commissions" ou "Groupes de travail" est repliee, aucun avatar n'apparait dans l'en-tete car ces sections n'ont pas de membres directs -- les membres sont dans les sous-sections. Seules "Bureau" et "Conseil d'administration" affichent des avatars car elles ont des membres directs.

## Solution

Modifier `SectionCard.tsx` pour collecter recursivement tous les membres (y compris ceux des sous-sections) et les afficher dans l'avatar stack quand la section est repliee. Ainsi "Commissions" affichera les avatars de tous les membres de toutes ses sous-commissions.

## Detail technique

### Fichier : `src/components/SectionCard.tsx`

1. **Ajouter une fonction `getAllMembers`** qui collecte recursivement tous les membres d'une section et ses sous-sections :

```typescript
const getAllMembers = (s: Section): Person[] => {
  let all = [...s.members];
  if (s.subsections) {
    s.subsections.forEach(sub => {
      all = all.concat(getAllMembers(sub));
    });
  }
  return all;
};
const allMembers = getAllMembers(section);
```

2. **Remplacer `section.members` par `allMembers`** dans les 2 blocs d'affichage d'avatars (section repliee) :
   - Ligne 184 : condition `section.members.length > 0` devient `allMembers.length > 0`
   - Ligne 186 : `section.members.slice(0, 8)` devient `allMembers.slice(0, 8)`
   - Ligne 198-201 : `section.members.length` devient `allMembers.length`
   - Ligne 411 : idem pour la version mobile
   - Lignes 413, 425-429 : idem

3. **Aussi afficher le leader si present** : si une section parente a un `leader` et que les sous-sections ont aussi des leaders, ceux-ci seront naturellement inclus car ils sont dans les `members` des sous-sections.

4. **Deduplication** : filtrer les doublons par `id` (une personne peut apparaitre dans plusieurs sous-sections) :

```typescript
const allMembers = [...new Map(getAllMembers(section).map(m => [m.id, m])).values()];
```

## Resultat attendu

```text
> Commissions   [avatar1 avatar2 avatar3 avatar4 avatar5 +17]
> Groupes de travail   [avatar1 avatar2 avatar3 +8]
```

Les sections parentes affichent desormais un apercu de tous leurs membres, meme quand les membres sont repartis dans les sous-sections.

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/SectionCard.tsx` | Ajouter `getAllMembers` recursif, remplacer `section.members` par `allMembers` dans les 2 blocs d'avatar stack (desktop ligne 184-203, mobile ligne 411-430) |

