# Portfolio Arbiter (Next.js / TypeScript)

## Stack
Next.js 16 · TypeScript · MySQL avec Prisma 5.22 · shadcn/ui · Cookie auth + bcrypt · i18n FR/EN/ES

## Règles non négociables
1. Code/identifiants en anglais, SQL snake_case, TypeScript camelCase
2. DB_HOST=127.0.0.1 obligatoire
3. SQL écrit manuellement — jamais de ORM
4. Toujours utiliser des paramètres ? dans les requêtes SQL, jamais interpoler une variable
5. Les noms des membres TypeScript doivent correspondre exactement aux colonnes MySQL
6. shadcn/ui en priorité pour les composants UI
7. Répondre en français · expliquer simplement (débutant)
8. DB : jamais BIGINT — toujours INT UNSIGNED (max 4 milliards, suffisant)

## Rôles
- public      ← non connecté
- subscriber  ← connecté, a créé un compte
- client      ← a acheté au moins une formation valide
- moderator   ← modère le forum
- admin       ← accès total

## Accès formations
- Réservé aux clients qui possèdent le code formation dans trainings[] du cookie
- Lu depuis la table user_trainings au login
- Dossier nommé training_{code} ex: training_portfolio

## Structure des dossiers (par rôle)
/app/subscriber          ← subscriber, client, moderator, admin
/app/moderator           ← moderator et admin
/app/admin               ← admin seulement
/app/training_portfolio  ← client avec "portfolio" dans trainings[]
/app/training_photoshop  ← client avec "photoshop" dans trainings[]
middleware.ts            ← vérifie rôle et trainings[] — export function middleware (nom imposé par Next.js)
                           Doc officielle : https://nextjs.org/docs/app/routing/middleware

## Authentification
- Cookie HTTP only contenant : email, nom, role, langue, formations[]
- Restriction des pages gérée uniquement dans middleware.ts
- Jamais de restriction déclarée dans la page elle-même

## Règles Next.js App Router

### Liens et navigation
- `<Link>` uniquement pour naviguer entre pages Next.js (navigation client-side, rapide)
- `<a>` obligatoire pour : routes `/api/...`, changement de langue, déconnexion — tout ce qui doit déclencher un vrai rechargement HTTP
- Raison : `<Link>` intercepte le clic côté client et ne soumet pas de requête HTTP complète — le code serveur (cookies, redirects) ne s'exécute pas

## Multilingue FR/EN/ES
- Jamais de texte en dur dans un `.tsx` — tout passe par `t()` avec `lang: string`
- User connecté → langue depuis son profil en DB · Visiteur → cookie "language"
- Jamais de langue dans l'URL · Changement = mise à jour du cookie uniquement

## Gestion des erreurs
- Toutes les erreurs (service ET client) = code ERR_* traduit via t() — jamais de texte en dur
- Classe AppError centrale dans /lib/AppError.ts : un seul champ `code` (clé de traduction ex ERR_EMAIL_TAKEN)
- Services : throw AppError pour toutes les erreurs prévues
- Routes API : try/catch global obligatoire sur chaque route
  - instanceof AppError → return { error: code } HTTP 400
  - autre exception → console.error + logError() en prod + return ERR_SYSTEM HTTP 500
- Client : t(data.error, lang) — jamais t(`errors.${data.error}`)

## Pattern service par table
- Un fichier de service par table dans /services ex: UserService.ts
- Chaque service contient : getById, add, update, remove
- update construit la requête automatiquement :
  const { id, ...fields } = obj — colonnes via Object.keys(fields), valeurs via Object.values(fields)
- Jamais écrire les noms de colonnes manuellement dans update

## Mode de travail
Proposer les tâches sans coder → validation → une tâche à la fois → s'arrêter après chaque tâche.

## ⚠️ Lecture des fichiers
- Lire UNIQUEMENT les fichiers concernés par la tâche en cours
- Ne PAS explorer le projet de façon autonome
- Demander avant de lire un fichier non mentionné
