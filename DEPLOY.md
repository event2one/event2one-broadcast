# Guide de Déploiement Production

Ce guide explique comment déployer l'application Broadcast (API + Next.js) sur votre serveur de production, en gérant les versions de Node.js et les ports spécifiques.

## Prérequis

- Accès SSH au serveur.
- **NVM (Node Version Manager)** installé pour gérer plusieurs versions de Node.js.

## 1. Préparation du serveur et transfert des fichiers

### Où placer le projet ?
Il est recommandé de placer votre projet dans `/var/www/broadcast` ou dans votre dossier utilisateur `/home/votre-user/broadcast`.

### Comment transférer les fichiers ?
Vous ne devez pas copier uniquement le dossier "build". Vous devez transférer l'ensemble du code source.

**Option A : Via Git (Recommandé)**
Si votre projet est sur GitHub/GitLab :
```bash
cd /var/www
git clone https://github.com/event2one/event2one-broadcast.git broadcast
cd broadcast
```

**Option B : Via FTP / SCP**
Copiez tout le dossier du projet **SAUF** `node_modules` et `.next`.
Ces dossiers seront recréés sur le serveur lors de l'installation et du build.

---

## 2. Gestion des versions Node.js (Si vous avez besoin de Node 20+)

Si votre serveur utilise par défaut Node 16 mais que cette application nécessite une version plus récente (ex: Node 20 pour Next.js 15), utilisez NVM.

### Installer NVM (si pas déjà fait)
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc
```

### Installer et utiliser Node 20
```bash
nvm install 20
nvm use 20
```

Vérifiez la version :
```bash
node -v
# Devrait afficher v20.x.x
```

## 2. Installation de PM2

Installez PM2 globalement **avec la version de Node que vous venez d'activer** (Node 20).

```bash
npm install -g pm2
```

## 3. Préparation de l'application

### Backend (API)
```bash
# À la racine du projet
npm install
```

### Frontend (Next.js)
```bash
cd broadcast-app
npm install
npm run build
cd ..
```

## 4. Démarrage des services

Nous avons configuré `ecosystem.config.js` pour utiliser :
- **API** : Port **3001**
- **Frontend** : Port **3002**

Lancez les applications avec PM2 :

```bash
pm2 start ecosystem.config.js
```

**Note importante :** PM2 utilisera la version de Node avec laquelle il a été lancé. Assurez-vous d'être sur Node 20 (`nvm use 20`) avant de lancer `pm2 start`.

Pour sauvegarder la liste des processus au redémarrage du serveur :
```bash
pm2 save
pm2 startup
```

## 5. Configuration Nginx

Configurez Nginx pour rediriger le trafic vers les ports 3001 et 3002.

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend (Next.js) -> Port 3002
    location /event/ {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend (API) -> Port 3001
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 6. Commandes utiles

- `pm2 list` : Voir les processus.
- `pm2 logs` : Voir les logs en temps réel.
- `pm2 restart all` : Redémarrer tout.
