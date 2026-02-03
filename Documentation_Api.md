# Documentation API - Projet Fil Rouge

Ce document sert de référence pour l'intégration Frontend. Il détaille le fonctionnement de l'API, l'authentification sécurisée et les commandes utiles.
*Ce document est vivant et doit être mis à jour à chaque évolution majeure de l'API.*

---

## 🚀 Accès Rapides

| Service | URL / Commande |
| :--- | :--- |
| **Base URL** | `http://localhost:8080/api/v1` |
| **Swagger UI** (Doc interactive) | [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html) |
| **Lancer TOUT (BDD + API)** | `docker-compose up --build -d` |
| **Lancer l'API (Dev mode)** | `./mvnw spring-boot:run` |

---


## 🚦 Rate Limiting (Protection)

Pour protéger l'API contre les abus, un système de limitation de requêtes est en place par IP :

| Endpoint | Limite | Conséquence |
| :--- | :--- | :--- |
| **Login / Register** | **10 requêtes / minute** | Protection Brute Force sévère. |
| **API Globale** (`/api/v1/*`) | **30 requêtes / minute** | Prévention du spam / surcharge. |

En cas de dépassement, l'API renvoie :
*   **Satus** : `429 Too Many Requests`
*   **JSON** : `{"message": "Trop de requêtes. Veuillez ralentir."}`

---

## 🔐 Authentification & Sécurité

L'API utilise un système **Stateless** basé sur **JWT (Access Token)** et **Refresh Token** (avec rotation).

### 1. Concepts Clés
*   **Access Token (JWT)** : Durée de vie courte (ex: 15 min). Sert à authentifier les requêtes courantes. Doit être envoyé dans le header `Authorization: Bearer <token>`.
*   **Refresh Token** : Durée de vie longue (ex: 7 jours). Stocké en base de données. Sert **uniquement** à demander un nouveau JWT quand celui-ci est expiré.
*   **Rotation** : À chaque utilisation d'un Refresh Token, celui-ci est **détruit** et remplacé par un nouveau.

### 2. Workflow d'Intégration Frontend (Hybride : Best Practice)
Cette stratégie **hybride** combine la sécurité des cookies et la flexibilité du JWT standard.

#### A. Connexion (Login / Register)
*   **Endpoint** : `POST /auth/login` ou `POST /auth/register`
*   **Réponse** :
    *   **Body (JSON)** : Contient l'utilisateur ET l'**Access Token**.
        ```json
        {
          "user": { "id": "...", "email": "..." },
          "token": "eyJhbGciOiJIUzI1Ni..." 
        }
        ```
    *   **Headers (Set-Cookie)** : L'API envoie **un seul** cookie sécurisé (HttpOnly) :
        *   `refreshToken` : Contient le token de rafraîchissement (durée longue : 7 jours).
*   **Action Front** :
    *   Stocker le `token` (Access Token) en **mémoire** (Variable React State, Context, ou Service Angular). **NE PAS le mettre dans le localStorage**.
    *   Le cookie `refreshToken` est géré automatiquement par le navigateur.

#### B. Requêtes Authentifiées
Pour appeler l'API, vous devez ajouter l'Access Token dans le header `Authorization` :
`Authorization: Bearer <votre_token_en_memoire>`

#### C. Gestion de l'Expiration (Intercepteur 401)
Si une requête renvoie `401 Unauthorized` (Token expiré), le frontend doit :
1.  Intercepter l'erreur.
2.  Appeler `POST /auth/refresh-token` (sans body). Le cookie `refreshToken` est envoyé automatiquement par le navigateur.
3.  **Réponse** :
    *   **Body** : `{ "accessToken": "NOUVEAU_TOKEN_JWT" }`.
    *   **Header** : Le cookie `refreshToken` est renouvelé (rotation).
4.  Mettre à jour la variable en mémoire avec le nouveau token.
5.  Rejouer la requête initiale avec le nouveau token.

#### D. Déconnexion (Logout)
*   **Endpoint** : `POST /auth/logout` (sans body).
*   **Action** :
    *   L'API supprime le cookie `refreshToken`.
    *   Le Front doit supprimer l'Access Token de sa mémoire.

---

## 📡 Liste des Endpoints (Résumé)

*Voir le Swagger pour les détails des payloads et réponses.*

### Authentification (`/auth`)
*   `POST /register` : Créer un compte.
*   `POST /login` : Se connecter.
*   `POST /refresh-token` : Obtenir un nouveau JWT (Rotation).
*   `POST /logout` : Révoquer la session.

### Utilisateurs (`/users`)
*   `GET /me` : Profil de l'utilisateur connecté.
*   `PUT /{id}` : Mettre à jour un utilisateur.
*   `DELETE /{id}` : Supprimer un compte.
*   `GET /` : Liste des utilisateurs (Admin seulement).

---

## ⚠️ Gestion des Erreurs

En cas d'erreur (400, 401, 404, etc.), l'API renvoie toujours un format standard :

```json
{
  "timestamp": "2026-02-03T12:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Description précise de l'erreur (ex: Email déjà utilisé)",
  "path": "/api/v1/auth/register"
}
```

Pour les erreurs de validation de formulaire (400), un champ `errors` supplémentaire liste les champs invalides :
```json
{
  ...
  "errors": {
    "email": "Doit être un email valide",
    "password": "Doit contenir au moins 8 caractères"
  }
}
```
