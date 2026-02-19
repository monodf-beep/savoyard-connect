

# Automatisation complete : Visio -> Drive -> Projets

## Comment ca marche

1. Vous faites une visio Google Meet avec Gemini
2. Gemini genere une transcription et la sauvegarde automatiquement dans un dossier Google Drive
3. Un petit script Google (a copier-coller une seule fois dans le dossier Drive) detecte le nouveau fichier et envoie son contenu a votre application
4. L'application analyse la transcription avec l'IA, extrait les actions et cree automatiquement les projets en attente d'approbation
5. L'admin voit les nouveaux projets apparaitre dans le Kanban avec le badge "En attente"

## Ce que vous devez configurer (une seule fois)

1. Ouvrir Google Drive > le dossier ou Gemini sauvegarde les transcriptions
2. Ouvrir Extensions > Apps Script
3. Coller le script fourni par l'app (disponible dans une section "Configuration" sur la page Projets)
4. Cliquer "Deployer" et autoriser

C'est tout. Apres ca, chaque nouvelle transcription sera automatiquement traitee.

---

## Ce qui sera construit

### 1. Edge function `process-transcript` (webhook public)

- Endpoint public (pas de JWT) mais protege par un **token secret** dans les headers
- Recoit le texte brut de la transcription
- Charge les sections et personnes existantes depuis la base
- Envoie a Gemini (Lovable AI) avec tool calling pour extraire les actions
- Cree directement les projets en base avec `approval_status = 'pending'`
- Retourne un resume des projets crees

### 2. Edge function `get-transcript-config`

- Endpoint protege par JWT (admin seulement)
- Retourne le script Google Apps Script pre-rempli avec l'URL du webhook et le token secret
- L'admin n'a qu'a copier-coller

### 3. Secret `TRANSCRIPT_WEBHOOK_SECRET`

- Un token genere aleatoirement pour securiser le webhook
- Stocke comme secret Supabase

### 4. Section "Configuration automatique" sur la page Projets

- Visible uniquement pour les admins
- Un bouton "Configurer l'import automatique"
- Affiche un dialog avec :
  - Le script Google Apps Script a copier-coller
  - Les instructions pas a pas (avec captures d'ecran textuelles)
  - Un bouton "Tester la connexion"

### 5. Import manuel (fallback)

- Bouton "Importer une visio" toujours present pour coller manuellement une transcription si besoin
- Meme pipeline d'analyse IA, mais avec apercu avant creation

---

## Fichiers a creer/modifier

| Fichier | Action |
|---------|--------|
| `supabase/functions/process-transcript/index.ts` | Creer : webhook + analyse IA + creation projets |
| `supabase/config.toml` | Ajouter process-transcript avec verify_jwt = false |
| `src/components/projects/TranscriptImporter.tsx` | Creer : dialog import manuel + config automatique |
| `src/pages/Projects.tsx` | Ajouter les boutons d'import et de configuration |

---

## Details techniques

### Webhook `process-transcript`

Recoit un POST avec :
```json
{
  "transcript": "texte complet de la transcription...",
  "filename": "Reunion_2026-02-19.txt",
  "secret": "le-token-secret"
}
```

Traitement :
1. Verifie le secret contre `TRANSCRIPT_WEBHOOK_SECRET`
2. Charge sections et people depuis Supabase (via service role)
3. Appelle Gemini avec tool calling `extract_action_items`
4. Pour chaque action : matche personne et section, insere un projet `pending`
5. Retourne `{ success: true, projects_created: 5 }`

### Script Google Apps Script (fourni a l'admin)

```text
function onFileCreated(e) {
  var file = DriveApp.getFileById(e.source.getId());
  var text = file.getBlob().getDataAsString();
  UrlFetchApp.fetch("WEBHOOK_URL", {
    method: "post",
    contentType: "application/json",
    payload: JSON.stringify({
      transcript: text,
      filename: file.getName(),
      secret: "TOKEN_SECRET"
    })
  });
}
```

Ce script est genere dynamiquement par l'app avec l'URL et le token deja remplis.

### Prompt Gemini (tool calling)

Contexte fourni : liste des sections avec ID + liste des personnes avec ID.
Outil `extract_action_items` avec schema :
```text
actions: [{
  title: string,
  description: string,
  responsible_person_id: string | null,
  responsible_name: string,
  section_id: string | null,
  section_name: string
}]
```

### Securite

- Le webhook est protege par un token secret (pas de JWT car appele depuis Google)
- Le token est stocke comme secret Supabase et integre dans le script Apps Script
- Les projets crees sont toujours en `pending` -- l'admin doit les approuver
- L'import manuel reste protege par JWT + role admin

