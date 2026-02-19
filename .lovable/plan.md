

# Simplification UX sans supprimer de modules

## Principe

Tous les modules restent disponibles dans le Store. On change uniquement les **valeurs par defaut** et on nettoie les elements trompeurs.

---

## 1. Defaults plus raisonnables (`src/hooks/useModules.tsx`)

Passer `defaultEnabled: false` pour les modules qui utilisent des donnees fictives, afin que les nouvelles associations ne soient pas submergees. Les associations existantes qui les ont deja actives ne sont pas impactees.

Modules qui passent a `defaultEnabled: false` :
- `finance` (deja false)
- `value-chains` (deja false)
- `jobs` (deja false)
- `members` (passe de true a false -- donnees mock)

Restent `defaultEnabled: true` : `dashboard`, `accompagnateur`, `organigramme`, `projects`

## 2. Supprimer les faux signaux (`src/components/hub/GlobalHeader.tsx`)

- Retirer le badge notification "2" en dur sur la cloche (fausse notification)
- Retirer le selecteur d'association en double dans le menu profil (deja present dans le header)

## 3. Sidebar : groupes visuels (`src/components/hub/HubSidebar.tsx`)

Ajouter des separateurs visuels entre les categories de modules pour une meilleure lisibilite :
- **Mon association** : Dashboard, Accompagnateur, modules de gestion actifs
- **Reseau** : modules reseau actifs
- **Administration** : Module Store, Parametres

## 4. Fix route `/hub` (`src/App.tsx`)

L'utilisateur est actuellement sur `/hub` -- verifier que la redirection vers `/dashboard` fonctionne correctement avec un `Navigate` au lieu d'un rendu direct.

## 5. Fix toggle admin sur Jobs (`src/pages/Jobs.tsx`)

Supprimer le bouton toggle "Admin" manuel et utiliser directement `isAdmin` de `useAuth()`.

---

## Details techniques

### `useModules.tsx`
- Changer `members` de `defaultEnabled: true` a `defaultEnabled: false`

### `GlobalHeader.tsx`
- Supprimer le badge "2" sur l'icone cloche
- Supprimer le bloc selecteur d'association dans le dropdown profil

### `HubSidebar.tsx`
- Grouper les items par categorie avec des separateurs texte discrets (ex: "GESTION", "RESEAU")

### `App.tsx`
- Remplacer `<Route path="/hub" element={<Dashboard />} />` par `<Route path="/hub" element={<Navigate to="/dashboard" replace />} />`

### `Jobs.tsx`
- Remplacer le state `isAdmin` local + toggle par `const { isAdmin } = useAuth()`

