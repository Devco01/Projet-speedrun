# 🏃‍♂️ Plateforme de Speedruns - Projet TP DWWM

## 📋 Présentation du Projet

**Application web complète** développée pour l'épreuve du Titre Professionnel Développeur Web et Web Mobile (DWWM). Cette plateforme dédiée à la communauté speedrun démontre la maîtrise des compétences requises par le référentiel REAC.

### 🎯 Objectifs Pédagogiques
- **Front-end sécurisé** : Interfaces utilisateur dynamiques et responsives
- **Back-end robuste** : API REST complète avec authentification 
- **Base de données** : Modélisation relationnelle complexe
- **Sécurité** : Authentification JWT, validation des données, protection CORS

---

## 🏗️ Architecture Technique Complète

### **Stack Frontend (Next.js 14)**
- **Framework** : Next.js 14 avec App Router
- **Langage** : TypeScript pour la robustesse
- **Styles** : TailwindCSS pour un design moderne
- **State Management** : Context API React
- **Authentification** : JWT avec localStorage sécurisé
- **Validation** : Validation côté client et serveur

### **Stack Backend (Node.js/Express)**
- **Runtime** : Node.js 18+
- **Framework** : Express.js avec TypeScript
- **ORM/Database** : Prisma (PostgreSQL) + Mongoose (MongoDB)
- **Authentification** : JWT + bcrypt (salt 12)
- **Middleware** : Authentification, CORS, validation
- **API** : Architecture REST avec endpoints structurés

### **Bases de Données**
- **PostgreSQL** : Données relationnelles principales
  - Users, Games, Runs, Events, Categories
  - Contraintes relationnelles complexes
  - Index optimisés pour les performances
- **MongoDB** : Analytics et cache API externe
  - Données non-relationnelles
  - Stockage des analytics temps réel

### **Sécurité Implémentée**
- **Authentification JWT** avec expiration
- **Hashage bcrypt** des mots de passe (salt: 12)
- **CORS configuré** pour origines autorisées
- **Validation stricte** des entrées utilisateur
- **Protection contre** les injections SQL via Prisma
- **Gestion d'erreurs** sécurisée sans exposition

---

## 🎮 Compétences DWWM Démontrées

### **🎨 ACTIVITÉ TYPE 1 : Front-end Sécurisé**

#### **1.1 Maquetter des interfaces utilisateur web**
- ✅ **Wireframes** et prototypes des principales pages
- ✅ **Design responsive** adaptatif mobile/tablette/desktop
- ✅ **UI/UX moderne** avec TailwindCSS
- ✅ **Composants réutilisables** architecturés

#### **1.2 Réaliser des interfaces utilisateur statiques**
- ✅ **15+ pages complètes** : Accueil, Catalogue, Profils, Admin
- ✅ **20+ composants** : Header, Cards, Forms, Modals
- ✅ **Navigation cohérente** avec routage Next.js
- ✅ **Accessibilité** et standards web respectés

#### **1.3 Développer la partie dynamique des interfaces**
- ✅ **État dynamique** avec React Hooks et Context API
- ✅ **Interactions utilisateur** : Filtres, recherche, pagination
- ✅ **Gestion des formulaires** avec validation temps réel
- ✅ **Authentification front-end** avec gestion des sessions

### **🔧 ACTIVITÉ TYPE 2 : Back-end Sécurisé**

#### **2.1 Mettre en place une base de données relationnelle**
- ✅ **Modélisation PostgreSQL** avec 6 entités principales
- ✅ **Relations complexes** : One-to-Many, Many-to-Many
- ✅ **Contraintes d'intégrité** et index optimisés
- ✅ **Migrations Prisma** pour évolution du schéma

#### **2.2 Développer des composants d'accès aux données**
- ✅ **ORM Prisma** pour PostgreSQL (relationnelle)
- ✅ **ODM Mongoose** pour MongoDB (NoSQL)
- ✅ **Requêtes optimisées** avec jointures et agrégations
- ✅ **Cache stratégique** pour performances

#### **2.3 Développer des composants métier côté serveur**
- ✅ **API REST complète** : 25+ endpoints structurés
- ✅ **Architecture MVC** : Routes, Controllers, Services
- ✅ **Logique métier** : Validation runs, calcul rankings
- ✅ **Intégration API externe** : speedrun.com

---

## 📊 Fonctionnalités Techniques Avancées

### **Frontend (React/Next.js)**
```typescript
// Démonstration compétences front-end
- Pages SSR/SSG optimisées pour le SEO
- Composants TypeScript typés strictement  
- État global avec Context API
- Formulaires avec validation dynamique
- Upload d'images avec prévisualisation
- Filtres temps réel avec debouncing
- Navigation protégée par authentification
```

### **Backend (Express/Node.js)**
```typescript
// Démonstration compétences back-end
- Architecture RESTful avec codes de statut HTTP
- Middleware d'authentification JWT personnalisé
- Validation des schémas avec TypeScript
- Gestion d'erreurs globale et logging
- Intégration base de données hybride (SQL/NoSQL)
- Rate limiting et sécurisation CORS
- API externe speedrun.com avec cache
```

### **Base de Données (PostgreSQL + MongoDB)**
```sql
-- Modélisation relationnelle complexe
Users -> Runs (One-to-Many)
Games -> Categories (One-to-Many)  
Events -> Participants (Many-to-Many)
Runs -> Verifications (One-to-One)

-- Index et performances optimisés
```

---

## 🔒 Sécurité et Bonnes Pratiques

### **Authentification Robuste**
- JWT avec expiration configurable
- Refresh tokens pour sessions longues
- Hashage bcrypt avec salt élevé (12)
- Validation stricte des mots de passe

### **Protection des Données**
- Validation des entrées côté client ET serveur
- Sanitisation des données utilisateur
- Protection CORS configurée finement
- Gestion sécurisée des erreurs

### **Performance et Scalabilité**
- Cache MongoDB pour données externes
- Index PostgreSQL optimisés
- Lazy loading des composants React
- Pagination côté serveur


**Développeur** : Devco01
**Formation** : Titre Professionnel DWWM  
**Année** : 2024

---
