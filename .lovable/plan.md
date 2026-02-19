

# Simplification du Dashboard

## Problemes identifies

1. **Taches fictives** : quand il n'y a pas de taches reelles, 2 fausses taches sont affichees
2. **KPI redondants** : "Taches" et "En attente" se chevauchent -- 4 cards pour trop peu d'info
3. **Actions rapides inutiles** : doublonnent la sidebar, "Ajouter un document" est un faux label
4. **Notification factice** : "Nouveau projet / Hier" en dur dans le header
5. **Onboarding non traduit** : cles brutes affichees ("profile", "logo")
6. **Double separateur** dans le menu profil du header
7. **Breadcrumb redondant** sur la page dashboard

## Plan de simplification

### 1. Supprimer les fausses taches (`HubDashboardLayout.tsx`)

Remplacer les taches fictives (lignes 98-101) par un etat vide clair :
- Si aucune tache reelle : afficher un message "Aucune tache en cours" avec un bouton "Creer une tache" qui redirige vers `/admin`
- Plus jamais de donnees inventees

### 2. Reduire les KPI de 4 a 3 (`HubDashboardLayout.tsx`)

Supprimer le KPI "En attente" (doublon de "Taches"). Garder :
- **Membres** (reel)
- **Projets** (reel)
- **Taches** (reel)

3 cards au lieu de 4, layout `grid-cols-3` sur desktop.

### 3. Supprimer le bloc "Actions rapides" (`HubDashboardLayout.tsx`)

Retirer entierement la card "Actions rapides" (lignes 261-276). Ces 3 boutons dupliquent la sidebar. Le dashboard devient plus epure : juste les KPI + la liste de taches + l'onboarding.

### 4. Supprimer la notification factice (`GlobalHeader.tsx`)

Remplacer le contenu du dropdown notifications (lignes 161-171) par un etat vide : "Aucune notification" au lieu de la fausse notification "Nouveau projet".

### 5. Ajouter les traductions de l'onboarding (`fr.ts`, `it.ts`)

Ajouter les cles manquantes dans les fichiers i18n :

```text
onboarding.title = "Demarrage rapide"
onboarding.steps.profile.title = "Completer le profil"
onboarding.steps.profile.description = "Ajoutez le nom et la description de votre association"
onboarding.steps.logo.title = "Ajouter un logo"
onboarding.steps.logo.description = "Personnalisez l'identite visuelle"
onboarding.steps.members.title = "Inviter des membres"
onboarding.steps.members.description = "Ajoutez au moins 3 membres"
onboarding.steps.project.title = "Creer un projet"
onboarding.steps.project.description = "Lancez votre premier projet"
```

### 6. Fix double separateur (`GlobalHeader.tsx`)

Supprimer le `DropdownMenuSeparator` en double (ligne 200 ou 201).

### 7. Supprimer le breadcrumb sur le dashboard (`HubDashboardLayout.tsx`)

Ne pas passer de `breadcrumb` au `GlobalHeader` quand on est sur le dashboard -- c'est evident qu'on y est. Le breadcrumb reste utile sur les autres pages.

---

## Resultat attendu

Le dashboard passe de **5 blocs** (KPI + Taches + Actions rapides + Onboarding + Header charge) a **3 blocs** :
- 3 KPI reels et lisibles
- Liste de taches reelles (ou etat vide propre)
- Checklist d'onboarding (correctement traduite)

Zero fausse donnee, zero doublon, zero bruit visuel.

## Fichiers modifies

| Fichier | Modification |
|---------|-------------|
| `src/components/hub/HubDashboardLayout.tsx` | Supprimer fausses taches, reduire KPI a 3, supprimer actions rapides, retirer breadcrumb |
| `src/components/hub/GlobalHeader.tsx` | Supprimer notification factice, fix double separateur |
| `src/i18n/locales/fr.ts` | Ajouter cles onboarding |
| `src/i18n/locales/it.ts` | Ajouter cles onboarding |

