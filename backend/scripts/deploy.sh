#!/bin/bash

echo "🚀 Démarrage du script de déploiement..."

# Fonction pour attendre la base de données
wait_for_db() {
    echo "⏳ Attente de la base de données..."
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        echo "Tentative $attempt/$max_attempts de connexion à la base de données..."
        
        if npx prisma db push --accept-data-loss --skip-generate 2>/dev/null; then
            echo "✅ Base de données accessible !"
            return 0
        fi
        
        echo "❌ Connexion échouée, attente de 10 secondes..."
        sleep 10
        ((attempt++))
    done
    
    echo "⚠️ Impossible de se connecter à la base de données après $max_attempts tentatives"
    echo "🔄 Tentative avec génération Prisma..."
    
    # Dernière tentative avec génération complète
    npx prisma generate
    npx prisma db push --accept-data-loss --skip-generate
    
    return $?
}

# Génération du client Prisma
echo "📦 Génération du client Prisma..."
npx prisma generate

# Attendre et configurer la base de données
wait_for_db

echo "✅ Déploiement terminé !" 