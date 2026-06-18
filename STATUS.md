# Règles

Règle : 7 sections maximum. Section 1 = À faire. Sections 2-7 (Archive) = Fait le YYYY-MM-DD (la plus ancienne est supprimée quand une nouvelle est ajoutée).
La demande utilisateur: "Archive" déplace toutes les tâches faites du jour dans les chapitres d'archive
Hirérachie: Projet > Tâches > étapes. Chaque tâches est analysée, puis on liste les étapes
Les tâches sont regroupé dans des projets ou le projet Divers si c'est une simple tâche

Sauvegarde : Git en local + Github https://github.com/JackReality/webPotfolioArbiter-ts

---

## À FAIRE

### Prochaine séance — priorités
1. Démarrer module Forum — réfléchir aux fonctionnalités, créer un projet Forum avec les tâches

### PHASE 11 — Suite Stripe (post-lancement)
- [ ] **Stripe dashboard** — Activer l'envoi automatique des reçus/factures par Stripe aux clients
- [ ] **Stripe dashboard** — Vérifier la configuration TVA (activer si pas fait)
- [ ] **Stripe live** — Remplacer les clés test par les clés live dans `.env` avant la mise en prod
- [ ] **Page `/stripe-error`** — Vérifier qu'elle existe et affiche un message clair avec un lien retour
- [ ] **Page `/formation`** — Vérifier qu'elle existe (c'est l'URL de retour si le user annule le paiement)

### PHASE 9 — Pages formation
- [ ] `app/trainings/private/portfolio/page.tsx` — construire le vrai contenu (actuellement placeholder)

### Divers
- [ ] Améliorer contact : message envoyé avec un vu vert, rajouter un champ Sujet dans le subject du mail
- [ ] Traduire toutes les pages (form contact non traduit)
- [ ] **Agrandir texte des blocs accueil** — image de comparaison à fournir dans `jack-import/`

---

## Fait le 2026-06-18

### Module Stripe — finalisation catalogue et formations

- [x] `private_page_url` + `public_page_url` + `is_free` dans la table `trainings` (Prisma + DB)
- [x] Catalogue : un seul bouton Acheter (bas) + bouton "Voir la formation" → `public_page_url`
- [x] Filtre catalogue : langue du user + titre + description + Stripe product/price si payante
- [x] Structure formations : `app/trainings/public/[code]/` et `app/trainings/private/[code]/`
- [x] Middleware adapté pour protéger `/trainings/private/[code]` dynamiquement (extraction du code depuis l'URL)
- [x] Pages placeholder portfolio : `/trainings/public/portfolio` et `/trainings/private/portfolio`
- [x] Formation gratuite : court-circuite Stripe dans le checkout, accès direct + session/rôle/communauté mis à jour
- [x] Catalogue : bouton "Obtenir gratuitement" pour `isFree=true`, "Acheter" pour payante

### Module Rachat de formation (`allow_repurchase`)

- [x] `allow_repurchase BOOLEAN` ajouté dans `trainings` (défaut `false`)
- [x] Check anti-doublon déplacé dans le checkout (avant Stripe), pas dans le callback
- [x] Règle métier dans `TrainingService` : si `isFree=true` → `allowRepurchase` forcé à `false` avant Prisma
- [x] Formulaire admin : cocher `isFree` décoche automatiquement `allowRepurchase`
- [x] Case à cocher `allow_repurchase` dans le formulaire admin formation

### Tests confirmés

- [x] Achat formation → rôle `subscriber` mis à jour en `client` — **OK**
- [x] Achat formation → `axs_community_expire` incrémenté — **OK**
- [x] Mail de bienvenu reçu après achat — **OK**

### Corrections bugs

- [x] Bug `t(\`errors.\${data.error}\`)` → `t(data.error)` dans `CatalogBuyButton` et `ContactForm`
- [x] Bug dialog admin "Modifier" : charge maintenant depuis la DB via `GET /api/admin/trainings/[id]` (plus de désync état local)
- [x] Route `GET /api/admin/trainings/[id]` créée

---

## Fait le 2026-06-17

### PHASE 11 — Paiement Stripe

- [x] Route `POST /api/stripe/checkout` — auth, anti-doublon, crée session Checkout, retourne `url`
- [x] Route `GET /api/stripe/callback` — vérifie paiement via API Stripe, attribution formation, mise à jour rôle + session + communauté
- [x] `services/StripeService.ts` — `createCheckoutSession` avec `client_reference_id` + `metadata.training_code`
- [x] Traductions `ERR_TRAINING_NOT_FOUND`, `ERR_STRIPE_NOT_CONFIGURED`, `ERR_ALREADY_PURCHASED` (fr/en/es)
- [x] `user_trainings` — colonnes `amount_ct INT UNSIGNED` et `currency VARCHAR(3)`
- [x] `myspace/page.tsx` — tableau formations avec colonne Prix (ex: 49.00 CHF), i18n fr/en/es
- [x] `admin/users` — bouton "Achats" → dialog avec Stripe ID, montant, devise, date
- [x] Phase 10b : `axs_community_expire` += `axs_community_months` à l'achat
- [x] `user_trainings.user_id` et `log_errors.user_id` → ON DELETE CASCADE
- [x] Mail bienvenu envoyé si `confirmation_email_html` non vide

---

## Fait le 2026-06-16

### PHASE 10 — Accès Communauté

- [x] Colonne `axs_community_expire DATETIME NULL` dans `users`
- [x] `SessionData` : ajout `communityAccess: boolean` · login : calcul et stockage dans la session
- [x] Middleware : protection `/community/*` via `session.communityAccess`
- [x] Colonne `axs_community_months INT UNSIGNED NULL` dans `trainings`

### PHASE 8 — Pages admin

- [x] `/admin/dashboard` — 3 cartes de navigation
- [x] `/admin/users` — tableau, menu rôle, suppression avec AlertDialog, routes API PATCH/DELETE
- [x] `/admin/trainings` — tableau, dialog ajout/modification, routes API POST/PATCH
- [x] `/admin/email-templates` — onglets par type et langue, formulaire édition, route API PATCH

---

## Fait le 2026-06-15

### Refactoring — Gestion des erreurs & types DB

- [x] Supprimer `numero` de `AppError` — tous les `throw new AppError()` dans les services
- [x] `schema.prisma` — tous les IDs BigInt → Int @db.UnsignedInt
- [x] Corriger textes hardcodés → codes ERR_* + traductions manquantes (fr/en/es)
- [x] Ajouter try/catch global aux routes sans protection
- [x] Créer table `log_errors` + `services/LogService.ts` + `logError()` dans les catch 500 (prod uniquement)
- [x] `middleware.ts` recréé (proxy.ts supprimé)
- [x] `/register` : redirect vers `/login?registered=1` après validation du code

---

## Notes techniques

- ORM : Prisma v5.22.0 — IDs sont INT UNSIGNED en DB et en Prisma (type `Int`)
- Cookie auth HTTP-only signé : `{ id, email, displayName, role, language, trainings[] }`
- Restriction des pages : uniquement dans `middleware.ts`, jamais dans les pages elles-mêmes
- DB : MariaDB 11.8, port 13306, user `portfolio`, base `portfolio_arbiter`
- Next.js 16 : middleware se nomme `middleware.ts` — warning "use proxy" → IGNORER, tout fonctionne
- Erreurs API : toujours `ERR_*`, traduit côté client via `t(data.error, lang)` — jamais `t(\`errors.\${data.error}\`)`
- Formations : pages publiques `app/trainings/public/[code]/`, privées `app/trainings/private/[code]/`
