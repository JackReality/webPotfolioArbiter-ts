# Portfolio Arbiter (Nuxt / Vue / TypeScript)

## Stack
Nuxt 3 (ou 4 si stable) · Vue 3 · TypeScript · MySQL avec Prisma 5.22 · Nuxt UI · Cookie auth + bcrypt · @nuxtjs/i18n FR/EN/ES

## Commande pour démarrer le serveur
```
npm run dev
```
(ou `npx nuxt dev`)

## Règles non négociables
1. Code/identifiants en anglais, SQL snake_case, TypeScript camelCase
2. DB_HOST=127.0.0.1 obligatoire
3. SQL écrit manuellement — jamais de ORM
4. Toujours utiliser des paramètres ? dans les requêtes SQL, jamais interpoler une variable
5. Les noms des membres TypeScript doivent correspondre exactement aux colonnes MySQL
6. Nuxt UI en priorité pour les composants UI (remplace shadcn/ui)
7. Répondre en français · expliquer simplement (débutant)
8. DB : jamais BIGINT — toujours INT UNSIGNED (max 4 milliards, suffisant)
9. Fichiers pages : `.vue` uniquement — jamais `.tsx` ou `.jsx`
10. Composants : utiliser `<script setup lang="ts">` (Composition API) dans tous les `.vue`

## Rôles
- public      ← non connecté
- subscriber  ← connecté, a créé un compte
- client      ← a acheté au moins une formation valide
- moderator   ← modère le forum
- admin       ← accès total

## Accès formations
- Réservé aux clients qui possèdent le code formation dans trainings[] du cookie
- Lu depuis la table user_trainings au login
- Pages publiques : pages/trainings/public/[code].vue  ex: pages/trainings/public/portfolio.vue
- Pages privées   : pages/trainings/private/[code].vue ex: pages/trainings/private/portfolio.vue
- Sous-pages d'une formation privée : pages/trainings/private/portfolio/lesson-2.vue

## Structure des dossiers (par rôle)
/pages/subscriber.vue                 ← wrapper parent (routes imbriquées Nuxt)
/pages/subscriber/                    ← subscriber, client, moderator, admin
/pages/moderator.vue                  ← wrapper parent
/pages/moderator/                     ← moderator et admin
/pages/admin.vue                      ← wrapper parent
/pages/admin/                         ← admin seulement
/pages/trainings/public/[code].vue    ← accessible à tous (page de présentation)
/pages/trainings/private.vue          ← wrapper parent formations privées
/pages/trainings/private/[code].vue   ← client avec code dans trainings[] du cookie
/server/api/                          ← routes API Nuxt (remplace app/api/ Next.js)
middleware/auth.global.ts             ← vérifie rôle et trainings[] sur toutes les routes
                                         Format : defineNuxtRouteMiddleware((to) => { ... })
                                         Redirection : return navigateTo('/login')

## Authentification
- Cookie HTTP only contenant : email, nom, role, langue, formations[]
- Restriction des pages gérée uniquement dans middleware/auth.global.ts
- Jamais de restriction déclarée dans la page elle-même
- Lecture du cookie dans les composants : useCookie('session') — composable natif Nuxt

## Règles Nuxt / Vue

### Liens et navigation
- `<NuxtLink>` pour naviguer entre pages Vue (navigation client-side, rapide)
- `<a>` pour les liens externes uniquement
- `navigateTo('/chemin')` pour les redirections programmatiques (remplace router.push)
- `$fetch('/api/...')` ou `useFetch('/api/...')` pour appeler les routes API internes

### Routes API Nuxt (server/)
- Fichiers dans `/server/api/` — format : `defineEventHandler(async (event) => { ... })`
- Lire le body : `await readBody(event)`
- Lire les params d'URL : `getRouterParam(event, 'id')`
- Lire les query params : `getQuery(event)`
- Retourner une erreur : `throw createError({ statusCode: 400, data: { error: 'ERR_...' } })`
- La logique métier reste dans les services — jamais dans les handlers

## Multilingue FR/EN/ES
- Jamais de texte en dur dans un `.vue` — tout passe par `const { t } = useI18n()` (composable @nuxtjs/i18n)
- User connecté → langue depuis son profil en DB · Visiteur → cookie "language"
- Jamais de langue dans l'URL (strategy: 'no_prefix' dans nuxt.config.ts)
- Changement de langue = mise à jour du cookie uniquement
- **Pages admin** (`/pages/admin/`) : exception — non traduites, toujours en français (usage interne uniquement)
- **Codes d'erreur** : tout code `ERR_*` retourné par une API doit avoir une clé correspondante dans les 3 locales (fr/en/es) — vérifier avant d'ajouter un nouveau code
- Fichiers de traduction : `/i18n/locales/fr.json`, `/i18n/locales/en.json`, `/i18n/locales/es.json`
  (@nuxtjs/i18n v10 utilise `i18n/locales/` par défaut — le `langDir: 'locales/'` dans nuxt.config.ts est relatif à `i18n/`)

## Pattern service par table
- Un fichier de service par table dans /services ex: UserService.ts
- Chaque service contient : getById, add, update, remove
- update construit la requête automatiquement :
  const { id, ...fields } = obj — colonnes via Object.keys(fields), valeurs via Object.values(fields)
- Jamais écrire les noms de colonnes manuellement dans update

## ⚠️ Toute logique métier dans les services — sans exception
- Zéro logique métier dans les routes API, le middleware, ou les pages
- Cela inclut la construction du cookie/session : un service calcule les champs (ex: communityAccess)
- Le middleware et les pages lisent uniquement le cookie — ils ne recalculent rien
- Si la même condition apparaît à deux endroits, c'est un bug : il faut la remonter dans le service

## Gestion des erreurs (routes API Nuxt)
- Toutes les erreurs (service ET client) = code ERR_* traduit via t() — jamais de texte en dur
- Classe AppError centrale dans /lib/AppError.ts : un seul champ `code` (clé de traduction ex ERR_EMAIL_TAKEN)
- Services : throw AppError pour toutes les erreurs prévues
- Routes API : try/catch global obligatoire sur chaque handler
  - instanceof AppError → throw createError({ statusCode: 400, data: { error: code } })
  - autre exception → console.error + logError() en prod + throw createError({ statusCode: 500, data: { error: 'ERR_SYSTEM' } })
- Client : t(data.error) via useI18n() — jamais de texte en dur

## Forum / Communauté
Spécification complète dans `forum.md` à la racine du projet.
Lire ce fichier avant toute tâche liée au forum.

## Mode de travail
Proposer les tâches sans coder → validation → une tâche à la fois → s'arrêter après chaque tâche.

## ⚠️ Lecture des fichiers
- Lire UNIQUEMENT les fichiers concernés par la tâche en cours
- Ne PAS explorer le projet de façon autonome
- Demander avant de lire un fichier non mentionné
