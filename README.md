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
- **ORM/Database** : Prisma (PostgreSQL)
- **Authentification** : JWT + bcrypt (salt 12)
- **Middleware** : Authentification, CORS, validation
- **API** : Architecture REST avec endpoints structurés
- **Cache** : Système de cache intelligent avec expiration automatique

### **Architecture Base de Données**

#### **🐘 PostgreSQL (via Prisma ORM)**
**Rôle** : Base de données relationnelle principale pour toutes les données

**Tables gérées :**
- **Users** : Profils utilisateurs, authentification, avatars photos
- **Races** : Événements de courses multijoueurs
- **Participants** : Participants aux courses avec statuts
- **Messages** : Système de chat en temps réel pour les courses

**Avantages utilisés :**
- **Intégrité référentielle** avec contraintes FK
- **Transactions ACID** pour les opérations critiques
- **Index optimisés** pour les requêtes de performance
- **Schéma strict** via Prisma pour la robustesse

#### **🌐 Intégration API Speedrun.com**
**Rôle** : Source externe de données speedrun avec cache intelligent

**Données intégrées :**
- **Jeux populaires** : Catalogue depuis speedrun.com
- **Leaderboards** : Classements officiels en temps réel
- **Runs récents** : Dernières soumissions vérifiées
- **Catégories** : Métadonnées des jeux et leurs catégories

**Système de cache :**
- **Cache automatique** : Expiration configurable (30min - 2h)
- **Refresh en arrière-plan** : Mise à jour transparente
- **Fallback intelligent** : Données en cache si API indisponible
- **Optimisation performance** : Réduction drastique des appels API

### **🚀 Fonctionnalités Principales**

#### **Authentification & Profils**
- **Système complet** d'inscription/connexion avec JWT
- **OAuth Google** pour connexion simplifiée
- **Profils utilisateur** avec upload d'avatars photos
- **Sécurisation** complète avec middleware d'authentification

#### **Courses Multijoueurs en Temps Réel**
- **Création d'événements** de courses personnalisées
- **Participation** et gestion des statuts en temps réel
- **Chat intégré** pour communication entre participants
- **Dashboard admin** pour supervision et nettoyage automatique

#### **Intégration Speedrun.com**
- **Catalogue de jeux** avec recherche avancée
- **Leaderboards officiels** en temps réel
- **Activité récente** : derniers runs et jeux actifs
- **Cache intelligent** pour performances optimales

#### **Administration & Maintenance**
- **Dashboard admin** avec statistiques utilisateurs
- **Gestion des courses** et nettoyage automatique
- **Monitoring** des performances et état système

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
- ✅ **Modélisation PostgreSQL** avec 4 entités principales
- ✅ **Relations complexes** : One-to-Many, Many-to-Many
- ✅ **Contraintes d'intégrité** et index optimisés
- ✅ **Migrations Prisma** pour évolution du schéma

#### **2.2 Développer des composants d'accès aux données**
- ✅ **ORM Prisma** pour PostgreSQL (relationnelle)
- ✅ **Requêtes optimisées** avec jointures et agrégations
- ✅ **Cache stratégique** pour performances
- ✅ **Intégration API externe** avec cache intelligent

#### **2.3 Développer des composants métier côté serveur**
- ✅ **API REST complète** : 20+ endpoints structurés
- ✅ **Architecture MVC** : Routes, Controllers, Services
- ✅ **Logique métier** : Gestion courses, validation runs
- ✅ **Intégration API externe** : speedrun.com avec cache

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
- Intégration base de données PostgreSQL/Prisma
- Rate limiting et sécurisation CORS
- API externe speedrun.com avec cache intelligent
```

### **Base de Données (PostgreSQL)**
```sql
-- Modélisation relationnelle optimisée
Users -> Races (One-to-Many)
Races -> Participants (One-to-Many)  
Races -> Messages (One-to-Many)
Users -> Messages (One-to-Many)

-- Index et performances optimisés
```

---

## 🔐 Sécurité Implémentée
- **Authentification JWT** avec expiration et refresh automatique
- **Hashage bcrypt** des mots de passe (salt: 12)
- **CORS configuré** pour origines autorisées seulement
- **Validation stricte** des entrées utilisateur côté client et serveur
- **Protection contre** les injections SQL via Prisma ORM
- **Middleware d'authentification** sur toutes les routes protégées
- **Accès admin** sécurisé avec tokens spécialisés
- **Gestion d'erreurs** sécurisée sans exposition de données sensibles

## ⚡ Performance & Optimisation
- **Cache intelligent** avec expiration automatique (30min - 2h)
- **Système de fallback** pour haute disponibilité
- **Optimisation des requêtes** via Prisma et index PostgreSQL
- **Compression des images** pour avatars utilisateur
- **Nettoyage automatique** des données temporaires
- **Monitoring** intégré des performances API

---

**Développeur** : Devco01  
**Formation** : Titre Professionnel DWWM  
**Année** : 2025
