# Règles

Règle : 7 sections maximum. Section 1 = À faire. Sections 2-7 (Archive) = Fait le YYYY-MM-DD (la plus ancienne est supprimée quand une nouvelle est ajoutée).
La demande utilisateur: "Archive" déplace toutes les tâches faites du jour dans les chapitres d'archive
Hirérachie: Projet > Tâches > étapes. Chaque tâches est analysée, puis on liste les étapes
Les tâches sont regroupé dans des projets ou le projet Divers si c'est une simple tâche

Sauvegarde : Git en local + Github https://github.com/JackReality/webPotfolioArbiter-ts

---

## À FAIRE

### DÉBOGAGE NUXT — Bugs repérés au premier lancement

- [ ] À documenter lors de la prochaine session (bugs visuels et fonctionnels vus sur le site)

### PHASE 9 — Pages formation

- [ ] `app/pages/trainings/private/portfolio.vue` — construire le vrai contenu (actuellement placeholder "coming soon")

### PHASE 11 — Suite Stripe (post-lancement)

- [ ] **Stripe dashboard** — Activer l'envoi automatique des reçus/factures par Stripe aux clients
- [ ] **Stripe dashboard** — Vérifier la configuration TVA (activer si pas fait)
- [ ] **Stripe live** — Remplacer les clés test par les clés live dans `.env` avant la mise en prod
- [ ] **Page `/stripe-error`** — Vérifier qu'elle s'affiche correctement avec un lien retour
- [ ] **Page `/formation`** — Vérifier qu'elle existe (URL de retour si le user annule le paiement)

---

## Fait le 2026-06-26

### MIGRATION NUXT — Finalisation et nettoyage ✅

#### Tests et corrections i18n (#17)
- [x] `es.json` : `{{message}}` → `{message}` pour `updateError` et `uploadError` (lignes 114-115)
- [x] `fr/en/es.json` : `{{email}}` → `[email]` dans la section legal (ligne 445 chacun)
- [x] `pages/legal.vue` : `renderContent()` mis à jour `'{{email}}'` → `'[email]'`
- [x] `pages/admin/trainings.vue` : `@change="if ..."` inline invalide → arrow function
- [x] `components/forum/SubjectDialog.vue` : `@update:open="if ..."` inline → arrow function
- [x] Build `npx nuxi build` : `✨ Build complete!`

#### Suppression Next.js/React (#18)
- [x] Supprimé : `app/` (57 fichiers Next.js), `.next/`, `next.config.ts`, `next-env.d.ts`, `middleware.ts` (racine), `components.json`
- [x] Supprimé : 31 fichiers `.tsx` dans `components/` (React + shadcn/ui)
- [x] Désinstallé : `next`, `react`, `react-dom`, `@types/react`, `@types/react-dom`, `@base-ui/react`, `lucide-react`, `shadcn`, `eslint-config-next`
- [x] `eslint.config.mjs` : nettoyé (suppression des refs Next.js)
- [x] Bundle réduit : 8.6 MB → 6.7 MB

#### Mise en route et optimisations
- [x] `assets/css/main.css` créé : `@import "tailwindcss"` + `@import "@nuxt/ui"` (CSS global manquant après suppression de `app/globals.css`)
- [x] `nuxt.config.ts` : `css: ['~/assets/css/main.css']` ajouté
- [x] `@source "../../app/**/*.{vue,ts}"` : Tailwind ne scanne plus que `app/` → premier chargement navigateur plus rapide
- [x] Réorganisation structure Nuxt 4 standard : tous les fichiers source déplacés dans `app/` (pages, components, layouts, middleware, utils, assets, services, lib, types, app.vue)
- [x] `srcDir: '.'` supprimé de `nuxt.config.ts` → Nuxt 4 utilise `app/` par défaut

---

## Fait le 2026-06-22

### Forum — Nettoyage et refactoring

- [x] Suivi : message "Aucune publication antérieure" affiché si `prev = null` (flèche gauche désactivée)
- [x] `ForumSearchService.ts` → renommé `ForumService.ts` (service cross-tables générique)
- [x] `ForumSubjectService.getAll()` → renommé `getActive()` (retourne uniquement `status = open`)
- [x] Suppression du statut `closed` — fermer un sujet = archiver directement
  - Réactivation (`archived` → `open`) : owner + mod + admin, limite 1 mois après archivage
  - Au-delà d'1 mois : bouton masqué, API refuse pour tout le monde
  - `forum.md` mis à jour
- [x] `ForumService.runAutoTasks()` extrait de `getActive()` — appelé depuis `community-init` (1 fois par visite)
- [x] Périmètre Suivi corrigé : `open` uniquement — archivés et biffés exclus
- [x] Recherche : biffés exclus pour tous (sujets + commentaires), même pour les mods

