---
description: Lancer le serveur de développement Nuxt
---

# Lancer l'application

## Commande

```bash
npm run dev
```

## Accès

- Local : http://localhost:3000
- Variables d'environnement lues depuis `.env` à la racine

## Notes

- Le serveur utilise Nuxt (Nitro en arrière-plan)
- Prêt quand "Nuxt ready" est affiché dans le terminal
- Base de données MySQL requise sur 127.0.0.1:3306 (voir DATABASE_URL dans `.env`)
- Pour tester les pages protégées, créer un compte sur `/register` puis se connecter sur `/login`
