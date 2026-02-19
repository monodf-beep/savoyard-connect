
# Avatars condenses quand la section est repliee

## Objectif

Quand une section est **repliee**, afficher une rangee d'avatars superposees (style "avatar stack") directement dans le header de la section, a cote du compteur de membres. Quand la section est **depliee**, afficher les cartes completes avec noms comme actuellement.

## Rendu visuel

- **Section repliee** : le header affiche le titre, le badge Resp., puis une rangee d'avatars circulaires qui se chevauchent legerement (overlap de -8px), limite a ~8 avatars visibles + un badge "+X" si plus. Cela remplace le simple compteur "12 membres".
- **Section depliee** : le header n'affiche plus les avatars (ils sont visibles en dessous sous forme de cartes completes). Le compteur texte reste visible.

## Modifications

### 1. `src/components/SectionCard.tsx`

**Section principale (isMainSection)** — dans le header (ligne ~162-186) :

- Quand `!section.isExpanded` et qu'il y a des membres, afficher un composant "avatar stack" inline :
  - Prendre les 8 premiers membres
  - Les afficher avec `Avatar` (taille `w-6 h-6`) avec un `margin-left: -8px` (sauf le premier)
  - Si plus de 8 membres, ajouter un petit cercle "+N"
  - Garder le compteur texte "X membres" a cote
- Quand `section.isExpanded`, garder uniquement le compteur texte comme actuellement

**Sous-sections** (deuxieme return, ligne ~360+) — meme logique dans le header replié.

### 2. Aucun autre fichier modifie

Le composant `Avatar`/`AvatarImage`/`AvatarFallback` existant est reutilise directement dans SectionCard. Pas besoin de nouveau composant.

---

## Detail technique

Code a inserer dans le header, apres le badge Resp. et avant le compteur :

```text
{!section.isExpanded && section.members.length > 0 && (
  <div className="flex items-center ml-2 flex-shrink-0">
    {section.members.slice(0, 8).map((person, index) => (
      <Avatar 
        key={person.id} 
        className="w-6 h-6 border-2 border-background"
        style={{ marginLeft: index === 0 ? 0 : -8 }}
      >
        <AvatarImage src={person.photo} />
        <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
          {person.firstName.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ))}
    {section.members.length > 8 && (
      <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center 
                       text-[9px] font-medium text-muted-foreground border-2 border-background"
            style={{ marginLeft: -8 }}>
        +{section.members.length - 8}
      </span>
    )}
  </div>
)}
```

Ce bloc sera ajoute dans les deux blocs de rendu (section principale et sous-section).

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/SectionCard.tsx` | Ajouter avatar stack dans les headers replies (2 endroits), importer Avatar/AvatarImage/AvatarFallback |
