# Migration Supabase externe → Lovable Cloud

**Important** : Lovable Cloud ne peut pas être activé sur ce projet tant qu'il est connecté au Supabase externe `perfpsiibarwgvjtrlxr`. La "bascule" se fait donc en repartant d'un nouveau projet Lovable. Aucune migration "in-place" n'est possible.

Ce plan documente la procédure complète. Une grande partie est **manuelle** (côté Supabase Dashboard et console Lovable), Lovable ne peut pas tout automatiser.

---

## Étape 1 — Sauvegarde du Supabase actuel (obligatoire avant tout)

Depuis le Dashboard Supabase actuel :

1. **Backup base** : Settings → Database → Backups → "Create backup".
2. **Dump SQL complet** (depuis votre machine, pas le sandbox) :
   ```bash
   pg_dump "postgresql://postgres:[PASSWORD]@db.perfpsiibarwgvjtrlxr.supabase.co:5432/postgres" \
     --schema=public --no-owner --no-acl > schema_data.sql
   ```
3. **Export des utilisateurs auth** : Authentication → Users → Export CSV (ou `pg_dump` du schéma `auth` — attention, les hashs de mots de passe ne sont pas tous portables).
4. **Export des fichiers Storage** des 4 buckets : `organization-logos`, `financial-documents`, `association-logos`, `association-documents` (script via API Supabase ou `rclone`).
5. **Liste des secrets** à recopier : ANTHROPIC_API_KEY, OPENAI_API_KEY, RESEND_API_KEY, MAPBOX_PUBLIC_TOKEN, HELLOASSO_CLIENT_ID, HELLOASSO_CLIENT_SECRET, FIRECRAWL_API_KEY, TRANSCRIPT_WEBHOOK_SECRET.

## Étape 2 — Création du nouveau projet Lovable Cloud

1. Sur le dashboard Lovable, faites un **Remix** de ce projet (ou créez un nouveau projet vide).
2. Sur le projet remixé, **supprimez la connexion Supabase externe** depuis Project Settings → Supabase.
3. **Activez Lovable Cloud** depuis Cloud → Enable. Une nouvelle base Postgres managée est provisionnée.

## Étape 3 — Recréation du schéma sur Lovable Cloud

Deux approches selon votre confort :

- **A (recommandée pour vous)** : nous rejouons toutes les migrations via l'outil de migration Lovable, table par table, à partir des fichiers existants dans `supabase/migrations/`. C'est traçable et sûr.
- **B (rapide mais risquée)** : import direct du `schema_data.sql` via le SQL Editor de Lovable Cloud. Risque : conflits sur extensions, schémas système, owners.

## Étape 4 — Import des données

- Import du contenu (people, sections, projects, associations, etc.) via `COPY ... FROM` ou via le SQL Editor.
- **Auth users** : import via `INSERT` dans `auth.users` + envoi d'un email de réinitialisation de mot de passe à tous (les hashs externes ne sont pas garantis compatibles).
- **Storage** : recréation des 4 buckets (avec mêmes policies public/privé) puis ré-upload de tous les fichiers.

## Étape 5 — Reconfiguration

- **Secrets** : ré-ajout des 8 secrets listés via l'outil Lovable Cloud.
- **Edge functions** : redéployées automatiquement par Lovable depuis le code du repo (aucune action).
- **Auth providers** : reconfigurer Google OAuth, redirect URLs, templates email.
- **Intégrations externes** : mettre à jour les URLs de webhook (n8n, HelloAsso, transcript-webhook) côté outils tiers car l'URL projet change.

## Étape 6 — Domaine et go-live

- Republier le nouveau projet.
- Re-pointer `associacion.eu` et le sous-domaine `organigramme-enstitut.lovable.app` sur le nouveau projet (Settings → Domains).
- Geler les écritures sur l'ancien Supabase pendant la fenêtre de bascule pour éviter les pertes.

---

## Détails techniques

- Lovable Cloud = Supabase managé par Lovable. Toutes les fonctionnalités utilisées (RLS, triggers, fonctions `SECURITY DEFINER`, RPC publiques pour l'organigramme public) sont compatibles.
- Le code applicatif (`src/integrations/supabase/client.ts`, hooks, edge functions) **n'a pas besoin d'être modifié** : le client est régénéré automatiquement avec la nouvelle URL et anon key.
- Les fichiers `.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`) sont auto-régénérés par Lovable Cloud.
- `src/integrations/supabase/types.ts` sera régénéré automatiquement après les premières migrations.

## Risques et points d'attention

1. **Mots de passe utilisateurs** : potentiellement perdus → forcer un reset email global.
2. **Downtime** : prévoir une fenêtre de maintenance (idéalement 1-2h, pendant laquelle l'app est en lecture seule ou hors-ligne).
3. **Webhooks tiers** (HelloAsso, n8n) : tout casser jusqu'à reconfiguration des nouvelles URLs.
4. **Coût** : Lovable Cloud est en pricing usage-based, séparé des crédits Lovable. À surveiller selon le volume.
5. **Pas de retour arrière facile** : une fois le DNS basculé, revenir = re-migration inverse.

## Question avant de lancer

Avant que je crée le nouveau projet et démarre, confirmez-moi :
- Vous avez fait un **backup** de l'instance Supabase actuelle ?
- Vous acceptez que les utilisateurs **réinitialisent leur mot de passe** ?
- Vous avez identifié une **fenêtre de maintenance** acceptable ?

Une fois confirmé, je peux commencer par l'étape 2 (préparer le remix) et l'étape 3 (rejouer le schéma migration par migration).
