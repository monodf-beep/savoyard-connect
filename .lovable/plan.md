
# Suppression du Hub Réseau et simplification de la navigation

## Pourquoi supprimer le Hub ?

Depuis la migration de toutes les fonctionnalités (Annuaire, Experts, Mutualisation, etc.) dans le contexte association via le Store de modules, le Hub Réseau n'a plus de raison d'exister :

- Les raccourcis du Hub pointent vers des pages accessibles dans la sidebar
- Le sélecteur d'association est deja dans le header global
- Les stats réseau peuvent etre integrees au Dashboard
- Le double contexte hub/association complexifie l'UX sans apporter de valeur

## Ce qui change

### 1. Flux de connexion simplifie

**Avant** : Login -> Hub -> Choisir asso -> Dashboard
**Apres** : Login -> Dashboard (association auto-selectionnee ou choix si plusieurs)

### 2. Fichiers a supprimer

- `src/pages/Hub.tsx` : page Hub complete
- `src/hooks/useNetworkStats.ts` : stats reseau (plus utilisees)
- `src/components/hub/HubKPICards.tsx` : cartes KPI du hub
- `src/components/hub/HubQuickActions.tsx` : actions rapides du hub
- `src/components/hub/HubActivityTimeline.tsx` : timeline hub
- `src/components/hub/HubOnboardingCard.tsx` : onboarding hub

### 3. Fichiers a modifier

**`src/hooks/useAssociation.tsx`**
- Supprimer le type `ContextType` et la dualite hub/association
- Supprimer `selectHubContext`, `currentContext`, `setCurrentContext`
- Au login, auto-selectionner la premiere association (ou la derniere utilisee)
- Si aucune association, rediriger vers `/onboarding-asso`

**`src/components/hub/HubSidebar.tsx`**
- Supprimer `hubNetworkItems` (le tableau avec un seul item "Home Hub")
- Supprimer toute la logique de contexte `if (currentContext === 'hub')`
- Ne garder que les `associationItems` filtres par modules
- Renommer le composant en `AppSidebar` (optionnel, pour clarte)

**`src/components/hub/HubPageLayout.tsx`** et **`src/components/hub/HubDashboardLayout.tsx`**
- Supprimer les references au contexte hub
- Supprimer le bouton "Retour au Hub Reseau"
- Simplifier le menu mobile : plus de switch hub/asso

**`src/components/hub/MobileBottomNav.tsx`**
- Supprimer la branche `if (currentContext === 'hub')` qui affichait des nav items hub
- Ne garder que la navigation association

**`src/components/hub/GlobalHeader.tsx`**
- Supprimer l'option "Retour au Hub" du switcher
- Le switcher ne fait plus que changer d'association

**`src/App.tsx`**
- Supprimer la route `/hub`
- Rediriger les utilisateurs connectes vers `/dashboard` par defaut

**`src/i18n/locales/fr.ts`** et **`src/i18n/locales/it.ts`**
- Nettoyer les cles de traduction `hubNetwork`, `hubHome`, `returnToHub`, etc.

### 4. Recuperer les elements utiles du Hub

Les quelques elements de valeur du Hub seront redistribues :

- **Stats reseau** : integrees au Dashboard sous forme de petit widget "Mon reseau" (nombre d'assos, de projets)
- **Liste associations** : deja dans le header via `AssociationSwitcher`, suffisant
- **Bouton "Creer une association"** : deja dans le switcher du header
- **Silos Sport/Culture** : restent accessibles via les landing pages publiques et la sidebar

## Details techniques

### Simplification du contexte

```text
AVANT:
useAssociation() -> currentContext: 'hub' | 'association'
                 -> selectHubContext()
                 -> selectAssociationContext(asso)

APRES:
useAssociation() -> currentAssociation (toujours defini si connecte)
                 -> setCurrentAssociation(asso)
```

### Redirections

```text
/hub           -> redirige vers /dashboard
Login reussi   -> /dashboard (au lieu de /hub)
Aucune asso    -> /onboarding-asso
```

### Impact sur la sidebar

```text
AVANT (contexte hub):     Sidebar avec 1 seul item "Home Hub"
AVANT (contexte asso):    Sidebar complete avec modules

APRES:                    Sidebar unique, toujours les modules de l'asso active
```

## Resultat attendu

- Navigation simplifiee en 1 seul niveau (plus de bascule hub/asso)
- Moins de code a maintenir (~300 lignes supprimees)
- Experience utilisateur plus directe : connexion -> gestion immediate
- Le header reste le point central pour changer d'association
