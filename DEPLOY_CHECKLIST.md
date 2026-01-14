# Deploy Checklist - associacion.eu

## ✅ Pre-Deploy Verification

### SEO & Meta
- [x] Title: "associacion.eu - Centralisez votre association"
- [x] Meta description optimisée
- [x] Open Graph tags (og:title, og:description, og:image)
- [x] Twitter Card tags
- [x] Canonical URL configurée
- [x] Favicon SVG (gradient bleu/vert)
- [x] OG Image générée (1200x630)

### Performance
- [x] Preconnect fonts.googleapis.com
- [x] Viewport optimisé pour mobile
- [x] Animations CSS optimisées (GPU-accelerated transforms)
- [x] Lazy loading sur images

### Micro-interactions
- [x] Hover effects sur cartes
- [x] Button pulse animations
- [x] Touch-friendly drag (mobile)
- [x] Scale animations sur CTA

### Analytics
- [x] Hook useAnalytics créé
- [x] Events: page_view, signup, onboarding_complete, association_created
- [ ] PostHog/GA à intégrer (optionnel)

## 🚀 Deploy Steps

### 1. Custom Domain (associacion.eu)
Suivre les étapes dans Lovable:
1. Settings → Domains → Connect Domain
2. Entrer: `associacion.eu`
3. Ajouter DNS records chez registrar:
   - A Record: `@` → `185.158.133.1`
   - A Record: `www` → `185.158.133.1`
   - TXT Record: `_lovable` → (valeur fournie par Lovable)
4. Attendre propagation DNS (jusqu'à 72h)
5. SSL auto-provisionné par Lovable

### 2. Remove Lovable Badge
1. Settings → "Hide 'Lovable' Badge" → ON

### 3. Environment Variables (Supabase)
Vérifier que ces secrets sont configurés:
- `ANTHROPIC_API_KEY` (AI Assistant)
- `RESEND_API_KEY` (Emails)
- `MAPBOX_PUBLIC_TOKEN` (Carte)
- `HELLOASSO_CLIENT_ID` (optionnel)
- `HELLOASSO_CLIENT_SECRET` (optionnel)

### 4. Database Backup
Dans Supabase Dashboard:
1. Settings → Database → Backups
2. Créer backup manuel avant go-live

## 📱 Test Checklist

### Desktop (Chrome, Firefox, Safari)
- [ ] Landing page
- [ ] Login/Signup flow
- [ ] Onboarding association
- [ ] Organigramme (drag & drop)
- [ ] Chaînes de valeur
- [ ] Projets (financement)
- [ ] Contributors (carte)
- [ ] Admin Kanban
- [ ] Pricing page

### Mobile (iOS Safari, Android Chrome)
- [ ] Navigation responsive
- [ ] Touch drag organigramme
- [ ] Formulaires (keyboard handling)
- [ ] Carte Mapbox (gestures)
- [ ] Sheet/drawer components

### Flows critiques
- [ ] Inscription → Onboarding → Dashboard
- [ ] Invitation membre → Complétion profil
- [ ] Création projet de financement
- [ ] Synchronisation HelloAsso

## 📊 Post-Deploy

- [ ] Vérifier SSL actif (https://)
- [ ] Tester tous liens externes
- [ ] Vérifier emails (Resend domain)
- [ ] Configurer alertes Supabase
- [ ] Surveiller analytics premiers jours
