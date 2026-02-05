# Documentation API - Projet Fil Rouge

Ce document sert de référence pour l'intégration Frontend. Il détaille le fonctionnement de l'API, l'authentification sécurisée et les commandes utiles.
*Ce document est vivant et doit être mis à jour à chaque évolution majeure de l'API.*

---

## 🚀 Accès Rapides

| Service | URL / Commande |
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

En cas de dépassement, l'API renvoie un format standard :
*   **Status** : `429 Too Many Requests`
*   **JSON** : `{"timestamp": "...", "status": 429, "error": "Too Many Requests", "message": "Trop de requêtes..."}`

---

## 🔐 Authentification & Sécurité

L'API utilise un système **Stateless** basé sur **JWT (Access Token)** et **Refresh Token** (avec rotation).

### 1. Concepts Clés
*   **Access Token (JWT)** : Durée de vie courte (15-30 min). Sert à authentifier les requêtes courantes. Doit être envoyé dans le header `Authorization: Bearer <token>`.
*   **Refresh Token** : Durée de vie longue (7 jours). Stocké en base de données. Sert **uniquement** à demander un nouveau JWT quand celui-ci est expiré.
*   **Rotation** : À chaque utilisation d'un Refresh Token, celui-ci est **détruit** et remplacé par un nouveau.

### 2. Workflow d'Intégration Frontend (Hybride : Best Practice)

#### A. Connexion (Login / Register)
*   **Endpoint** : `POST /api/v1/auth/login` ou `POST /api/v1/auth/register`
*   **Réponse** :
    *   **Body (JSON)** : Contient l'utilisateur ET l'**Access Token**.
    *   **Headers (Set-Cookie)** : L'API envoie le `refreshToken` en cookie **HttpOnly** et **Secure**.
*   **Action Front** : Stocker l'Access Token en **mémoire** (React Context / Vuex).

#### B. Requêtes Authentifiées
Header requis : `Authorization: Bearer <token>`

#### C. Gestion de l'Expiration (Intercepteur 401)
1. Intercepter l'erreur 401.
2. Appeler `POST /api/v1/auth/refresh-token` (le cookie est envoyé automatiquement).
3. Mettre à jour l'Access Token avec le nouveau reçu en JSON.

---

## 📡 Liste des Endpoints

### 🔑 Authentification (`/api/v1/auth`)
| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| `POST` | `/register` | Créer un compte client | Public |
| `POST` | `/login` | Se connecter (Tokens) | Public |
| `POST` | `/refresh-token`| Renouveler le JWT | Cookie requis |
| `POST` | `/logout` | Invalider la session | **Authentifié** |

### 👤 Utilisateurs (`/api/v1/users`)
| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| `GET` | `/me` | Profil de l'utilisateur connecté | **Authentifié** |
| `PUT` | `/me` | Modifier son propre profil | **Authentifié** |
| `DELETE` | `/me` | Supprimer son propre compte | **Authentifié** |
| `GET` | `/` | Liste de tous les utilisateurs | **Admin ONLY** |
| `GET` | `/{id}` | Détails d'un utilisateur | **Admin ONLY** |
| `PUT` | `/{id}` | Modifier n'importe quel profil | **Admin ONLY** |
| `DELETE` | `/{id}` | Supprimer un compte spécifique | **Admin ONLY** |
| `DELETE` | `/all` | Purger tous les utilisateurs | **Admin ONLY** |

### ☕ Produits (`/api/v1/products`)
| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Liste paginée des produits | Public |
| `GET` | `/{id}` | Détails d'un produit | Public |
| `POST` | `/` | Ajouter un produit | **Admin ONLY** |
| `PUT` | `/{id}` | Modifier un produit | **Admin ONLY** |
| `DELETE` | `/{id}` | Supprimer un produit | **Admin ONLY** |

### 🛍️ Commandes (`/api/v1/orders`)
| Méthode | Route | Description | Accès |
| :--- | :--- | :--- | :--- |
| `POST` | `/` | Créer une commande | **Authentifié** |
| `GET` | `/my-order` | Historique de mes commandes | **Authentifié** |
| `GET` | `/{id}` | Détails d'une commande | **Propriétaire ou Admin** |
| `GET` | `/` | Liste toutes les commandes | **Admin ONLY** |
| `GET` | `/filter` | Filtrer les commandes par statut | **Admin ONLY** |
| `PATCH`| `/{id}/status` | Changer le statut d'une commande | **Admin ONLY** |

---

## ⚠️ Gestion des Erreurs

Format standard pour toutes les erreurs :
```json
{
  "timestamp": "2026-02-04T15:00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Description de l'erreur",
  "path": "/api/v1/..."
}
```

Pour les erreurs de validation (400), un objet `errors` est ajouté :
```json
{
  "status": 400,
  "message": "Validation échouée",
  "errors": {
    "email": "Format invalide",
    "password": "Trop court"
  }
}
```
