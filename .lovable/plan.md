

## Améliorations identifiees pour la Boite a Outils

Apres analyse du code et de l'interface, voici les axes d'amelioration concrets :

### 1. Recherche et filtrage
Actuellement, les 16 integrations sont affichees en liste sans possibilite de filtrer. Ajouter :
- Une barre de recherche en haut pour trouver un outil par nom
- Des filtres par type (Webhook / Externe / Existant) et par statut (Connecte / Non connecte)

### 2. Compteur de connexions actives
Ajouter un bandeau KPI en haut montrant : nombre de webhooks actifs, nombre d'outils configures, dernier webhook declenche.

### 3. Guides interactifs integres
Les outils "external" renvoient vers un lien externe sans explication. Ajouter un panneau lateral (Sheet) avec un guide pas-a-pas pour chaque outil : comment creer un webhook Slack, comment connecter Notion, etc. Cela evite de perdre l'utilisateur.

### 4. Historique des webhooks
Actuellement, aucun log n'est visible. Ajouter une section "Historique" montrant les derniers webhooks declenches (date, evenement, service, statut HTTP). Necessite une table `webhook_logs` en base.

### 5. Validation d'URL webhook
Le champ URL n'a aucune validation. Ajouter une verification de format selon le service :
- Slack : doit commencer par `https://hooks.slack.com/`
- Discord : doit commencer par `https://discord.com/api/webhooks/`
- Zapier : doit commencer par `https://hooks.zapier.com/`

### 6. Notifications reelles (trigger automatique)
Le hook `useWebhooks` stocke les configs mais aucun webhook n'est reellement declenche quand un evenement se produit (nouveau membre, nouveau projet, etc.). Creer une Edge Function `trigger-webhook` appelee apres chaque action cle pour envoyer le payload aux URLs configurees.

### 7. Accessibilite admin uniquement
La configuration des webhooks devrait etre restreinte aux admins de l'association. Les membres voient le catalogue mais pas le bouton "Configurer". Ajouter une verification du role dans le composant.

### 8. UX mobile
Les cartes sont fonctionnelles sur mobile mais le dialog webhook est un peu etroit. Convertir en Drawer sur mobile pour une meilleure experience tactile.

---

### Plan d'implementation (par priorite)

| Priorite | Amelioration | Fichiers impactes |
|----------|-------------|-------------------|
| Haute | Barre de recherche + filtres | `Toolbox.tsx` |
| Haute | Validation URL webhook | `WebhookConfigDialog.tsx` |
| Haute | Trigger automatique des webhooks | Nouvelle Edge Function + hooks existants |
| Moyenne | Guides integres (Sheet) | Nouveau composant `ToolGuideSheet.tsx` + `Toolbox.tsx` |
| Moyenne | Compteur KPI connexions actives | `Toolbox.tsx` |
| Moyenne | Restriction admin pour config | `IntegrationCard` + `useAuth` |
| Basse | Historique webhook logs | Nouvelle table + composant |
| Basse | Drawer mobile | `WebhookConfigDialog.tsx` |

Souhaitez-vous que j'implemente toutes ces ameliorations ou un sous-ensemble ?

