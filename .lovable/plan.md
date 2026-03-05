

## Plan: Enrichir la Boîte à Outils avec un catalogue d'intégrations complémentaires

### Contexte

La page `/toolbox` actuelle contient 4 outils (HelloAsso, JeVeuxAider, Solidatech, Canva Pro). L'objectif est de la transformer en un véritable hub d'intégrations avec deux niveaux :

1. **Outils connectables via webhook** (Slack, Discord, Notion, Google Workspace, etc.) : l'admin colle une URL webhook pour recevoir des notifications depuis Associacion
2. **Outils recommandés** (liens externes avec guides) : outils complémentaires utiles aux associations

### Approche technique

Puisque Associacion est un front-end React sans backend Node.js natif, les intégrations "MCP" réelles (OAuth, tokens) nécessiteraient des Edge Functions Supabase pour chaque service. C'est un chantier conséquent.

L'approche pragmatique en V1 :
- **Webhooks sortants** : stocker une URL webhook (Slack, Discord, Zapier, n8n) par association dans Supabase, et l'appeler depuis le front ou une Edge Function quand un événement se produit (nouveau membre, nouveau projet, etc.)
- **Catalogue enrichi** : ajouter visuellement tous les outils avec statut "Connecté" / "Configurer" / "Lien externe"

### Modifications prévues

#### 1. Table Supabase `association_webhooks`
Nouvelle table pour stocker les webhooks configurés par association :
- `id`, `association_id`, `service` (slack, discord, notion, zapier, n8n), `webhook_url`, `is_active`, `events` (array des événements à notifier), `created_at`

#### 2. Refonte de `src/pages/Toolbox.tsx`
Restructurer la page en 4 catégories :

- **Communication** : Slack, Discord, Microsoft Teams
- **Productivité** : Notion, Google Workspace (Drive, Docs, Sheets), Trello
- **Financement** : HelloAsso (existant), Stripe, PayPal
- **Bénévolat & Ressources** : JeVeuxAider (existant), Solidatech (existant)
- **Graphisme** : Canva Pro (existant), Figma
- **Automatisation** : Zapier, n8n, Make

Chaque carte d'intégration aura :
- Logo coloré + nom + description
- Badge "Recommandé" ou "Nouveau"
- Statut : "Lien externe" (ouvre le site) ou "Webhook" (ouvre un dialog de configuration)
- Note explicative sur la synergie avec Associacion

#### 3. Dialog de configuration webhook
Un composant `WebhookConfigDialog` permettant à l'admin de :
- Coller l'URL du webhook (Slack Incoming Webhook, Discord Webhook, etc.)
- Choisir les événements à notifier (nouveau membre, nouveau projet, nouvelle tâche, etc.)
- Tester la connexion (envoie un message de test)
- Activer/désactiver

#### 4. Hook `useWebhooks`
- CRUD sur la table `association_webhooks`
- Fonction `triggerWebhook(service, event, payload)` pour envoyer des notifications

#### 5. Bannière de réassurance
Mise à jour du message pour insister sur la complémentarité : "Associacion ne remplace pas vos outils. Il les connecte."

### Catalogue complet des intégrations V1

| Outil | Type | Action |
|-------|------|--------|
| Slack | Webhook | Dialog config → notifications |
| Discord | Webhook | Dialog config → notifications |
| Microsoft Teams | Lien externe | Guide de setup |
| Notion | Lien externe | Guide d'usage complémentaire |
| Google Workspace | Lien externe | Guide de setup |
| Trello | Lien externe | Guide d'usage complémentaire |
| HelloAsso | Existant | Connecter compte |
| Zapier | Webhook | Dialog config → automatisation |
| n8n | Webhook | Dialog config → automatisation |
| Make | Lien externe | Guide de setup |
| Canva Pro | Existant | Demander accès |
| JeVeuxAider | Existant | Publier mission |
| Solidatech | Existant | Voir offres |

### Fichiers impactés

- **Nouveau** : `src/components/toolbox/WebhookConfigDialog.tsx`
- **Nouveau** : `src/hooks/useWebhooks.ts`
- **Modifié** : `src/pages/Toolbox.tsx` (refonte complète du catalogue)
- **Migration SQL** : table `association_webhooks` + RLS policies
- **Aucune modification** aux pages existantes, routes ou navigation

