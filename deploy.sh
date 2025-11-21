#!/bin/bash

# Script de déploiement automatique pour broadcast
# Usage: ./deploy.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement de Broadcast en production..."

# Couleurs pour les messages
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Répertoire du projet
PROJECT_DIR="/var/www/e2o/broadcast/broadcast-app"

# 1. Récupérer les derniers changements
echo -e "${YELLOW}📥 Récupération des derniers changements...${NC}"
cd /var/www/e2o/broadcast
git pull origin main

# 2. Aller dans broadcast-app
cd $PROJECT_DIR

# 3. Installer les dépendances
echo -e "${YELLOW}📦 Installation des dépendances...${NC}"
npm install

# 4. Builder l'application
echo -e "${YELLOW}🔨 Build de l'application Next.js...${NC}"
npm run build

# 5. Redémarrer PM2
echo -e "${YELLOW}🔄 Redémarrage de PM2...${NC}"
pm2 reload ecosystem.config.js

# 6. Vérifier le statut
echo -e "${YELLOW}✅ Vérification du statut...${NC}"
pm2 status

echo -e "${GREEN}✨ Déploiement terminé avec succès !${NC}"
echo -e "${GREEN}📊 Logs disponibles avec: pm2 logs broadcast${NC}"
