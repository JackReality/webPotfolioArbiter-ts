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

#### Tâche 10 — Améliorations forum (reste)
- [ ] Ajouter une image dans un commentaire ou un sujet (stockage + compression — à décider)

### PHASE 11 — Suite Stripe (post-lancement)
- [ ] **Stripe dashboard** — Activer l'envoi automatique des reçus/factures par Stripe aux clients
- [ ] **Stripe dashboard** — Vérifier la configuration TVA (activer si pas fait)
- [ ] **Stripe live** — Remplacer les clés test par les clés live dans `.env` avant la mise en prod
- [ ] **Page `/stripe-error`** — Vérifier qu'elle existe et affiche un message clair avec un lien retour
- [ ] **Page `/formation`** — Vérifier qu'elle existe (c'est l'URL de retour si le user annule le paiement)

### PHASE 9 — Pages formation
- [ ] `app/trainings/private/portfolio/page.tsx` — construire le vrai contenu (actuellement placeholder)

### Divers
- [ ] Améliorer contact : message envoyé avec un vu vert, champ Sujet dans le formulaire + subject du mail, i18n
- [ ] Traduire toutes les pages (form contact non traduit)
- [ ] **Agrandir texte des blocs accueil** — image de comparaison à fournir dans `jack-import/`

---

## Fait le 2026-06-21

### Forum — Onglets, recherche, archivage, affichage sujet

#### Tâche 11 ✅ — DB : `dest_user_id` + `is_staff`
- [x] `forum_comment` : `dest_user_id INT UNSIGNED NULL` + `is_staff BOOLEAN DEFAULT false`
- [x] `forum_subject` : `is_staff BOOLEAN DEFAULT false`
- [x] Routes POST commentaire + sujet : populer `destUserId` et `isStaff`
- [x] Visuel staff : `border-l-4 border-teal-400` + `bg-zinc-50 dark:bg-zinc-800/40`

#### Tâche 12 ✅ — Prop `readOnly` + types
- [x] Types `SubjectData` + `CommentData` : + `isStaff`, `destUserId`
- [x] Prop `readOnly` sur `SubjectCard` : masque like/reply/edit/delete/pin — Archives et Biffé passés en `readOnly`
- [x] Visuel staff appliqué sur sujets et commentaires (teal + fond gris)

#### Tâche 13 ✅ — Suivi : refonte affichage
- [x] Date + flèches regroupées au centre
- [x] `getSince(date)` : affiche depuis la date sélectionnée jusqu'à aujourd'hui, tri ancien→récent
- [x] Flèche → : toujours active — date suivante si disponible, sinon aujourd'hui + update DB
- [x] Bouton "Aujourd'hui" sous la date — marque aujourd'hui en DB + affiche messages du jour
- [x] Vue 3 colonnes : sujets + commentaires fusionnés chronologiquement
- [x] Bug corrigé : `community/page.tsx` lisait toujours `getLastDateWithPosts()` au lieu de `forum_last_read_date` du user

#### Tâche 14 ✅ — Onglet "Pour moi"
- [x] `ForumCommentService.getForMe(userId)` : commentaires où `dest_user_id = userId`, triés récent→ancien
- [x] Route `GET /api/forum/for-me`
- [x] `PourMoiTab.tsx` : vue 3 colonnes, bouton 👁️ → `SubjectDialog` avec highlight
- [x] Rechargement au clic d'onglet (pattern `key` React)

#### Tâche 10 ✅ — Améliorations forum
- [x] `display_name VARCHAR(100)` sur `forum_subject` (snapshot auteur, cohérent avec commentaires)
- [x] Header sujet : auteur (gras) · date création · modifié le X · expire le X (rouge si dépassée) · nb commentaires
- [x] Auto-archivage : `getAll()` archive les sujets expirés (`expiresAt < NOW()`) avant de retourner la liste
- [x] 🗑️ Archiver/Supprimer : owner OU mod, status `open` — service choisit DELETE (0 commentaire) ou archive
- [x] 📂 Désarchiver : mod uniquement, picto dans Archives, recharge la liste après
- [x] `SubjectDialog` : `readOnly` dynamique selon status (archived/hidden) — couvre tous les onglets
- [x] Onglet Recherche : `ForumSearchService`, route `GET /api/forum/search`, `RechercheTab.tsx` vue 3 colonnes
  - Critères : texte, auteur, destinataire, staff only, date début/fin (défaut 3 mois)
  - Périmètre : open + closed + archived, jamais hidden (sauf mod)
