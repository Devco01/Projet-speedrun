# 🏃‍♂️ Plateforme de Speedruns

Une plateforme complète pour gérer, partager et suivre les speedruns de jeux vidéo, développée dans le cadre de l'examen du Titre Professionnel Développeur Web et Web Mobile.

## 🚀 Architecture du Projet

Ce projet est construit avec une architecture moderne en full-stack TypeScript :

### Frontend
- **Next.js 14** avec App Router pour l'interface utilisateur
- **TypeScript** pour un développement typé et sécurisé
- **TailwindCSS** pour un design moderne et responsive
- **React Query** pour la gestion des états et des requêtes API

### Backend
- **Node.js** avec **Express** pour l'API REST
- **TypeScript** pour un backend typé
- **Prisma** comme ORM pour PostgreSQL
- **Mongoose** pour la gestion des données MongoDB
- **JWT** pour l'authentification
- **bcrypt** pour le hachage des mots de passe

### Bases de données
- **PostgreSQL** pour les données relationnelles (utilisateurs, jeux, runs, commentaires)
- **MongoDB** pour les données analytiques (statistiques, activité)

## ✨ Fonctionnalités

### 👥 Gestion des utilisateurs
- ✅ Inscription et connexion sécurisée
- ✅ Profils utilisateurs avec statistiques personnelles
- ✅ Authentification JWT avec middleware de sécurité

### 🎮 Catalogue de jeux
- ✅ Liste complète des jeux avec système de filtrage avancé
- ✅ Recherche par titre, genre, plateforme
- ✅ Fiches détaillées pour chaque jeu

### ⏱️ Gestion des speedruns
- ✅ Classements dynamiques par jeu et catégorie
- ✅ Intégration vidéo (YouTube/Twitch)
- ✅ Système de commentaires

### 📊 Statistiques et activité
- ✅ Feed d'activité en temps réel
- ✅ Statistiques globales de la plateforme
- ✅ Suivi des records récents
- ✅ Jeux populaires et tendances

## 🛠️ Installation et Configuration

### Prérequis
- **Node.js** v18 ou supérieur
- **PostgreSQL** v13 ou supérieur
- **MongoDB** v5 ou supérieur
- **npm** ou **yarn**

### 1. Cloner le projet
```bash
git clone https://github.com/Devco01/Projet-speedrun.git
cd Projet-speedrun
```

### 2. Installation des dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env` dans le dossier `backend` :
```env
# Base de données PostgreSQL
DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/speedrun_db"

# Base de données MongoDB
MONGODB_URI="mongodb://localhost:27017/speedrun_db"

# JWT Secret (générer une clé forte)
JWT_SECRET="votre_cle_secrete_jwt_tres_longue_et_complexe"

# Port du serveur
PORT=5000
```

### 4. Configuration de la base de données

#### PostgreSQL avec Prisma
```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

#### MongoDB (optionnel - sera créé automatiquement)
La base MongoDB sera initialisée automatiquement au premier démarrage.

### 5. Démarrage du projet

#### Mode développement
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

#### Mode production
```bash
# Backend
cd backend
npm run build
npm start

# Frontend
cd frontend
npm run build
npm start
```

## 🌐 URLs et Endpoints

### Frontend
- **Interface utilisateur** : http://localhost:3000
- **Catalogue de jeux** : http://localhost:3000/games
- **Soumission de record** : http://localhost:3000/runs/submit

### Backend API
- **Base URL** : http://localhost:5000/api
- **Documentation** : Endpoints RESTful suivant les standards

#### Endpoints principaux
```
# Authentification
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

# Jeux
GET    /api/games
GET    /api/games/:id
GET    /api/games/:id/categories
GET    /api/games/:id/leaderboard

# Runs
GET    /api/runs
POST   /api/runs
GET    /api/runs/:id
POST   /api/runs/:id/verify
POST   /api/runs/:id/comments
DELETE /api/runs/:id
```

## 📁 Structure du Projet

```
speedrun-platform/
├── frontend/                 # Application Next.js
│   ├── public/              # Fichiers statiques
│   └── src/
│       ├── app/             # Pages (App Router)
│       ├── components/      # Composants réutilisables
│       └── types/           # Types TypeScript
│
├── backend/                 # API Express
│   ├── prisma/             # Schémas et migrations Prisma
│   └── src/
│       ├── controllers/    # Contrôleurs de l'API
│       ├── middleware/     # Middlewares Express
│       ├── models/         # Modèles MongoDB
│       ├── routes/         # Routes de l'API
│       ├── services/       # Logique métier
│       └── index.ts        # Point d'entrée
│
├── package.json            # Configuration du workspace
└── README.md              # Documentation
```

## 🔐 Sécurité

- ✅ **Authentification JWT** avec expiration
- ✅ **Hachage bcrypt** pour les mots de passe
- ✅ **Validation** des données d'entrée
- ✅ **Middleware de protection** des routes sensibles
- ✅ **CORS** configuré pour la sécurité
- ✅ **Variables d'environnement** pour les secrets

## 🎯 Fonctionnalités à venir

- [ ] Système de notifications en temps réel
- [ ] Chat en direct pendant les événements
- [ ] API pour applications mobiles
- [ ] Système de badges et achievements
- [ ] Intégration avec les plateformes de streaming

## 👨‍💻 Développement

### Scripts disponibles

#### Backend
```bash
npm run dev        # Développement avec hot-reload
npm run build      # Build de production
npm start         # Démarrage production
npm run prisma:generate  # Génération client Prisma
npm run prisma:migrate   # Migration base de données
```

#### Frontend
```bash
npm run dev        # Développement
npm run build      # Build de production  
npm start         # Démarrage production
npm run lint      # Vérification du code
```

## 📄 Licence

Ce projet est développé dans le cadre d'un examen académique du Titre Professionnel Développeur Web et Web Mobile.

## 👤 Auteur

**Devco01**
- GitHub: [https://github.com/Devco01](https://github.com/Devco01)
- Projet: [https://github.com/Devco01/Projet-speedrun](https://github.com/Devco01/Projet-speedrun)

---
