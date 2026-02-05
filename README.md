# ☕ Fika - Restaurant & Coffee Shop API

[![Java Version](https://img.shields.io/badge/Java-21+-orange.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Fika** est un écosystème complet conçu pour la gestion moderne de la fika. Il s'appuie sur une API Backend robuste et scalable pour alimenter deux expériences distinctes :
- 📱 **Interface Client (Mobile)** : Une application fluide permettant de commander en quelques clics.
- 💻 **Dashboard Admin (Desktop)** : Une interface de gestion puissante pour le suivi des commandes et des stocks.

---

## ✨ Fonctionnalités Clés

- **🌐 Écosystème Multi-Plateforme** : API unique connectant une application mobile client et un portail d'administration desktop.
- **🔐 Authentification Hybride** : Système sécurisé via Access Tokens (JWT en JSON) et Refresh Tokens (Rotation via Cookies HttpOnly).
- **☕ Catalogue de Produits** : Gestion complète avec filtrage dynamique (catégorie, prix, disponibilité) et pagination.
- **🛒 Gestion des Commandes** : Workflow client (passage de commande, historique) et interface Admin (suivi des statuts, filtrage).
- **👤 Gestion Utilisateurs** : Profils clients, gestion des droits (Admin/Client), et anonymisation RGPD.
- **🛡️ Sécurisation & Performance** :
    - Rate Limiting (Bucket4j) par IP pour prévenir les abus.
    - Gestion centralisée des exceptions avec messages d'erreur localisés.
    - Documentation interactive Swagger/OpenAPI.

---

## 🛠️ Stack Technique

- **Framework** : Spring Boot 4.0.2
- **Langage** : Java 21+
- **Persistance** : Spring Data JPA / Hibernate 7
- **Base de Données** : PostgreSQL 17
- **Sécurité** : Spring Security & JWT
- **DevOps** : Docker & Docker Compose
- **Documentation** : OpenAPI 3 (Swagger UI)

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Java 21](https://adoptium.net/temurin/releases/?version=21) ou supérieur
- [Maven](https://maven.apache.org/download.cgi) (optionnel si vous utilisez `./mvnw`)

---

## 🚀 Installation & Lancement

### 1. Cloner le projet
```bash
git clone https://github.com/Esabrina77/sabrina_marin_filrouge.git
cd api
```

### 2. Lancement Rapide (Docker Compose)
Cette commande lance l'API et la base de données PostgreSQL simultanément.
```bash
docker-compose up --build -d
```
L'API sera accessible sur : `http://localhost:8080`

### 3. Lancement en mode Développement (Local)
Si vous préférez lancer la base de données via Docker mais l'API via votre IDE/Ligne de commande :
```bash
# Lancer uniquement la BDD
docker-compose up -d db

# Lancer l'API
cd api
./mvnw spring-boot:run
```

---

## 📖 Documentation & API

L'API est entièrement documentée via Swagger. Une fois lancée, accédez à :
👉 [http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)

Pour plus de détails sur l'intégration Frontend et les endpoints, consultez le fichier :
📄 **[Documentation_Api.md](./Documentation_Api.md)**

---

## 🧪 Tests

Pour garantir la stabilité du projet, une suite complète de tests est disponible :
```bash
cd api
mvn test
```

---

## 🏗️ Structure du Projet

```text
├── api/                   # Code source Spring Boot
│   ├── src/main/java/     # Logique métier (Features, Core)
│   ├── src/test/java/     # Tests unitaires et d'intégration
├── docker-compose.yml     # Orchestration des services
├── Documentation_Api.md   # Spécifications pour le Frontend
└── .env                   # Variables d'environnement (Exemple)
```

---
*Développé avec passion pour le projet Fil Rouge.*
