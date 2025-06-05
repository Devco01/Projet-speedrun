# 🏃‍♂️ Plateforme de Speedruns - Projet TP DWWM

## 📋 Présentation du Projet

**Application web complète** pour la communauté speedrun permettant de :
- Cataloguer et rechercher des jeux vidéo
- Soumettre et valider des records de vitesse
- Organiser des événements et marathons

---

## 🏗️ Architecture Technique

### **Stack Frontend**
- **Framework** : Next.js 14 (React 18)
- **Langage** : TypeScript
- **Styles** : TailwindCSS
- **Routage** : App Router Next.js

### **Stack Backend**
- **Runtime** : Node.js
- **Framework** : Express.js
- **Langage** : TypeScript
- **ORM** : Prisma (PostgreSQL)
- **ODM** : Mongoose (MongoDB)
- **Auth** : JWT + bcrypt

### **Bases de Données**
- **PostgreSQL** : Données relationnelles (users, games, runs, events)
- **MongoDB** : Analytics et cache API

---

### **Accès à l'application**
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:5000
- **Administration** : http://localhost:3000/admin/login

---


## 🎮 Fonctionnalités Développées

### **Frontend (Utilisateurs)**
- ✅ **Page d'accueil** : Derniers records et événements
- ✅ **Catalogue de jeux** : Filtres avancés (genre, plateforme)
- ✅ **Pages détail** : Informations complètes des jeux
- ✅ **Événements** : Calendrier des marathons
- ✅ **Classements** : Leaderboards par jeu/catégorie
- ✅ **Profils utilisateurs** : Gestion des comptes
- ✅ **Authentification** : Login/Register sécurisé

### **Backend (API)**
- ✅ **Authentification JWT** : Sécurisation des routes
- ✅ **CRUD Complet** : Users, Games, Runs, Events
- ✅ **Validation** : Middleware de sécurisation
- ✅ **Base de données** : Modèles relationnels complexes
- ✅ **API REST** : Endpoints structurés

### **Administration**
- ✅ **Dashboard** : Statistiques temps réel
- ✅ **Gestion utilisateurs** : CRUD complet
- ✅ **Modération runs** : Validation/rejet
- ✅ **Gestion événements** : Interface complète
- ✅ **Analytics** : Rapports d'utilisation


---

## 📈 Métriques du Projet

### **Code Produit**
- **15+ Pages** : Frontend complet et responsive
- **20+ Composants** : Architecture modulaire
- **25+ Endpoints** : API REST complète
- **6 Modèles** : Base de données relationnelle

### **Technologies Maîtrisées**
- **Frontend** : Next.js, React, TypeScript, TailwindCSS
- **Backend** : Node.js, Express, Prisma, MongoDB
- **Sécurité** : JWT, bcrypt, validation middleware
- **DevOps** : npm, Git, scripts automation


---
