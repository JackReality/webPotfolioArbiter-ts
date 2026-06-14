# Portfolio Arbiter (Next.js / TypeScript)

## Référence
L'ancien projet Blazor est dans ../webPortfolio-cs
Lire UNIQUEMENT si besoin de comprendre la logique métier existante.

## Stack
Next.js 16 · TypeScript · MySQL Avec Prisma 5.22 · shadcn/ui · Cookie auth + bcrypt · i18n FR/EN/ES

## Règles non négociables
1. Code/identifiants en anglais, SQL snake_case, TypeScript camelCase
2. DB_HOST=127.0.0.1 obligatoire
3. SQL écrit manuellement — jamais de ORM
4. Toujours utiliser des paramètres ? dans les requêtes SQL, jamais interpoler une variable
5. Les noms des membres TypeScript doivent correspondre exactement aux colonnes MySQL
6. shadcn/ui en priorité pour les composants UI
7. Répondre en français · expliquer simplement (débutant)

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

## Structure
/app
    /public              ← tout le monde
    /subscriber          ← subscriber, client, moderator, admin
    /moderator           ← moderator et admin
    /admin               ← admin seulement
    /training_portfolio  ← client avec "portfolio" dans trainings[]
    /training_photoshop  ← client avec "photoshop" dans trainings[]
/components
/services
/types
/lib
    db.ts
    auth.ts
    i18n.ts
middleware.ts            ← vérifie rôle et trainings[]

## Sauvegarde
- Git en local
- Github : https://github.com/JackReality/webPotfolioArbiter-ts

## Authentification
- Cookie HTTP only contenant : email, nom, role, langue, formations[]
- Rôles : public / membre / subscriber / admin
- Restriction des pages gérée uniquement dans middleware.ts
- Jamais de restriction déclarée dans la page elle-même

## Règles Next.js App Router

### Liens et navigation
- `<Link>` uniquement pour naviguer entre pages Next.js (navigation client-side, rapide)
- `<a>` obligatoire pour : routes `/api/...`, changement de langue, déconnexion — tout ce qui doit déclencher un vrai rechargement HTTP
- Raison : `<Link>` intercepte le clic côté client et ne soumet pas de requête HTTP complète — le code serveur (cookies, redirects) ne s'exécute pas

### Traductions dans les composants client
- Tout texte visible dans un `"use client"` passe par `t()` avec un prop `lang: string`, ou par un prop `string` envoyé depuis le composant serveur parent via `t()`
- Jamais de texte en français (ou toute autre langue) écrit en dur dans un fichier `.tsx`
- Raison : un texte hardcodé ne se traduit pas et génère des bugs silencieux en EN/ES

## Multilingue FR/EN/ES
- User connecté → langue lue depuis son profil en base de données
- Visiteur non connecté → langue lue depuis un cookie séparé "langue"
- Langue lue dans middleware.ts et transmise aux pages
- Jamais de langue dans l'URL
- Changement de langue → simple mise à jour du cookie, pas de rechargement complet

## Gestion des erreurs
- Classe AppError centrale dans /lib/AppError.ts :
  - code : clé de traduction ex ERR_NOM_MANQUANT
  - numero : 1000-1999 validation · 2000-2999 métier · 3000-3999 BDD
- Toutes les méthodes de service throw AppError pour les erreurs prévues
- Dans les pages : try/catch
  - instanceof AppError → afficher t(ex.code)
  - autre exception → erreur système

## Pattern service par table
- Un fichier de type par table dans /types ex: User.ts — contient uniquement l'interface
- Un fichier de service par table dans /services ex: UserService.ts — contient les fonctions
- Chaque service contient : getById, add, update, remove
- update construit la requête automatiquement en parsant les membres :
  const { id, ...fields } = obj
  colonnes générées via Object.keys(fields)
  valeurs générées via Object.values(fields)
- Jamais écrire les noms de colonnes manuellement dans update

## Mode de travail
Proposer les tâches sans coder → validation → une tâche à la fois → s'arrêter après chaque tâche.

## ⚠️ Lecture des fichiers
- Lire UNIQUEMENT les fichiers concernés par la tâche en cours
- Ne PAS explorer le projet de façon autonome
- Demander avant de lire un fichier non mentionné

## Démarrage
1. Lire uniquement STATUS.md
2. Lancer npm run dev (port 3000)