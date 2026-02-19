

# Diagnostic critique : Annuaire B2B

## Problemes identifies

### 1. Le nom "B2B" est incomprehensible

Les associations ne sont pas des entreprises. "B2B" (Business to Business) est du jargon startup qui n'a aucun sens pour un president d'association de 55 ans en Savoie. Le terme apparait 15+ fois dans les fichiers de traduction FR et IT.

**Action** : Renommer partout en "Annuaire Associations" / "Annuario Associazioni".

### 2. Deux sidebars = usine a gaz

Sur desktop, l'utilisateur voit :
- La **sidebar principale** de l'app (HubSidebar, ~250px)
- La **sidebar filtres** de l'annuaire (DirectoryFilters, 320px dans un `aside`)

Sur un ecran 1366px, il reste ~800px pour le contenu. C'est etouffant et ca donne une impression de complexite.

**Action** : Supprimer la sidebar filtres. Mettre la recherche et les filtres silos en ligne au-dessus de la carte.

### 3. Toggle Carte/Grille : deux vues pour rien (encore)

Meme probleme que les chaines de valeur : un toggle entre carte Mapbox et grille de cartes. La carte EST la valeur differenciante de l'annuaire (visualiser les associations alpines par geographie). La grille de cartes est une liste LinkedIn-like generique qui n'apporte rien de plus.

**Action** : Supprimer le mode grille. Garder uniquement la carte.

### 4. "Ignorer les frontieres" contredit la mission

Le switch "Ignorer les frontieres" est l'inverse exact de ce que le projet veut faire. La mission est de **forcer les interactions transfrontalieres**. Par defaut, les zones sont filtrees par pays -- donc l'utilisateur voit SOIT la France SOIT l'Italie. Il faut activer manuellement un toggle pour voir les deux.

C'est l'inverse de ce qu'il faut : par defaut, **tout doit etre visible**. Les frontieres doivent etre ignorees par conception, pas par option.

