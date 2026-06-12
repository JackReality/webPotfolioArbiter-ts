# STATUS — Réécriture Next.js / TypeScript

Réécriture du projet Blazor C# (`../webPortfolio-cs`) en Next.js 16 + TypeScript.
Avancement : chaque tâche est marquée `[ ]` (à faire) ou `[x]` (terminée).

---

## PHASE 1 — Infrastructure

- [x] Initialiser le projet Next.js 16 avec TypeScript (`npx create-next-app`)
- [x] Installer les dépendances : `bcrypt`, `nodemailer`, `stripe`, `iron-session`, `prisma@5.22.0`
- [x] Installer et configurer shadcn/ui
- [x] Créer `lib/prisma.ts` — client Prisma singleton (Prisma v5.22.0, remplace lib/db.ts)
- [x] Créer `lib/AppError.ts` — classe centrale d'erreurs (code + numéro)
- [x] Créer `lib/auth.ts` — lecture/écriture du cookie HTTP-only (email, nom, role, langue, trainings[])
- [x] Créer `lib/i18n.ts` — chargement des fichiers JSON FR/EN/ES (`jack-import/*.json`)
- [x] Créer `middleware.ts` — vérification rôle et trainings[] par route
- [x] Créer `.env.local` — variables DB_*, SMTP_*, STRIPE_SECRET_KEY, CONTACT_EMAIL, MAIL_FROM

---

## PHASE 2 — Types TypeScript

- [x] `types/User.ts` — re-exporte `User` depuis `@prisma/client`
- [x] `types/Training.ts` — re-exporte `Training` depuis `@prisma/client`
- [x] `types/UserTraining.ts` — re-exporte `UserTraining` depuis `@prisma/client`
- [x] `types/EmailTemplate.ts` — re-exporte `EmailTemplate` depuis `@prisma/client`
- [x] `prisma/schema.prisma` — modèles User, Training, UserTraining, EmailTemplate avec `@map`/`@@map`

---

## PHASE 3 — Services

- [x] `services/UserService.ts` — getById, getAll, getByEmail, emailExists, add (bcrypt), update, changePassword, changeEmail, changeRole, verifyPassword, remove
- [x] `services/TrainingService.ts` — getById, getAll, getByLanguage, getByCode, getByCodes, add, update, remove
- [x] `services/UserTrainingService.ts` — getById, getByUser, hasAccess, add, update, remove
- [x] `services/EmailTemplateService.ts` — getById, getAll, get(key, language), update, save
- [x] `services/EmailService.ts` — sendEmail via SMTP (nodemailer), support replyTo
- [x] `services/CodeService.ts` — generateCode, checkCode — Map en mémoire, expiry 20 min, max 5 tentatives
- [x] `services/StripeService.ts` — createCheckoutSession (training, userId, successUrl, cancelUrl)

---

## PHASE 4 — API Routes (Route Handlers Next.js)

- [x] `app/api/auth/login/route.ts` — POST : vérifier identifiants, poser cookie auth + cookie langue
- [x] `app/api/auth/logout/route.ts` — GET/POST : supprimer le cookie auth, rediriger vers /
- [x] `app/api/auth/refresh-claims/route.ts` — GET : relire l'utilisateur en base, réécrire le cookie (après mise à jour profil)
- [x] `app/api/language/set/route.ts` — GET : mettre à jour le cookie de langue, rediriger
- [x] `app/api/stripe/callback/route.ts` — GET `/stripe-ok` : valider session Stripe, créer user_training, passer role à "client", envoyer email confirmation, rediriger

---

## PHASE 5 — Pages publiques

