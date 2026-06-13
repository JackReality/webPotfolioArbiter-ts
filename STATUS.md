# STATUS — Réécriture Next.js / TypeScript

Réécriture du projet Blazor C# (`../webPortfolio-cs`) en Next.js 16 + TypeScript.
Avancement : chaque tâche est marquée `[ ]` (à faire) ou `[x]` (terminée).

# Règles

Règle : 7 sections maximum. Section 1 = À faire. Sections 2-7 (Archive) = Fait le YYYY-MM-DD (la plus ancienne est supprimée quand une nouvelle est ajoutée).
La demande utilisateur: "Archive" déplace toutes les tâches faites du jour dans les chapitres d'archive
Hirérachie: Projet > Tâches > étapes. Chaque tâches est analysée, puis on liste les étapes
Les tâches sont regroupé dans des projets ou le projet Divers si c'est une simple tâche

---

## À FAIRE

### PHASE 8 — Pages admin

- [ ] `/admin/dashboard` — Dashboard : 3 boutons vers users / trainings / email-templates
- [ ] `/admin/users` — Gestion utilisateurs : tableau (email, nom, rôle, langue, date), dialog changement de rôle, suppression avec confirmation, admins protégés
- [ ] `/admin/trainings` — Gestion formations : tableau + formulaire ajout/édition (titre, code, langue, descriptionHtml, pageUrl, stripeProductId, stripePriceId, confirmationEmailHtml)
- [ ] `/admin/email-templates` — Templates emails : onglets par type (confirm_signup / recovery / welcome), sous-onglets FR/EN/ES, édition sujet + corps HTML

---

### PHASE 9 — Pages formation

- [ ] `/training_portfolio` — Page formation Portfolio : vérifier training="PORTFOLIO" dans le cookie, afficher titre + descriptionHtml

---

### Divers

