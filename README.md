# LinkedAI — Générateur de posts LinkedIn dans ta vraie voix

Stack : Next.js 14 · Supabase · Groq (LLaMA 3.3) · LemonSqueezy · Vercel

---

## 🚀 Setup en 15 minutes

### 1. Cloner et installer

```bash
git clone <ton-repo>
cd linkedai
npm install
cp .env.local.example .env.local
```

### 2. Supabase

1. Crée un projet sur [app.supabase.com](https://app.supabase.com)
2. Va dans **SQL Editor** et exécute le contenu de `supabase-schema.sql`
3. Va dans **Settings > API** et copie :
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY` (utilisée côté serveur pour les webhooks)
4. Active le magic link : **Authentication > Providers > Email** → active "Magic Link"
5. Configure le redirect URL : **Authentication > URL Configuration** → ajoute `http://localhost:3000/**`

### 3. Groq

1. Crée un compte sur [console.groq.com](https://console.groq.com) (gratuit, pas de CB)
2. **API Keys > Create API Key**
3. Copie la clé → `GROQ_API_KEY`

### 4. LemonSqueezy (paiements)

1. Crée un compte sur [lemonsqueezy.com](https://lemonsqueezy.com)
2. Crée un produit "LinkedAI Pro — 9€/mois" en abonnement
3. Récupère :
   - `Store ID` → `LEMONSQUEEZY_STORE_ID`
   - `API Key` → `LEMONSQUEEZY_API_KEY`
   - `Variant ID` du plan Pro → `LEMONSQUEEZY_VARIANT_ID`
4. Configure le webhook : **Settings > Webhooks** → URL `/api/webhooks/lemonsqueezy`, events `subscription_created` + `subscription_updated`
5. Copie le **Signing Secret** → `LEMONSQUEEZY_WEBHOOK_SECRET`

### 5. Variables d'environnement complètes

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Groq
GROQ_API_KEY=

# LemonSqueezy
LEMONSQUEEZY_API_KEY=
LEMONSQUEEZY_STORE_ID=
LEMONSQUEEZY_VARIANT_ID=
LEMONSQUEEZY_WEBHOOK_SECRET=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. Lancer en local

```bash
npm run dev
# → http://localhost:3000
```

### 7. Déployer sur Vercel

```bash
npm install -g vercel
vercel
```

Ajoute toutes les variables d'env dans le dashboard Vercel, puis ajoute l'URL de production dans Supabase **Authentication > URL Configuration**.

---

## 📁 Structure du projet

```
linkedai/
├── app/
│   ├── page.tsx                        # Landing page avec démo live + vidéo background
│   ├── template.tsx                    # Animations de transition entre pages
│   ├── layout.tsx                      # Layout root (fonts, metadata)
│   ├── globals.css                     # Design system : variables, animations, classes utilitaires
│   ├── dashboard/page.tsx              # App principale (éditeur, style, historique)
│   └── api/
│       ├── generate/route.ts           # Endpoint génération Groq
│       ├── checkout/route.ts           # Création session paiement LemonSqueezy
│       └── webhooks/lemonsqueezy/      # Webhook paiement → activation plan Pro
├── components/
│   ├── Editor.tsx                      # Éditeur de post (idée + ton + génération)
│   ├── StyleSetup.tsx                  # Configuration du style personnel
│   ├── FlipCard.tsx                    # Cartes fonctionnalités (modal au clic)
│   ├── AuthDrawer.tsx                  # Drawer login / signup
│   ├── OnboardingWizard.tsx            # Wizard premier lancement
│   ├── TransitionLink.tsx              # Lien avec animation de transition de page
│   └── UpgradeModal.tsx                # Modal de passage en Pro
├── lib/
│   ├── supabase-client.ts              # Client navigateur
│   ├── supabase-server.ts              # Client serveur (Server Components)
│   └── supabase-admin.ts              # Client admin (service role, webhooks)
├── public/
│   ├── logo.png                        # Logo LinkedAI (fond transparent)
│   └── videos/background.mp4          # Vidéo hero background (loop)
├── middleware.ts                       # Protection routes authentifiées
├── supabase-schema.sql                 # Schéma complet BDD
└── vercel.json                         # Config déploiement
```

---

## 🎨 Design system

- **Fonts** : Syne (UI) + Instrument Serif (accents italiques)
- **Couleurs** : `#080808` background · `#EAB308` jaune accent
- **Animations** : scroll reveal (IntersectionObserver), page transitions, count-up stats
- **Vidéo hero** : `public/videos/background.mp4` en loop, opacité réduite + overlay dégradé + glass blur en bas

---

## 💳 Plan gratuit vs Pro

| Fonctionnalité | Gratuit | Pro (9€/mois) |
|---|---|---|
| Générations/jour | 3 | Illimitées |
| Historique | ✓ | ✓ |
| Style personnalisé | ✓ | ✓ |
| Formats de posts | 4 | 4 |

Le plan Pro est géré via LemonSqueezy. À la réception du webhook `subscription_created`, la table `user_plans` est mise à jour avec `plan = 'pro'`.

---

## ⚡ Limites à garder en tête

- **Groq free tier** : ~500K tokens/jour. Les users gratuits sont limités à 3 générations/jour (table `generation_logs`)
- **Supabase free** : Pause après 7j d'inactivité → pinge `/api/ping` régulièrement via [cron-job.org](https://cron-job.org)
- **Vercel Hobby** : Pas de cron natif → utilise [cron-job.org](https://cron-job.org) (gratuit)
- **Vidéo background** : 59 MB — si les perfs Vercel posent problème, héberge sur un CDN (Cloudflare R2, S3) et référence par URL

---

## 🎯 Prochaines features

- [ ] Planification de publication
- [ ] Analyse de performance des posts
- [ ] Export vers Buffer / Hootsuite
- [ ] Import depuis export LinkedIn (CSV)
- [ ] Connexion LinkedIn OAuth