- [x] `/` — Home : 6 sections (hero, ticker, position, stratégie, transactions, rendement, arbitrage) avec images de `wwwroot/images`
- [x] `/login` — Connexion : formulaire email + mot de passe, POST vers `/api/auth/login`
- [x] `/register` — Inscription en 2 étapes : (1) formulaire → envoi code email via template `confirm_signup` ; (2) saisie code → création compte + email `welcome`
- [x] `/forgot-password` — Mot de passe oublié en 2 étapes : (1) email → envoi code via template `recovery` ; (2) code + nouveau mdp → mise à jour
- [x] `/catalog` — Catalogue : liste formations filtrées par langue, bouton Acheter → Stripe checkout (si non connecté → /login)
- [x] `/contact` — Formulaire de contact : honeypot, rate limit 5 s, envoi email SMTP avec replyTo
- [x] `/legal` — Mentions légales : 3 onglets CGV / Confidentialité / Mentions (contenu depuis les traductions)
- [x] `/access-denied` — Page accès refusé
- [x] `/stripe-error` — Page erreur paiement Stripe
- [x] `/not-found` — Page 404

---

## PHASE 6 — Pages subscriber

- [ ] `/myspace` — Mon espace : section ressources (lien Download) + liste formations achetées avec bouton Accéder
- [ ] `/download` — Télécharger : lien Google Sheets (abonnés et clients)
- [ ] `/stripe-success` — Confirmation achat : affiche titre de la formation, bouton vers la page de formation

---

## PHASE 7 — Pages profil (connecté)

- [ ] `/profile` — Profil : modifier nom affiché, langue (→ refresh cookie), changement email avec code OTP, lien vers reset-password, lien admin si role=admin
- [ ] `/reset-password` — Réinitialiser mot de passe (connecté) : vérifier mot de passe actuel, saisir nouveau mot de passe

---

## PHASE 8 — Pages admin

- [ ] `/admin-dashboard` — Dashboard : 3 boutons vers users / trainings / email-templates
- [ ] `/admin/users` — Gestion utilisateurs : tableau (email, nom, rôle, langue, date), dialog changement de rôle, suppression avec confirmation, admins protégés
- [ ] `/admin/trainings` — Gestion formations : tableau + formulaire ajout/édition (titre, code, langue, descriptionHtml, pageUrl, stripeProductId, stripePriceId, confirmationEmailHtml)
- [ ] `/admin/email-templates` — Templates emails : onglets par type (confirm_signup / recovery / welcome), sous-onglets FR/EN/ES, édition sujet + corps HTML

---

## PHASE 9 — Pages formation

- [ ] `/training/portfolio_home` — Page formation Portfolio : vérifier training="PORTFOLIO" dans le cookie, afficher titre + descriptionHtml

---

## PHASE 10 — Layout et navigation

- [ ] `components/Layout.tsx` — Layout principal (header, footer)
- [ ] `components/NavMenu.tsx` — Navigation : liens selon rôle, sélecteur FR|EN|ES, déconnexion

---

## PHASE 11 — Multilingue

- [ ] Copier `jack-import/fr.json`, `en.json`, `es.json` vers `lib/locales/`
- [ ] Fonction `t(key, lang)` dans `lib/i18n.ts` pour accéder aux clés imbriquées (ex: `auth.email`)
- [ ] Langue lue depuis le cookie auth (connecté) ou cookie `langue` (visiteur)
- [ ] Changement de langue via `/api/language/set` sans rechargement complet de la page

---

## Notes techniques

- Cookie auth HTTP-only signé : `{ id, email, displayName, role, language, trainings[] }`
- Restriction des pages : uniquement dans `middleware.ts`, jamais dans les pages elles-mêmes
- ORM : Prisma v5.22.0 — schéma dans `prisma/schema.prisma`, client singleton dans `lib/prisma.ts`
- Codes OTP : Map en mémoire serveur, expiry 20 min, max 5 tentatives, supprimé après usage
- Contact : honeypot (champ caché) + cooldown 5 s côté API route
- Stripe callback : valider session, enregistrer achat, mettre à jour cookie role → "client" + trainings[]
- Templates emails : variables `{{ DisplayName }}`, `{{ Code }}`, `{{ Title }}` remplacées par regex avant envoi