- [x] Ordre des onglets : Forum · Suivi · Pour moi · Recherche · Archives · Biffé
- [x] Rechargement au clic d'onglet pour tous les onglets (Forum, Suivi, Pour moi, Archives, Biffé)

### Divers
- [x] **Header site** — `displayName` affiché sous le picto `UserCircle` dans le bandeau (desktop)

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
- [x] Fond épinglé ambre + surlignage vert : meilleure visibilité en dark mode

#### Onglet Suivi — bouton 👁️
- [x] Bouton 👁️ sur chaque sujet et chaque commentaire → ouvre `SubjectDialog` avec highlight
- [x] Sujets biffés filtrés dans Suivi pour les non-mods

#### Pictos et visuels
- [x] Débiffér : 👁️ remplacé par ✅ — cohérence avec 👁️ = "voir"
- [x] Commentaire biffé : texte en `text-red-400`

#### Rafraîchissement
- [x] Clic onglet Forum → `router.refresh()` · Suivi → `suiviKey++` · Biffé → `onRefreshList`

---

## Fait le 2026-06-19

### Forum — Corrections et améliorations visuelles

#### Corrections de bugs
- [x] Hydration mismatch `Date.now()` dans `SubjectCard` → `useEffect` + `useState(false)`
- [x] `formatDate` → format manuel `getUTC*()` + noms de mois hardcodés
- [x] Changement de langue inopérant → mise à jour de `session.language` iron-session
- [x] Redirection après login → `/subscriber/myspace`
- [x] BiffeTab : rendu conditionnel `{biffeRequested && <BiffeTab />}`

#### Améliorations visuelles commentaires
- [x] Ligne d'identité `text-xs text-muted-foreground`, nom en `font-medium`
- [x] Pictos d'action : `gap-3`
- [x] Séparateur entre commentaires niveau 0
- [x] Liens cliquables dans le contenu
- [x] Contenu tronqué à 3 lignes + flèche ▼/▲
- [x] Commentaires épinglés : bordure ambre + fond ambre
- [x] Confirmation suppression : ✖ rouge puis ✔ vert

---

## Fait le 2026-06-18

### Module Stripe — finalisation catalogue et formations

- [x] `private_page_url` + `public_page_url` + `is_free` dans la table `trainings`
- [x] Catalogue : bouton Acheter + "Voir la formation" → `public_page_url`
- [x] Formation gratuite : court-circuite Stripe, accès direct + session mise à jour
- [x] `allow_repurchase BOOLEAN` dans `trainings` + formulaire admin
- [x] Tests : achat → rôle `client`, `axs_community_expire` incrémenté, mail reçu ✅

---

## Fait le 2026-06-17

### PHASE 11 — Paiement Stripe

- [x] Route `POST /api/stripe/checkout` + `GET /api/stripe/callback`
- [x] `services/StripeService.ts` — `createCheckoutSession`
- [x] `user_trainings` — colonnes `amount_ct` + `currency`
- [x] `myspace/page.tsx` — tableau formations avec Prix
- [x] `admin/users` — bouton "Achats" → dialog Stripe
- [x] Mail bienvenu envoyé si `confirmation_email_html` non vide

---

## Notes techniques

- ORM : Prisma v5.22.0 — IDs sont INT UNSIGNED en DB et en Prisma (type `Int`)
- Cookie auth HTTP-only signé : `{ id, email, displayName, role, language, trainings[] }`
- Restriction des pages : uniquement dans `middleware.ts`, jamais dans les pages elles-mêmes
- DB : MariaDB 11.8, port 13306, user `portfolio`, base `portfolio_arbiter`
- Next.js 16 : middleware se nomme `middleware.ts` — warning "use proxy" → IGNORER, tout fonctionne
- Erreurs API : toujours `ERR_*`, traduit côté client via `t(data.error, lang)` — jamais `t(\`errors.\${data.error}\`)`
- Formations : pages publiques `app/trainings/public/[code]/`, privées `app/trainings/private/[code]/`
