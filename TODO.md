# LinkedAI — TODO

## 🔴 Priorité haute

### 1. Tuto première connexion (Onboarding) ✅
- [x] Revoir le flow `OnboardingWizard` : étapes claires (style → première génération)
- [x] Ajouter une étape "Bienvenue" avec le nom de l'user et ce qu'il va pouvoir faire
- [x] Progress bar visuelle entre les étapes (3 steps : Posts / Profil / Terminé)
- [x] Étape finale : confetti / animation de succès avant de lancer le dashboard
- [x] Option "Passer le tuto" persistée en localStorage (déjà en place, à affiner)

### 2. Emails Supabase ✅
- [x] **Confirmation d'inscription** : template HTML fusionné avec le welcome dans `email-templates/welcome.html` → copier dans Supabase Auth > Confirm signup
- [x] **Mot de passe oublié** : template HTML créé dans `email-templates/reset-password.html` → à copier dans Supabase Auth
- [x] **Email de bienvenue** : fusionné avec la confirmation (lien `{{ .ConfirmationURL }}` intégré)
- [ ] Configurer un domaine d'envoi custom dans Supabase (ex: noreply@linkedai.fr) — **config Supabase dashboard > Authentication > SMTP Settings**
- [ ] Configurer une **auto-réponse** sur la boîte contact@linkedai.fr dans Hostinger (répondeur automatique)

### 3. Lien vers l'abonnement PRO dans le dashboard ✅
- [x] Ajouter un encart/banner dans le contenu principal pour les users free
- [x] Banner "Tu as utilisé X/5 générations aujourd'hui — Passe en Pro pour illimité →"
- [x] Page dédiée `/dashboard/upgrade` avec comparatif free/pro et CTA checkout
- [x] Accès `/dashboard/upgrade` visible même pour les users pro (rappel des avantages)

---

## 🟡 Priorité moyenne

### 4. Responsive mobile ✅
- [x] La sidebar dashboard n'est pas adaptée mobile (disparaît, menu hamburger à créer)
- [x] La landing page est globalement responsive mais à vérifier sur petits écrans (320px)
- [x] L'éditeur et le StyleSetup ne sont pas optimisés mobile

### 5. SEO & Meta ✅
- [x] Ajouter `metadata` dans `app/layout.tsx` (title, description, og:image)
- [x] Page `/app/sitemap.ts` pour le sitemap automatique
- [x] og:image statique (1200×630) avec le logo LinkedAI — `public/og-image.png` ✅

### 6. Pages légales ✅
- [x] `/mentions-legales`
- [x] `/confidentialite` (RGPD obligatoire si collecte de données)
- [x] `/cgv` (obligatoire pour facturation)
- [x] Lien dans le footer

### 7. Améliorations dashboard ✅
- [x] Banner "Génération X/5" pour les users free dans l'éditeur (plus visible que le compteur actuel)
- [x] Export historique en CSV ou PDF
- [x] Pagination de l'historique (actuellement limité à 50)
- [x] Recherche dans l'historique

---

## 🟢 Nice to have

### 8. Analytics ✅
- [x] Intégrer PostHog (privacy-friendly) — `components/PostHogProvider.tsx`
- [x] Events trackés : `signup`, `login`, `post_generated` (avec format/tone), `upgrade_click`
- [ ] Ajouter `NEXT_PUBLIC_POSTHOG_KEY` dans `.env.local` depuis app.posthog.com
- [ ] Event `checkout_completed` (à ajouter dans le webhook LemonSqueezy)

### 9. Notifications in-app ✅
- [x] Système de toast léger — `lib/toast.tsx` (ToastProvider + useToast hook)
- [x] Toast après copie d'un post (éditeur, historique, fullscreen)
- [x] Toast après sauvegarde dans l'historique
- [x] Toast en cas d'erreur de génération

### 10. Qualité & tests
- [ ] Ajouter tests pour `OnboardingWizard` et `AuthDrawer`
- [ ] Tests E2E (Playwright) pour le flow signup → génération
- [ ] Corriger les warnings TypeScript dans les fichiers `__tests__/` (globals vitest non déclarés dans tsconfig)

---

## 🔧 Dette technique

- [x] `supabase` et `router` dans les deps des `useEffect` — corrigé (eslint-disable sur mount-only effects, `router` ajouté dans AuthDrawer)
- [x] `<img>` restant dans `StyleSetup.tsx` → migré vers `<Image>`
- [ ] Extraire `HistoryTab`, `DashboardSidebar` en sous-composants (dashboard trop long)
- [ ] Vérifier la RLS sur `post_collection_items` dans Supabase
