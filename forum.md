# Spécification Forum / Communauté

## Accès
- Membres avec `axs_community_expire` valide (calculé dans `SessionService.buildSession`)
- Moderator et Admin : accès toujours actif (sans condition de date)
- Protection via `middleware.ts` : vérifie uniquement `session.communityAccess`

---

## Pictos

### Sujets — picto selon le type
| Valeur | Libellé | Picto |
|---|---|---|
| `question` | Question | ❓ |
| `share` | Témoignage / Partage | 💬 |
| `request` | Demande | 🙋 |
| `bug` | Bug | 🐛 |
| `announcement` | Annonce | 📢 |

> `announcement` réservé à admin et moderator à la création.

### Commentaires — picto selon le niveau
| Niveau | Picto | Description |
|---|---|---|
| Niveau 0 (commentaire direct sur sujet) | 🗨️ | Réponse directe au sujet |
| Niveau 1 (réponse à un commentaire) | ↩️ | Réponse à quelqu'un |

Exemple dans la vue inversée (onglet Suivi) :
```
🗨️  Commentaire de Julie
  ↩️  Commentaire de Marc    (expandable)
    ❓  Titre du sujet         (expandable)
```

---

## Sujets (`forum_subject`)

### Statuts (`status`)
| Valeur | Visible par | Description |
|---|---|---|
| `open` | Tous | Actif, commentaires possibles |
| `closed` | Tous | Fermé, plus de nouveaux commentaires |
| `archived` | Tous | Figé, lecture seule, affiché dans les archives |
| `hidden` | Admin / Moderator | Masqué (contenu jugé inapproprié), signalé par un picto 🚫 |

### Règles de suppression / archivage
- **Aucun commentaire** → suppression réelle (DELETE)
- **Au moins un commentaire** → passage en `archived` (jamais supprimé)
- Quand un sujet est archivé, tous ses commentaires le sont implicitement — pas de champ `archived` sur les commentaires

### Modification
- Possible dans l'**heure suivant la publication** (`created_at + 1h`)
- Après ce délai : lecture seule — seule action possible = suppression ou archivage

### Épinglage (`is_pinned`)
- Réservé à **admin et moderator**
- Sujet épinglé → affiché en tête de liste, avant les autres (réunions, annonces importantes)

### Expiration (`expires_at`)
- Copie de `axs_community_expire` du créateur au moment de la création
- Quand la date est dépassée → sujet automatiquement fermé (`closed`)

---

## Commentaires (`forum_comment`)

### Hiérarchie (1 niveau max)
- **Niveau 0** : commentaire direct sur un sujet → `forum_comment_id = NULL`
- **Niveau 1** : réponse à un commentaire → `forum_comment_id = id du commentaire niveau 0`

**Règle de flattening** : on peut répondre à n'importe quel commentaire (niveau 0 ou 1).
Si le commentaire cible est niveau 1, on remonte au parent : `forum_comment_id = commentaire_cible.forum_comment_id`.
Dans tous les cas, `addressed_to` contient le `display_name` de la personne à qui on s'adresse.

`forum_subject_id` est **toujours renseigné** sur tous les commentaires (niveau 0 et 1) → permet de récupérer tous les commentaires d'un sujet en une seule requête.

### Champ `display_name`
Snapshot du `display_name` de l'auteur au moment de la publication.
Si le user change de nom plus tard, les anciens commentaires conservent l'historique.

### Statuts (`status`)
| Valeur | Description |
|---|---|
| `visible` | Affiché normalement |
| `hidden` | Masqué par admin/moderator, signalé par un picto 🚫 — visible uniquement admin/moderator |

### Likes (`likes`)
- Champ JSON sur `forum_comment` uniquement (pas sur les sujets)
- Contient un tableau d'`user_id` : `[12, 45, 89]`
- 1 like par user par commentaire (vérifié avant update)
- Toggle : si déjà liké → retirer, sinon → ajouter
- Compter : `JSON_LENGTH(likes)`
- Vérifier si le user courant a liké : parcours des commentaires chargés en mémoire, pas de requête supplémentaire
- Update atomique via `JSON_ARRAY_APPEND` / `JSON_REMOVE` en SQL (évite les race conditions)

### Épinglage (`is_pinned`)
- Réservé à **admin, moderator, et owner du sujet**
- Commentaire épinglé → affiché en tête des commentaires du sujet

### Modification
- Possible dans l'**heure suivant la publication** (`created_at + 1h`)
- Après ce délai : lecture seule — seule action possible = suppression

### Suppression
- Par le **propriétaire du commentaire**, admin, ou moderator
- Suppression réelle (DELETE) — pas d'archivage au niveau commentaire

---

## Pages — Navigation par onglets

La page `/community` contient 4 onglets. Tous affichent les mêmes données mais avec une vue différente.

