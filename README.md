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

### **Architecture Hybride de Bases de Données**

#### **🐘 PostgreSQL (via Prisma ORM)**
**Rôle** : Base de données relationnelle principale pour les données critiques

**Collections gérées :**
- **Users** : Profils utilisateurs, authentification, avatars
- **Games** : Catalogue des jeux speedrun avec métadonnées
- **Runs** : Submissions de speedruns avec validation
- **Categories** : Catégories de speedrun par jeu
- **Events** : Événements et compétitions programmés
- **Comments** : Système de commentaires sur les runs

**Avantages utilisés :**
- **Intégrité référentielle** avec contraintes FK
- **Transactions ACID** pour les opérations critiques
- **Index optimisés** pour les requêtes de performance
- **Schéma strict** via Prisma pour la robustesse

#### **🍃 MongoDB (via Mongoose ODM)**
**Rôle** : Base NoSQL pour analytics avancées et données flexibles

**Collections gérées :**
- **Analytics** : Métriques temps réel de la plateforme
  - Activité quotidienne (nouveaux users, runs, records)
  - Statistiques de croissance hebdomadaire
  - Top performers avec agrégations complexes
  - Popularité des jeux avec runners uniques
- **Activity Feed** : Journal d'activité en temps réel
  - Actions utilisateurs tracées (runs soumis, vérifiés)
  - Feed social pour dashboard admin
  - Historique détaillé avec contexte
- **Custom Avatars** : Système d'avatars personnalisables
  - Données flexibles (couleurs, styles, accessoires)
  - Presets favoris par utilisateur
  - Statistiques d'usage des styles populaires
- **API Cache** : Cache intelligent des données externes
  - Cache TTL pour API speedrun.com
  - Optimisation des performances
  - Réduction des appels API tiers

**Avantages utilisés :**
- **Aggregation Pipeline** pour analytics complexes
- **Schéma flexible** pour données évolutives
- **Performance** sur gros volumes de logs
- **TTL automatique** pour expiration cache

### **🚀 Fonctionnalités Exploitant l'Architecture Hybride**

#### **Analytics Avancées (MongoDB + PostgreSQL)**
- **Dashboard admin** avec métriques temps réel
- **Croissance de plateforme** calculée via agrégations MongoDB
- **Top performers** combinant données Prisma et analytics Mongo
- **Activity feed** en temps réel pour traçabilité complète
- **Contrôles temporels** (7, 30, 90 jours) avec performances optimisées

#### **Système d'Avatars Hybride**
- **Avatars photos** stockés en base64 dans PostgreSQL
- **Avatars personnalisables** avec données flexibles dans MongoDB
- **Statistiques d'usage** des styles via aggregation pipeline
- **Fallback intelligent** entre les deux systèmes

#### **Cache et Performance**
- **Cache API speedrun.com** dans MongoDB avec TTL
- **Données relationnelles** optimisées dans PostgreSQL
- **Requêtes complexes** distribuées entre les deux bases
- **Failover gracieux** en cas d'indisponibilité d'une base

### **🔐 Sécurité Implémentée**
- **Authentification JWT** avec expiration
- **Hashage bcrypt** des mots de passe (salt: 12)
- **CORS configuré** pour origines autorisées
- **Validation stricte** des entrées utilisateur
- **Protection contre** les injections SQL via Prisma
- **Protection NoSQL** via Mongoose et validation schéma
- **Accès admin** sécurisé pour analytics sensibles
- **Gestion d'erreurs** sécurisée sans exposition


**Développeur** : Devco01  
**Formation** : Titre Professionnel DWWM  
**Année** : 2024

---