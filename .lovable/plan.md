
# Simplification de l'en-tete de l'organigramme

## Probleme

L'en-tete actuel occupe 4 lignes avant le contenu :
1. Titre "Organigramme" + icone info + badge "29 membres" + bouton "Postes vacants"
2. Description "Vue complete de la structure organisationnelle"
3. Barre de controles (recherche + toggle vue + Vue d'ensemble + expand/collapse)
4. Hint "Glissez-deposez..." (admin)

## Solution

Fusionner en 2 lignes maximum :
- **Ligne 1** : Titre "Organigramme" + badge membres + bouton postes vacants (deja dans Index.tsx, inchange)
- **Ligne 2** : Barre de controles uniquement (recherche + toggle vue + Vue d'ensemble + expand/collapse)

Supprimer :
- La description "Vue complete de la structure organisationnelle" (dans Index.tsx si elle existe, ou dans HubPageLayout)
- Le hint "Glissez-deposez..." (admin le sait deja)

## Detail technique

### Fichier : `src/pages/Index.tsx`

Verifier et supprimer toute description sous le titre. Actuellement le fichier ne montre pas de description explicite, donc c'est probablement dans `HubPageLayout`. Je vais verifier et supprimer la prop ou le texte correspondant.

### Fichier : `src/components/Organigramme.tsx`

1. **Supprimer le hint drag-and-drop** (lignes 1019-1022) : le bloc `isAdmin && <div>Glissez-deposez...</div>` est retire.

2. **Reduire le margin du header** : `mb-3 md:mb-6` devient `mb-2 md:mb-3` (ligne 734) pour rapprocher la toolbar du contenu.

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/Organigramme.tsx` | Supprimer le hint drag-and-drop (lignes 1019-1022), reduire les marges du header |
| `src/pages/Index.tsx` | Aucune modification necessaire (pas de description visible) |
