# Règles

Règle : 7 sections maximum. Section 1 = À faire. Sections 2-7 (Archive) = Fait le YYYY-MM-DD (la plus ancienne est supprimée quand une nouvelle est ajoutée).
La demande utilisateur: "Archive" déplace toutes les tâches faites du jour dans les chapitres d'archive
Hirérachie: Projet > Tâches > étapes. Chaque tâches est analysée, puis on liste les étapes
Les tâches sont regroupé dans des projets ou le projet Divers si c'est une simple tâche

Sauvegarde : Git en local + Github https://github.com/JackReality/webPotfolioArbiter-ts

---

## À FAIRE

### Forum / Communauté

#### Tâche 9 — Style visuel autres onglets
- [ ] Répliquer dans **onglet Archives** (SubjectCard réutilisé — vérifier que les styles s'appliquent bien)

#### Tâche 10 — Améliorations forum (à faire)

**Divers**
- [ ] Ajouter une image dans un commentaire ou un sujet, à voir ou celle ci se stock et il faut la réduire
- [ ] Marquer le commentaire écrit par le médiateur ou admin (Idem) dans la DB aussi, afin de faire des recherche. Les faire ressortir visuellement
- [ ] Mise à jour des commentaires ou sujets postés par d'autres users (polling ou bouton actualiser)

**Date d'échéance dans la fiche sujet**
- [ ] Afficher `expiresAt` dans le header de `SubjectCard` : aligné à droite, discret (`text-xs text-muted-foreground`)
- [ ] Si `expiresAt` est dépassée → archiver automatiquement le sujet (à décider : côté serveur au chargement, ou cron)

**Bouton Archiver un sujet**
- [ ] Visible pour admin, moderator, et owner du sujet
- [ ] Appelle `PATCH /api/forum/subjects/[id]` avec `action: "archive"`
- [ ] Une fois archivé/biffé : tous les pictos disparaissent (plus de modifier, supprimer, répondre, épingler)
  - S'applique partout : onglet Forum, Suivi, Archives, Biffé, Recherche, dialogue

**Onglet Recherche (nouveau)**
- [ ] Champs : intervalle de dates (date début / date fin, 1 mois par défaut), texte libre, filtre user
- [ ] Affichage résultats en hiérarchie inversée (même style que Suivi) — commentaire → parent → sujet
- [ ] Chaque commentaire affiche un bouton picto 👁️ → ouvre `SubjectDialog` avec highlight du commentaire

**Règle générale — sujets archivés ou biffés**
- [ ] Dans tous les onglets : si `status === "archived"` ou `status === "hidden"` → masquer tous les pictos d'action (modifier ✏️, supprimer 🗑️, répondre ↩️, épingler 📍, biffer 🚫)
- [ ] Lecture seule uniquement

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

## Fait le 2026-06-20

### Forum — Dialogue sujet, pictos, rafraîchissement

#### Tâche 8 ✅ — `/community/new` finalisé
- [x] i18n complète : page convertie en composant serveur, `NewSubjectForm.tsx` client avec `t()` + `lang`
- [x] Type `announcement` (📢) visible uniquement pour admin et moderator

#### Dialogue "Voir le sujet" ✅
- [x] `GET /api/forum/subjects/[id]` ajouté (retourne sujet avec `_count.comments`)
- [x] `getByIdWithCount` ajouté dans `ForumSubjectService`
- [x] `SubjectDialog.tsx` créé : largeur 75vw, fetch par ID à l'ouverture, réutilise `SubjectCard`
- [x] `SubjectCard` : prop `initialExpanded` (expand auto dans le dialogue)
- [x] `SubjectCard` : prop `highlightCommentId` — trait vert gauche + scroll auto vers le commentaire ciblé
- [x] Highlight fonctionnel pour les commentaires de niveau 1 (réponses) également
- [x] Fond épinglé ambre + surlignage vert : meilleure visibilité en dark mode (`dark:bg-*/30` au lieu de `/20`)

#### Onglet Suivi — bouton 👁️
- [x] `SuiviTab` : nouveaux props `userRole` + `displayName` (transmis au dialogue)
- [x] Bouton 👁️ sur chaque sujet et chaque commentaire → ouvre `SubjectDialog` avec highlight
- [x] Ligne identité alignée sur le style Forum : `displayName · date (→ addressedTo)` en `text-xs text-muted-foreground`
- [x] Sujets biffés filtrés dans Suivi pour les non-mods

#### Pictos et visuels
- [x] Débiffér : 👁️ remplacé par ✅ (dans `SubjectCard` sujet + commentaire) — cohérence avec 👁️ = "voir"
- [x] Commentaire biffé : texte en `text-red-400` (au lieu d'un fond rouge invisible en dark mode)

#### Rafraîchissement
- [x] Clic onglet **Forum** → `router.refresh()` (recharge les sujets depuis le serveur)
- [x] Clic onglet **Suivi** → `suiviKey` incrémenté → re-fetch la date courante affichée
- [x] Onglet **Biffé** : `onRefreshList` callback sur `SubjectCard` → re-fetch la liste locale après action
- [x] Bug : débiffér un sujet le retire de Biffé ET le fait apparaître dans Forum

---

## Fait le 2026-06-19

### Forum — Corrections et améliorations visuelles

#### Corrections de bugs
- [x] Hydration mismatch `Date.now()` dans `SubjectCard` → `useEffect` + `useState(false)` pour `withinEditWindow` et `withinEditWindowSubject`
- [x] `formatDate` avec `toLocaleDateString("fr-CH")` → format manuel `getUTC*()` + noms de mois hardcodés (pas de dépendance locale Node.js/navigateur)
- [x] Changement de langue inopérant pour users connectés : `/api/language/set` ne mettait à jour que le cookie simple → mise à jour de `session.language` iron-session également
- [x] Redirection après login → `/subscriber/myspace` (au lieu de `/`)
- [x] BiffeTab : ne se charge plus au montage de la page (évite la boucle `useEffect` causant le spinner) → rendu conditionnel avec `{biffeRequested && <BiffeTab />}`

#### Améliorations visuelles commentaires (onglet Forum — à répliquer dans autres onglets)
- [x] Ligne d'identité (`displayName · date · contexte réponse + pictos`) : `text-xs text-muted-foreground` sur le conteneur — nom en `font-medium`
- [x] Pictos d'action : `gap-2` → `gap-3` (50% plus espacés)
- [x] Séparateur entre commentaires niveau 0 : `border-b border-border/30 last:border-0`
- [x] Liens cliquables dans le contenu (regex URL → `<a target="_blank">`)
- [x] Contenu tronqué à 3 lignes max (`overflow-hidden max-h-[3.75rem]`) + flèche jaune ▼/▲ pour expand
- [x] Commentaires épinglés : bordure gauche ambre + fond ambre subtil + `<Separator>` de séparation
- [x] Confirmation suppression : ✖ rouge (à la place du 🗑️) puis ✔ vert

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

## Notes techniques

- ORM : Prisma v5.22.0 — IDs sont INT UNSIGNED en DB et en Prisma (type `Int`)
- Cookie auth HTTP-only signé : `{ id, email, displayName, role, language, trainings[] }`
- Restriction des pages : uniquement dans `middleware.ts`, jamais dans les pages elles-mêmes
- DB : MariaDB 11.8, port 13306, user `portfolio`, base `portfolio_arbiter`
- Next.js 16 : middleware se nomme `middleware.ts` — warning "use proxy" → IGNORER, tout fonctionne
- Erreurs API : toujours `ERR_*`, traduit côté client via `t(data.error, lang)` — jamais `t(\`errors.\${data.error}\`)`
- Formations : pages publiques `app/trainings/public/[code]/`, privées `app/trainings/private/[code]/`
