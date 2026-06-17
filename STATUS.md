# Règles

Règle : 7 sections maximum. Section 1 = À faire. Sections 2-7 (Archive) = Fait le YYYY-MM-DD (la plus ancienne est supprimée quand une nouvelle est ajoutée).
La demande utilisateur: "Archive" déplace toutes les tâches faites du jour dans les chapitres d'archive
Hirérachie: Projet > Tâches > étapes. Chaque tâches est analysée, puis on liste les étapes
Les tâches sont regroupé dans des projets ou le projet Divers si c'est une simple tâche

Sauvegarde : Git en local + Github https://github.com/JackReality/webPotfolioArbiter-ts

---

## À FAIRE

### PHASE 9 — Pages formation (débloqué maintenant que Stripe fonctionne)

- [ ] `/training_portfolio` — Page formation Portfolio : vérifier training="PORTFOLIO" dans le cookie, afficher titre + descriptionHtml

---

### Divers (à faire après Stripe)
- [ ] Améliorer contact : message envoyé avec un vu vert, rajouter un champ Sujet dans le subject du mail
- [ ] Commencer le forum, réfléchir aux fonctionnalités, puis créer un projet Forum avec les tâches
- [ ] Traduire toutes les pages (form contact non traduit)

---

### Divers

- [ ] **Agrandir texte des blocs accueil** — Comparer avec image `jack-import/Comparer taille et épaisseur.png` (image non trouvée, demander à l'utilisateur de la fournir dans `jack-import/`)
- [ ] **Hydratation Dark Reader** — L'erreur de console vient de l'extension Dark Reader dans le navigateur, pas du code. Ignorer en prod, ne pas traiter.

---

## Fait le 2026-06-17

### PHASE 11 — Paiement Stripe

#### Tâche 1 : Stripe Checkout + Callback
- [x] Route `POST /api/stripe/checkout` — auth, anti-doublon, crée session Checkout, retourne `url`
- [x] Route `GET /api/stripe/callback` — vérifie paiement via API Stripe, attribution formation, mise à jour rôle + session + communauté
- [x] `services/StripeService.ts` — `createCheckoutSession` avec `client_reference_id` + `metadata.training_code`
- [x] Traductions `ERR_TRAINING_NOT_FOUND`, `ERR_STRIPE_NOT_CONFIGURED`, `ERR_ALREADY_PURCHASED` (fr/en/es)
- [x] Fix `TrainingService.ts` + `StripeService.ts` — argument parasite sur `AppError`
- [x] **Testé et confirmé fonctionnel** (paiement test Stripe validé, accès formation attribué)

#### Tâche 2 : Stockage prix/devise + affichage
- [x] `user_trainings` — ajout colonnes `amount_ct INT UNSIGNED` et `currency VARCHAR(3)` + Prisma push
- [x] Doublon check via `stripeSessionId` (remplace userId+trainingCode)
- [x] Callback stocke `amount_total` et `currency` Stripe à l'insertion
- [x] `myspace/page.tsx` — tableau formations avec colonne Prix (ex: 49.00 CHF), i18n fr/en/es
- [x] `admin/users` — bouton "Achats" → dialog avec Stripe ID, montant, devise, date (76% largeur)

#### Tâche 3 : Phase 10b + Cascade DB
- [x] Phase 10b intégrée dans callback : `axs_community_expire` += `axs_community_months` à l'achat
- [x] `user_trainings.user_id` → `users.id` ON DELETE CASCADE (confirmé en DB)
- [x] `log_errors.user_id` → `users.id` ON DELETE CASCADE (ajouté + testé : 0 orphelins après suppression)
- [x] Schéma Prisma mis à jour avec relations FK + `@@index`

---

## Fait le 2026-06-16

### PHASE 10 — Accès Communauté (axs_community_expire)

- [x] **DB** — Ajout colonne `axs_community_expire DATETIME NULL` dans la table `users`
- [x] **Prisma schema** — Ajout `axsCommunityExpire DateTime?` dans le modèle `User` + client régénéré
- [x] **Auth / Login** — `SessionData` : ajout `communityAccess: boolean` · route login : calcul et stockage dans la session
- [x] **Middleware** — Protection `/community/*` via `session.communityAccess` + ajout dans le `matcher`

### PHASE 10b — Durée accès communauté par formation

- [x] **DB** — Ajout `axs_community_months INT UNSIGNED NULL` dans la table `trainings`
- [x] **Prisma schema** — Ajout `axsCommunityMonths Int?` dans le modèle `Training` + client régénéré

### PHASE 8 — Pages admin

- [x] `/admin/dashboard` — 3 cartes de navigation
- [x] `/admin/users` — tableau, menu rôle, suppression avec AlertDialog, routes API PATCH/DELETE
- [x] `/admin/trainings` — tableau, dialog ajout/modification, routes API POST/PATCH
- [x] `/admin/email-templates` — onglets par type et langue, formulaire édition, route API PATCH

---

## Fait le 2026-06-15

### Refactoring — Gestion des erreurs & types DB

- [x] Supprimer `numero` de `AppError` — `lib/AppError.ts`, tous les `throw new AppError()` dans les services
- [x] `schema.prisma` — tous les IDs BigInt → Int @db.UnsignedInt (User, Training, EmailTemplate, UserTraining.id + userId)
- [x] Corriger `ERR_FILL_ALL` → `ERR_FIELDS_REQUIRED` — `forgot-password/route.ts` (×2), `contact/route.ts`
- [x] Corriger textes hardcodés en français dans routes profil → codes ERR_*
- [x] Ajouter try/catch global aux routes sans protection
- [x] Ajouter traductions manquantes — `ERR_INVALID_LANG`, `ERR_CONTACT_TOO_FAST`, `ERR_ADMIN_PROTECTED` dans fr/en/es
- [x] DB : BIGINT → INT UNSIGNED dans MySQL via DBeaver
- [x] Créer table `log_errors` via `prisma db push` + `services/LogService.ts`
- [x] Brancher `logError()` dans les catch 500 des routes API (production uniquement)

### Corrections bugs

- [x] `middleware.ts` recréé (proxy.ts supprimé) — Next.js exige ce nom exact
- [x] `/register` : redirect vers `/login?registered=1` après validation du code
- [x] `login/page.tsx` : affiche message de succès si `registered=1`

---

## Fait le 2026-06-14

### Corrections bugs reset-password & forgot-password

- [x] `send-code/route.ts` : enveloppé dans try/catch global
- [x] `UserService.changePassword` : `MIN_PASSWORD_LENGTH` depuis `.env`
- [x] `ForgotPasswordForm.tsx` : suppression du préfixe `errors.` dans `t(data.error)`
- [x] Traductions ajoutées dans fr/en/es : `ERR_EMAIL_SEND`, `ERR_UNAUTHORIZED`, `ERR_USER_NOT_FOUND`, clés `resetPassword.*`

### Setup débogage VS Code

- [x] `.vscode/launch.json` : config "Next.js debug" attachement port 9230

---

## Notes techniques

- ORM : Prisma v5.22.0 — IDs sont INT UNSIGNED en DB et en Prisma (type `Int`)
- Cookie auth HTTP-only signé : `{ id, email, displayName, role, language, trainings[] }`
- Restriction des pages : uniquement dans `middleware.ts`, jamais dans les pages elles-mêmes
- DB : MariaDB 11.8, port 13306, user `portfolio`, base `portfolio_arbiter`
- Next.js : middleware se nomme obligatoirement `middleware.ts`, exporte `middleware` — https://nextjs.org/docs/app/routing/middleware
- Erreurs API : toujours retourner un code (`ERR_*`), jamais du texte en français — traduit côté client via `t(data.error, lang)`
- Debug VS Code : `node --inspect node_modules/next/dist/bin/next dev` puis attacher sur port 9230