**Action** : Supprimer le toggle "Ignorer les frontieres". Supprimer les checkboxes de zones. Par defaut, toutes les associations de toutes les zones sont affichees. Le filtre se fait uniquement par recherche textuelle et par silo (domaine d'activite).

### 5. Les messages vont dans le vide

Le formulaire de contact envoie des messages dans la table `directory_contacts`. Mais il n'existe **aucune interface pour lire ces messages**. Pas d'inbox, pas de notification, rien. L'utilisateur envoie un message et pense que ca fonctionne, mais personne ne le verra jamais.

**Action pour maintenant** : Remplacer le formulaire de messagerie par un simple lien vers le profil public de l'association (qui affiche deja email, LinkedIn, Instagram, site web). C'est plus honnete et plus direct. Le systeme de messagerie interne pourra etre ajoute plus tard quand une vraie inbox sera construite.

### 6. La modale de contact duplique le profil

Quand on clique sur un marqueur de la carte, une modale (`AssociationModal`) s'ouvre avec : nom, description, badges zones, liens sociaux, formulaire de contact. C'est exactement le meme contenu que la page profil (`/annuaire/:id`). Deux chemins pour la meme info.

**Action** : Supprimer `AssociationModal`. Quand on clique un marqueur, on navigue directement vers `/annuaire/:id`.

### 7. `cover_image_url` n'est pas requete

Le hook `useDirectory` selectionne : `id, name, description, logo_url, primary_zone, secondary_zone, silo, city, latitude, longitude, linkedin_url, instagram_url, created_at`. Le champ `cover_image_url` n'est PAS dans le SELECT. Mais `AssociationCard` essaie de l'afficher. Il sera toujours `undefined`. C'est du code mort visuel.

**Action** : Comme on supprime la vue grille (et donc AssociationCard), ce probleme disparait naturellement.

### 8. Rien ne force l'interaction transfrontaliere

L'annuaire est **passif** : on browse, on filtre, eventuellement on regarde un profil. Il n'y a aucun mecanisme pour pousser les associations a se connecter entre elles. Pas de suggestions, pas de mise en relation, pas de "cette association en Piemont a les memes activites que vous en Savoie".

**Action** : Ajouter une banniere simple "Associations proches de vous" sous la carte, qui montre 3-4 associations d'un **pays different** mais du **meme silo** que l'association de l'utilisateur connecte. C'est un "nudge" vers la cooperation transfrontaliere, sans complexite.

---

## Solution : carte plein ecran + filtres inline + suggestions transfrontalieres

### Nouvelle architecture de la page

```text
+------------------------------------------------------------+
| Annuaire Associations                                       |
| Trouvez des associations partenaires dans les Alpes          |
+------------------------------------------------------------+
| [Recherche...]  [Sport] [Culture] [Terroir] [Autre] [Tous] |
|                                            12 associations  |
+------------------------------------------------------------+
|                                                              |
|            CARTE MAPBOX PLEIN ECRAN                          |
|     (marqueurs colores par silo, popups au clic,             |
|      clic sur popup -> /annuaire/:id)                        |
|                                                              |
+------------------------------------------------------------+
| Associations suggerees pour vous          (si connecte)      |
| [Card 1 - Piemont]  [Card 2 - Savoie]  [Card 3 - Aoste]   |
+------------------------------------------------------------+
```

### Ce qu'on supprime

| Fichier / Element | Raison |
|---|---|
| `DirectoryFilters.tsx` | Remplace par filtres inline (recherche + badges silo) directement dans la page |
| `AssociationModal.tsx` | Duplique le profil, remplace par navigation vers `/annuaire/:id` |
| `AssociationCard.tsx` | Plus de vue grille, les cartes ne servent que pour les suggestions (composant simplifie inline) |
| Toggle Carte/Grille | Une seule vue : la carte |
| Toggle "Ignorer les frontieres" | Supprime -- toutes les associations visibles par defaut |
| Checkboxes de zones | Supprime -- pas de filtrage par frontiere |
| Formulaire de contact (dans AssociationModal + AssociationProfile) | Remplace par liens directs (email, LinkedIn, site web) tant qu'il n'y a pas d'inbox |

### Ce qu'on garde

- `DirectoryMap.tsx` : le composant carte Mapbox (intact, juste on le rend pleine largeur)
- `AssociationProfile.tsx` : la page profil `/annuaire/:id` (on retire juste le formulaire de contact, remplace par liens directs)
- `useDirectory.ts` : le hook de requete (on simplifie en supprimant le parametre `ignoreBorders` et `zones`)
- `types/directory.ts` : les types et constantes (on garde `SILO_INFO`, on garde `GEOGRAPHIC_ZONES` pour les couleurs de badges sur le profil)

### Ce qu'on ajoute

**Suggestions transfrontalieres** : un bloc en bas de page qui, pour un utilisateur connecte, affiche 3-4 associations :
- Du **meme silo** que son association
- D'un **pays different** (si l'utilisateur est FR, on montre des IT et vice-versa)
- Presentees comme des cartes compactes (logo + nom + ville + silo badge)
- Avec un lien "Voir le profil"

C'est la fonctionnalite qui repond directement a l'objectif "forcer les interactions entre Piemont et Savoie".

## Fichiers concernes

| Fichier | Action |
|---|---|
| `src/pages/DirectoryHub.tsx` | Refonte : filtres inline, carte pleine largeur, suggestions transfrontalieres en bas |
| `src/components/directory/DirectoryFilters.tsx` | Supprimer (remplace par filtres inline dans la page) |
| `src/components/directory/AssociationModal.tsx` | Supprimer (navigation directe vers profil) |
| `src/components/directory/AssociationCard.tsx` | Supprimer (plus de vue grille) |
| `src/components/directory/DirectoryMap.tsx` | Simplifier : popups avec bouton "Voir le profil" au lieu de `onMarkerClick` callback |
| `src/hooks/useDirectory.ts` | Simplifier : supprimer `ignoreBorders` et `zones`, garder `silo` et `searchQuery` |
| `src/types/directory.ts` | Inchange |
| `src/pages/AssociationProfile.tsx` | Retirer le formulaire de contact, afficher les liens directs (email, site, reseaux) a la place |
| `src/i18n/locales/fr.ts` | Renommer "Annuaire B2B" en "Annuaire Associations" partout |
| `src/i18n/locales/it.ts` | Renommer "Annuario B2B" en "Annuario Associazioni" partout |
| `src/components/hub/HubSidebar.tsx` | Mettre a jour le label de la sidebar |

