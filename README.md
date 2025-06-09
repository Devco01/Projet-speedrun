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


**Développeur** : Devco01
**Formation** : Titre Professionnel DWWM  
**Année** : 2024

---