### Contact — Améliorations
- [x] Champ Sujet ajouté au formulaire → utilisé dans le subject du mail
- [x] Succès : icône ✅ verte + titre + message
- [x] i18n complète FR/EN/ES

### Traductions — Pages restantes
- [x] Toutes les pages traduites FR/EN/ES
- [x] Pages admin : non traduites (usage interne — documenté dans `CLAUDE.md`)

### Audit ERR_*
- [x] `ERR_HAS_REPLIES` manquant dans les locales → ajouté FR/EN/ES
- [x] Règle documentée dans `CLAUDE.md` : tout code ERR_* doit exister dans les 3 locales

---

## Fait le 2026-06-21

### Forum — Onglets, recherche, archivage, affichage sujet

- [x] `forum_comment` : `dest_user_id INT UNSIGNED NULL` + `is_staff BOOLEAN DEFAULT false`
- [x] `forum_subject` : `is_staff BOOLEAN DEFAULT false`
- [x] Prop `readOnly` sur `SubjectCard` : masque like/reply/edit/delete/pin (Archives et Biffé)
- [x] Visuel staff : `border-l-4 border-teal-400` + fond gris
- [x] Suivi : date + flèches centrées, tri ancien→récent, bouton "Aujourd'hui"
- [x] Onglet "Pour moi" : commentaires où `dest_user_id = userId`, vue 3 colonnes
- [x] Onglet Recherche : `ForumService`, route `GET /api/forum/search`, vue 3 colonnes
- [x] Header sujet : auteur · date création · modifié le · expire le (rouge si dépassée) · nb commentaires
- [x] Archiver/Supprimer : owner OU mod — service choisit DELETE (0 commentaire) ou archive
- [x] Désarchiver : mod uniquement
- [x] Ordre des onglets : Forum · Suivi · Pour moi · Recherche · Archives · Biffé
- [x] Header site : `displayName` affiché sous le picto UserCircle (desktop)

---

## Fait le 2026-06-20

### Forum — Dialogue sujet, pictos, rafraîchissement

- [x] `/community/new` : type `announcement` visible uniquement pour admin et moderator
- [x] `SubjectDialog` : largeur 75vw, fetch par ID à l'ouverture, réutilise `SubjectCard`
- [x] `SubjectCard` : prop `highlightCommentId` — trait vert + scroll auto vers commentaire ciblé
- [x] Bouton 👁️ sur sujets et commentaires du Suivi → ouvre `SubjectDialog` avec highlight
- [x] Sujets biffés filtrés dans Suivi pour les non-mods
- [x] Débiffér : picto ✅ (cohérence avec 👁️ = "voir")
- [x] Commentaire biffé : texte en `text-red-400`

---

## Fait le 2026-06-19

### Forum — Corrections et améliorations visuelles

- [x] Hydration mismatch `Date.now()` corrigé
- [x] `formatDate` : format manuel `getUTC*()` + noms de mois hardcodés (pas de dépendance locale)
- [x] Changement de langue corrigé → mise à jour de `session.language` iron-session
- [x] Redirection après login → `/subscriber/myspace`
- [x] Ligne d'identité, séparateurs, liens cliquables, troncature 3 lignes ▼/▲
- [x] Commentaires épinglés : bordure ambre + fond ambre
- [x] Confirmation suppression : ✖ rouge puis ✔ vert

---

## Notes techniques

- **Stack** : Nuxt 4.4.8 · Vue 3.5.39 · @nuxt/ui 4.9.0 · @nuxtjs/i18n 10.4.0 · MySQL/Prisma 5.22
- **Structure** : `app/` = source Nuxt (pages, components, layouts, middleware, utils, assets, services, lib, types) · `server/` = routes API Nitro · `i18n/` = traductions · `public/` = statiques
- **CSS** : `app/assets/css/main.css` — `@import "tailwindcss"` + `@source` limité à `app/` + `@import "@nuxt/ui"`
- **Cookie auth** HTTP-only signé : `{ id, email, displayName, role, language, trainings[] }`
- **DB** : MariaDB 11.8, port 13306, user `portfolio`, base `portfolio_arbiter`
- **Erreurs API** : toujours `ERR_*`, traduit côté client via `t(data.error)` — jamais de texte en dur
- **Formations** : pages publiques `app/pages/trainings/public/[code].vue` · privées `app/pages/trainings/private/[code].vue`
- **i18n** : `strategy: 'no_prefix'` — jamais de langue dans l'URL · fichiers dans `i18n/locales/`
- **Restriction des pages** : uniquement dans `app/middleware/auth.global.ts`, jamais dans les pages
