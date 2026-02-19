
# Simplification de la toolbar desktop

## Changements

### 1. Fusionner "Tout deplier" / "Tout replier" en un seul bouton toggle

Remplacer les deux boutons par un seul bouton discret qui alterne entre les deux etats :
- Si au moins une section est repliee : affiche l'icone "Expand" et fait `expandAll()` au clic
- Si toutes les sections sont depliees : affiche l'icone "Shrink" et fait `collapseAll()` au clic
- Pas de texte, juste une icone (variante `ghost`, taille `icon` ou `sm`) avec un tooltip optionnel
- On determine l'etat via un `useMemo` qui verifie recursivement si toutes les sections visibles sont `isExpanded === true`

### 2. Renommer "Aller a..." en "Vue d'ensemble"

Le bouton dropdown s'appelle "Vue d'ensemble" au lieu de "Aller a..." :
- Icone `LayoutGrid` ou `Map` de lucide-react
- Le dropdown liste les sections racines (en gras) avec leurs sous-sections indentees et le nombre de membres
- Clic sur un item = scroll fluide + depliage automatique

### Resultat visuel de la toolbar

```text
[Rechercher...]  [Ligne|Membres]  [Vue d'ensemble v]  [⊞] 
                                                        ^
                                                   toggle deplier/replier (icone seule)
```

La barre passe de 4 boutons + champ de recherche a 2 boutons + 1 icone + champ de recherche. Beaucoup plus epuree.

## Detail technique

### Fichier modifie : `src/components/Organigramme.tsx`

**Imports a ajouter** :
- `DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator` depuis `@/components/ui/dropdown-menu`
- `Avatar, AvatarImage, AvatarFallback` depuis `@/components/ui/avatar`
- `Tooltip, TooltipContent, TooltipTrigger, TooltipProvider` depuis `@/components/ui/tooltip`
- Icones : `LayoutGrid` ou `MapPin` depuis lucide-react

**Nouveau `useMemo`** (~5 lignes) :
```text
const allExpanded = useMemo(() => {
  const check = (sections: Section[]): boolean =>
    sections.every(s => s.isExpanded && (!s.subsections || check(s.subsections)));
  return check(searchFilteredSections);
}, [searchFilteredSections]);
```

**Fonction `scrollToSection`** (~10 lignes) :
- Accepte `sectionId` et optionnel `parentId`
- Deplie le parent si fourni via `toggleSection`
- Deplie la section cible
- `setTimeout(150ms)` puis `scrollIntoView({ behavior: 'smooth', block: 'start' })`

**Remplacer les 2 boutons expand/collapse** (lignes 907-928) par un seul bouton icone :
```text
<Tooltip>
  <TooltipTrigger asChild>
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      onClick={() => allExpanded ? collapseAll() : expandAll()}
    >
      {allExpanded ? <Shrink className="w-4 h-4" /> : <Expand className="w-4 h-4" />}
    </Button>
  </TooltipTrigger>
  <TooltipContent>{allExpanded ? 'Tout replier' : 'Tout deplier'}</TooltipContent>
</Tooltip>
```

**Ajouter le dropdown "Vue d'ensemble"** juste avant le bouton toggle :
```text
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button variant="outline" size="sm" className="h-8 px-3">
      <LayoutGrid className="w-3.5 h-3.5 mr-1.5" />
      <span className="text-xs">Vue d'ensemble</span>
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
    {searchFilteredSections.map(section => (
      <React.Fragment key={section.id}>
        <DropdownMenuItem 
          onClick={() => scrollToSection(section.id)}
          className="font-medium"
        >
          {section.title}
          <span className="ml-auto text-xs text-muted-foreground">
            {getTotalCount(section)}
          </span>
        </DropdownMenuItem>
        {section.subsections?.filter(s => !s.isHidden).map(sub => (
          <DropdownMenuItem
            key={sub.id}
            onClick={() => scrollToSection(sub.id, section.id)}
            className="pl-6 text-muted-foreground"
          >
            {sub.title}
            <span className="ml-auto text-xs">{sub.members.length}</span>
          </DropdownMenuItem>
        ))}
      </React.Fragment>
    ))}
  </DropdownMenuContent>
</DropdownMenu>
```

**Fonction utilitaire `getTotalCount`** (~5 lignes) : comptage recursif des membres (existe deja dans le code mobile, a extraire en helper local).

### Mobile

Dans le Sheet mobile existant, les boutons "Tout deplier" / "Tout replier" restent tels quels (ils sont deja dans un menu secondaire, pas envahissants).

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/Organigramme.tsx` | Remplacer 2 boutons par 1 toggle icone, ajouter dropdown "Vue d'ensemble", imports, `scrollToSection`, `allExpanded`, `getTotalCount` |
