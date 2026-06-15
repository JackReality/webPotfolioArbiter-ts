# Règles

Règle : 7 sections maximum. Section 1 = À faire. Sections 2-7 (Archive) = Fait le YYYY-MM-DD (la plus ancienne est supprimée quand une nouvelle est ajoutée).
La demande utilisateur: "Archive" déplace toutes les tâches faites du jour dans les chapitres d'archive
Hirérachie: Projet > Tâches > étapes. Chaque tâches est analysée, puis on liste les étapes
Les tâches sont regroupé dans des projets ou le projet Divers si c'est une simple tâche

Sauvegarde : Git en local + Github https://github.com/JackReality/webPotfolioArbiter-ts

---

## À FAIRE

### Session courante
- [ ] VAlider la règle dans la DB que si suppression d'un user, delete toutes les tables liées. ou noter cette information
- [ ] pmt Stripe
- [ ] Créer la page home de la formation portfolio
- [ ] Améliorer contact, message envoyé avec un vu vert. RAjouter un champ Sujet, qui est mis dans le subject du mail
- [ ] Terminer toute la logique du site, faire les tâches notées ci-dessous et valider
- [ ] Commencer le forum, réfléchir au fonctionnalité, puis créer un projet Forum avec les tâches

---

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
- [ ] **Hydratation Dark Reader** — L'erreur de console vient de l'extension Dark Reader dans le navigateur, pas du code. Ignorer en prod, ne pas traiter.
- [ ] Traduire toutes les pages (J'ai testé form contact et pas traduit)

---

## Fait le 2026-06-15

### Refactoring — Gestion des erreurs & types DB

- [x] Supprimer `numero` de `AppError` — `lib/AppError.ts`, tous les `throw new AppError()` dans les services
- [x] `schema.prisma` — tous les IDs BigInt → Int @db.UnsignedInt (User, Training, EmailTemplate, UserTraining.id + userId)
- [x] Corriger `ERR_FILL_ALL` → `ERR_FIELDS_REQUIRED` — `forgot-password/route.ts` (×2), `contact/route.ts`
- [x] Corriger textes hardcodés en français dans routes profil → codes ERR_*
- [x] Ajouter try/catch global aux routes sans protection — login, refresh-claims, update-name, request-email-change, set-language, confirm-email-change, reset-password
- [x] Ajouter traductions manquantes — `ERR_INVALID_LANG`, `ERR_CONTACT_TOO_FAST`, `ERR_ADMIN_PROTECTED` dans fr/en/es
- [x] DB : BIGINT → INT UNSIGNED dans MySQL via DBeaver (users, trainings, email_templates, user_trainings)
- [x] Créer table `log_errors` via `prisma db push` + `services/LogService.ts`
- [x] Brancher `logError()` dans les catch 500 des routes API (production uniquement)
- [x] Tester flux complet : `/register`, changement de mot de passe, mot de passe oublié

### Corrections bugs

- [x] `middleware.ts` recréé (proxy.ts supprimé) — Next.js exige ce nom exact
- [x] `/register` : après validation du code → redirect vers `/login?registered=1` au lieu d'afficher un écran de succès incohérent
- [x] `login/page.tsx` : affiche message de succès si `registered=1` + corrigé `errors.ERR_SYSTEM` → `ERR_SYSTEM`

### Simplification CLAUDE.md

- [x] Supprimé : Référence, Démarrage, Sauvegarde, dossiers standards
- [x] Fusionné : Traductions + Multilingue en une seule section
- [x] Sauvegarde déplacée dans STATUS.md (Règles)

---

## Fait le 2026-06-14

### Corrections bugs reset-password & forgot-password

- [x] `send-code/route.ts` : enveloppé dans try/catch global — erreur SMTP retournait HTML 500 au lieu de JSON
- [x] `UserService.changePassword` : suppression du `minLength < 6` hardcodé, remplacé par `MIN_PASSWORD_LENGTH` depuis `.env`
- [x] Architecture corrigée : l'API valide uniquement — UserService est le garant de la longueur minimale
- [x] `ForgotPasswordForm.tsx` : suppression du préfixe `errors.` dans `t(data.error)`
- [x] Traductions ajoutées dans fr/en/es : `ERR_EMAIL_SEND`, `ERR_UNAUTHORIZED`, `ERR_USER_NOT_FOUND`, `ERR_FIELDS_REQUIRED`, `ERR_PASSWORD_MISMATCH`, clés `resetPassword.*`

### Setup débogage VS Code

- [x] `.vscode/launch.json` : config "Next.js debug" attachement port 9230

---

## Fait le 2026-06-13

### Réorganisation arborescence

- [x] Déplacer pages subscriber dans `app/subscriber/` : myspace, download, stripe-success, profile, reset-password
- [x] Mettre à jour tous les liens internes vers les nouvelles URLs `/subscriber/*`
- [x] `next.config.ts` : `allowedDevOrigins: ["127.0.0.1"]`
- [x] `layout.tsx` : `suppressHydrationWarning` sur `<html>`

### Connexion base de données

- [x] Corriger port MariaDB : 3306 → 13306
- [x] Corriger credentials : `root:@` → `portfolio:123@portfolio_arbiter`
- [x] Régénérer client Prisma après `db pull`

### Navigation et layout

- [x] Footer extrait dans `components/Footer.tsx`
- [x] Liens langue : `<Link>` → `<a>` dans NavLinks et LanguageSwitcher

---

## Fait le 2026-06-12

### PHASE 1-7 — Infrastructure, types, services, routes, pages

- [x] Next.js 16 + TypeScript initialisé, dépendances installées, shadcn/ui configuré
- [x] `lib/prisma.ts`, `lib/AppError.ts`, `lib/auth.ts`, `lib/i18n.ts`, `middleware.ts`, `.env`
- [x] Types Prisma : User, Training, UserTraining, EmailTemplate
- [x] Services : UserService, TrainingService, UserTrainingService, EmailTemplateService, EmailService, CodeService, StripeService
- [x] Routes API : login, logout, refresh-claims, language/set, stripe/callback
- [x] Pages publiques : `/`, `/login`, `/register`, `/forgot-password`, `/catalog`, `/contact`, `/legal`, `/access-denied`, `/stripe-error`
- [x] Pages subscriber : myspace, download, stripe-success, profile, reset-password

---

## Notes techniques

- ORM : Prisma v5.22.0 — IDs sont INT UNSIGNED en DB et en Prisma (type `Int`)
- Cookie auth HTTP-only signé : `{ id, email, displayName, role, language, trainings[] }`
- Restriction des pages : uniquement dans `middleware.ts`, jamais dans les pages elles-mêmes
- DB : MariaDB 11.8, port 13306, user `portfolio`, base `portfolio_arbiter`
- Next.js : middleware se nomme obligatoirement `middleware.ts`, exporte `middleware` — https://nextjs.org/docs/app/routing/middleware
- Erreurs API : toujours retourner un code (`ERR_*`), jamais du texte en français — traduit côté client via `t(data.error, lang)`
- Debug VS Code : `node --inspect node_modules/next/dist/bin/next dev` puis attacher sur port 9230