- [ ] **Agrandir texte des blocs accueil** — Comparer avec image `jack-import/Comparer taille et épaisseur.png` (image non trouvée, demander à l'utilisateur de la fournir dans `jack-import/`)
- [ ] **Legal — email anti-bot** — Dans `/legal`, onglet "Mentions légales", afficher l'email de contact avec un bouton "Afficher l'email" (client component) au lieu d'afficher le texte brut — protège contre les bots
- [ ] **Contact** — Vérifier que le formulaire envoie bien avec l'email du visiteur en `From` (reply-to) pour que le destinataire puisse répondre directement
- [ ] **Hydratation Dark Reader** — L'erreur de console vient de l'extension Dark Reader dans le navigateur, pas du code. Ignorer en prod, ne pas traiter.

---

## Fait le 2026-06-13

### Réorganisation arborescence (CLAUDE.md)

- [x] Déplacer pages subscriber dans `app/subscriber/` : myspace, download, stripe-success, profile (+ ProfileForms), reset-password
- [x] Simplifier `middleware.ts` → `proxy.ts` (Next.js 16) : supprimer entrées individuelles `/profile`, `/myspace` etc., tout couvert par `/subscriber/**`
- [x] Mettre à jour tous les liens internes vers les nouvelles URLs `/subscriber/*`
- [x] Corriger URL succès Stripe : `/stripe-success` → `/subscriber/stripe-success`
- [x] `next.config.ts` : `allowedDevOrigins: ["127.0.0.1"]`
- [x] `layout.tsx` : `suppressHydrationWarning` sur `<html>`

### Connexion base de données

- [x] Corriger port MariaDB : 3306 → 13306
- [x] Corriger credentials : `root:@` → `portfolio:123@portfolio_arbiter`
- [x] Régénérer client Prisma après `db pull` (schéma mis à jour : IDs BigInt)
- [x] Corriger `Number(user.id)` dans login, refresh-claims, stripe callback (bigint → number)

### Navigation et layout

- [x] Footer extrait dans `components/Footer.tsx` et ajouté dans `app/layout.tsx` (présent sur toutes les pages)
- [x] Menu : ordre Accueil / Télécharger / Formation / Contact, Télécharger toujours visible
- [x] Bouton accueil : "Découvrir la formation" → "Télécharger la feuille Google Sheet" (FR/EN/ES)
- [x] Texte blocs accueil : `text-base font-medium` → `text-lg font-semibold`

### Corrections bugs

- [x] `/legal` — Onglets non fonctionnels : extrait `LegalTabs.tsx` client component avec useState
- [x] Liens langue : `<Link>` → `<a>` dans NavLinks et LanguageSwitcher (forçe rechargement complet)
- [x] `proxy.ts` : renommage `middleware` → `proxy` (convention Next.js 16)

---

## Fait le 2026-06-12

### PHASE 1 — Infrastructure

- [x] Initialiser le projet Next.js 16 avec TypeScript (`npx create-next-app`)
- [x] Installer les dépendances : `bcrypt`, `nodemailer`, `stripe`, `iron-session`, `prisma@5.22.0`
- [x] Installer et configurer shadcn/ui
- [x] Créer `lib/prisma.ts` — client Prisma singleton (Prisma v5.22.0, remplace lib/db.ts)
- [x] Créer `lib/AppError.ts` — classe centrale d'erreurs (code + numéro)
- [x] Créer `lib/auth.ts` — lecture/écriture du cookie HTTP-only (email, nom, role, langue, trainings[])
- [x] Créer `lib/i18n.ts` — chargement des fichiers JSON FR/EN/ES (`jack-import/*.json`)
- [x] Créer `proxy.ts` — vérification rôle et trainings[] par route
- [x] Créer `.env` — variables DB_*, SMTP_*, STRIPE_SECRET_KEY, CONTACT_EMAIL, MAIL_FROM

### PHASE 2 — Types TypeScript

- [x] `types/User.ts` — re-exporte `User` depuis `@prisma/client`
- [x] `types/Training.ts` — re-exporte `Training` depuis `@prisma/client`
- [x] `types/UserTraining.ts` — re-exporte `UserTraining` depuis `@prisma/client`
- [x] `types/EmailTemplate.ts` — re-exporte `EmailTemplate` depuis `@prisma/client`
- [x] `prisma/schema.prisma` — modèles User, Training, UserTraining, EmailTemplate avec `@map`/`@@map`

### PHASE 3 — Services

- [x] `services/UserService.ts`
- [x] `services/TrainingService.ts`
- [x] `services/UserTrainingService.ts`
- [x] `services/EmailTemplateService.ts`
- [x] `services/EmailService.ts`
- [x] `services/CodeService.ts`
- [x] `services/StripeService.ts`

### PHASE 4 — API Routes

- [x] `app/api/auth/login/route.ts`
- [x] `app/api/auth/logout/route.ts`
- [x] `app/api/auth/refresh-claims/route.ts`
- [x] `app/api/language/set/route.ts`
- [x] `app/api/stripe/callback/route.ts`

### PHASE 5 — Pages publiques

- [x] `/` — Home : 6 sections
- [x] `/login` — Connexion
- [x] `/register` — Inscription en 2 étapes
- [x] `/forgot-password` — Mot de passe oublié en 2 étapes
- [x] `/catalog` — Catalogue formations
- [x] `/contact` — Formulaire de contact
- [x] `/legal` — Mentions légales (3 onglets)
- [x] `/access-denied`, `/stripe-error`, `/not-found`

### PHASE 6 — Pages subscriber

- [x] `/subscriber/myspace` — Mon espace
- [x] `/subscriber/download` — Télécharger ressources
- [x] `/subscriber/stripe-success` — Confirmation achat

### PHASE 7 — Pages profil

- [x] `/subscriber/profile` — Profil utilisateur
- [x] `/subscriber/reset-password` — Changer mot de passe

---

## Notes techniques

- ORM : Prisma v5.22.0 — IDs sont BigInt en DB, convertir avec `Number()` avant session
- Cookie auth HTTP-only signé : `{ id, email, displayName, role, language, trainings[] }`
- Restriction des pages : uniquement dans `proxy.ts`, jamais dans les pages elles-mêmes
- DB : MariaDB 11.8, port 13306, user `portfolio`, base `portfolio_arbiter`
- Next.js 16 : `middleware.ts` → `proxy.ts`, fonction `proxy` (pas `middleware`)