### Onglet 1 — Forum (vue normale)
- Tous les sujets non archivés et non masqués (sauf admin/moderator qui voient les `hidden`)
- Épinglés en tête, puis triés par dernière activité (dernier commentaire ou `created_at`)
- Chaque sujet est **rétracté par défaut**
- **Expand global** : un clic sur le sujet ouvre tous ses commentaires niveau 0 et niveau 1 d'un coup
- Indentation visuelle pour les commentaires niveau 1

### Onglet 2 — Suivi des publications
Vue centrée sur une **date** pour suivre ce qui s'est passé depuis la dernière visite.

**Champ DB** : `forum_last_read_date DATETIME NULL` dans `users`

**Date affichée au chargement** :
- Si `forum_last_read_date` est null → dernière date qui a des publications (ou aujourd'hui si aucune publication)
- Sinon → `forum_last_read_date`

**Navigation par flèches** :
- Flèche ← (précédent) : saute à la date précédente qui a des publications
- Flèche → (suivant) : saute à la date suivante qui a des publications
- **Seule la flèche → met à jour `forum_last_read_date`** (avancer = marquer comme lu)
- La flèche ← ne met pas à jour (remonter dans le temps ne "délit" pas)

**Vue du jour sélectionné** :
- Affiche uniquement les sujets ET commentaires créés ce jour-là
- **Hiérarchie inversée** (le plus récent en tête) :

| Niveau affiché | Contenu | Picto |
|---|---|---|
| 0 (en tête) | Le commentaire (niveau 0 ou 1 réel) | 🗨️ ou ↩️ |
| 1 (expandable) | Son commentaire parent (si niveau 1 réel) | 🗨️ |
| 2 (expandable) | Le sujet | picto du type |

- Bouton sur chaque item → dialogue modal affichant le sujet complet avec tous ses commentaires en vue traditionnelle

### Onglet 3 — Archives
- Tous les sujets `status = 'archived'`
- Limité aux 12 derniers mois
- Vue normale (même structure que l'onglet 1)

### Onglet 4 — Biffé *(admin et moderator uniquement)*
- Tous les sujets et commentaires `status = 'hidden'`
- Vue inversée identique à l'onglet 2 (le plus récent en tête)
- Signalé par 🚫

---

## Permissions résumées

| Action | Public | Member | Owner | Moderator | Admin |
|---|---|---|---|---|---|
| Lire sujets/commentaires | ❌ | ✅ | ✅ | ✅ | ✅ |
| Créer un sujet | ❌ | ✅ | — | ✅ | ✅ |
| Créer type `announcement` | ❌ | ❌ | ❌ | ✅ | ✅ |
| Modifier son sujet/commentaire (< 1h) | ❌ | ✅ | ✅ | ✅ | ✅ |
| Fermer son sujet | ❌ | ❌ | ✅ | ✅ | ✅ |
| Supprimer sujet (sans commentaires) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Archiver sujet (avec commentaires) | ❌ | ❌ | ✅ | ✅ | ✅ |
| Masquer (`hidden`) sujet/commentaire | ❌ | ❌ | ❌ | ✅ | ✅ |
| Épingler un sujet | ❌ | ❌ | ❌ | ✅ | ✅ |
| Épingler un commentaire | ❌ | ❌ | ❌ (owner sujet ✅) | ✅ | ✅ |
| Liker un commentaire | ❌ | ✅ | ✅ | ✅ | ✅ |
| Voir les sujets/commentaires `hidden` | ❌ | ❌ | ❌ | ✅ (picto) | ✅ (picto) |
| Voir les archives | ❌ | ✅ | ✅ | ✅ | ✅ |
| Voir onglet Biffé | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## Structure DB

### `forum_subject`
```
id               INT UNSIGNED    PK AUTO_INCREMENT
user_id          INT UNSIGNED    FK users.id
type             ENUM('question','share','request','bug','announcement')
title            VARCHAR(255)
content          TEXT
status           ENUM('open','closed','archived','hidden')   DEFAULT 'open'
is_pinned        BOOLEAN                                     DEFAULT false
expires_at       DATETIME NULL
created_at       DATETIME
updated_at       DATETIME NULL
```

### `forum_comment`
```
id                 INT UNSIGNED    PK AUTO_INCREMENT
forum_subject_id   INT UNSIGNED    FK forum_subject.id   -- toujours renseigné
forum_comment_id   INT UNSIGNED NULL  FK forum_comment.id -- NULL = niveau 0
user_id            INT UNSIGNED    FK users.id
display_name       VARCHAR(100)    -- snapshot au moment de la publication
addressed_to       VARCHAR(100) NULL -- display_name du destinataire si réponse
content            TEXT
status             ENUM('visible','hidden')   DEFAULT 'visible'
is_pinned          BOOLEAN                    DEFAULT false
likes              JSON                       DEFAULT '[]'
created_at         DATETIME
updated_at         DATETIME NULL
```

### Ajout dans `users`
```
forum_last_read_date   DATETIME NULL   -- dernière date consultée dans l'onglet Suivi
```
