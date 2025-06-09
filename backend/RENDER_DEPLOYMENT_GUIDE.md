# Guide de Déploiement Render - Résolution Problèmes PostgreSQL

## 🚨 Problème actuel

Le backend échoue lors du déploiement avec l'erreur :
```
Error: P1001
Can't reach database server at `dpg-d13agq3uibrs7380em1g-a.frankfurt-postgres.render.com:5432`
```

## 🔧 Solutions à appliquer

### 1. Variables d'environnement Render

Vérifiez et mettez à jour ces variables dans votre dashboard Render :

**Variables obligatoires :**
```
DATABASE_URL=postgresql://username:password@host:5432/database?connect_timeout=15&pool_timeout=15&statement_timeout=30000
GOOGLE_CLIENT_ID=votre_client_id
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_CALLBACK_URL=https://speedrun-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://projet-speedrun.vercel.app
JWT_SECRET=votre_jwt_secret
NODE_ENV=production
PORT=5000
```

### 2. Configuration DATABASE_URL avec timeouts

Votre DATABASE_URL doit inclure les paramètres de timeout :
```
postgresql://user:pass@host:5432/db?connect_timeout=15&pool_timeout=15&statement_timeout=30000&sslmode=require
```

### 3. Redémarrage de la base de données

1. Aller dans le dashboard Render
2. Sélectionner votre service PostgreSQL
3. Cliquer sur "Restart" 
4. Attendre que le statut passe à "Available"

### 4. Redéploiement du service backend

1. Aller dans le service backend sur Render
2. Cliquer sur "Manual Deploy" > "Deploy latest commit"
3. Ou pousser un nouveau commit pour déclencher un redéploiement automatique

### 5. Vérification des logs

Surveiller les logs pendant le déploiement pour voir :
```
✅ Connexion à la base de données réussie
✅ PostgreSQL connecté avec succès
🚀 SpeedRun Platform API Server
```

## 🔍 Diagnostic

### Test de connectivité

Une fois déployé, testez :
```
curl https://speedrun-backend.onrender.com/health
```

Doit retourner :
```json
{
  "status": "healthy",
  "database": {
    "status": "connected",
    "type": "postgresql"
  }
}
```

### Si le problème persiste

1. **Vérifiez l'état de la base de données :**
   - Dashboard Render > PostgreSQL service
   - Status doit être "Available"

2. **Recréez la DATABASE_URL :**
   - Copiez la nouvelle URL depuis le dashboard PostgreSQL
   - Ajoutez les paramètres de timeout

3. **Contactez le support Render :**
   - Si la base de données reste inaccessible
   - Mentionnez l'erreur P1001 et le service ID

## 📝 Checklist de déploiement

- [ ] Variables d'environnement mises à jour
- [ ] DATABASE_URL avec paramètres de timeout
- [ ] Base de données redémarrée et "Available"
- [ ] Service backend redéployé
- [ ] Logs vérifiés - connexion DB réussie
- [ ] Test endpoint `/health` - database: "connected"
- [ ] Test authentification utilisateur
- [ ] Test sauvegarde avatar

## 🎯 Commandes de dépannage

```bash
# Test local avec URL Render
export DATABASE_URL="postgresql://user:pass@host:5432/db?connect_timeout=15&pool_timeout=15"
npx prisma db push

# Régénération client Prisma
npx prisma generate

# Test connexion
npm run dev
``` 