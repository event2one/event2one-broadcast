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

> [!IMPORTANT]
> **Authentification GitHub** :
> Depuis 2021, GitHub n'accepte plus les mots de passe pour les opérations Git en HTTPS.
> Lorsque Git vous demande votre mot de passe, vous devez utiliser un **Personal Access Token (PAT)**.
>
> **Comment générer un PAT :**
> 1. Allez sur GitHub > Settings > Developer settings > Personal access tokens > Tokens (classic).
> 2. Cliquez sur "Generate new token (classic)".
> 3. Cochez la case `repo` (pour accéder aux dépôts privés).
> 4. Générez le token et copiez-le.
> 5. Collez ce token à la place du mot de passe dans le terminal.

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

### 5.1 Vérifier l'installation
Vérifiez si Nginx est déjà installé :
```bash
nginx -v
# ou
systemctl status nginx
```

Si ce n'est pas le cas, installez-le :
```bash
sudo apt update
sudo apt install nginx
```

### 5.2 Configuration du site
Une fois installé, créez ou modifiez un fichier de configuration (ex: `/etc/nginx/sites-available/default` ou un nouveau fichier dans `/etc/nginx/sites-available/broadcast`).

Configurez Nginx pour rediriger le trafic vers les ports 3001 et 3002 :

```nginx
server {
    listen 80;
    server_name votre-domaine.com;

    # Frontend (Next.js) -> Port 3002
    # L'application est configurée avec basePath: '/broadcast'
    location /broadcast/ {
        proxy_pass http://localhost:3002/broadcast/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend (API) -> Port 3001
    # Accessible via /broadcast/api/
    location /broadcast/api/ {
        rewrite ^/broadcast/api/(.*) /api/$1 break;
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 6. Alternative : Configuration Apache

Si vous préférez utiliser Apache au lieu de Nginx, c'est tout à fait possible.

### 6.1 Activer les modules nécessaires
Assurez-vous que les modules proxy sont activés :
```bash
a2enmod proxy
a2enmod proxy_http
systemctl restart apache2
```

### 6.2 Configuration du VirtualHost
Créez ou modifiez votre fichier de configuration (ex: `/etc/apache2/sites-available/000-default.conf` ou votre fichier dédié).

```apache
<VirtualHost *:80>
    ServerName votre-domaine.com

    # Frontend (Next.js) -> Port 3002
    ProxyPreserveHost On
    ProxyPass /broadcast/ http://localhost:3002/broadcast/
    ProxyPassReverse /broadcast/ http://localhost:3002/broadcast/

    # Backend (API) -> Port 3001
    # Rediriger /broadcast/api/ vers l'API
    ProxyPass /broadcast/api/ http://localhost:3001/api/
    ProxyPassReverse /broadcast/api/ http://localhost:3001/api/
</VirtualHost>
```

## 7. Commandes utiles

- `pm2 list` : Voir les processus.
- `pm2 logs` : Voir les logs en temps réel.
- `pm2 restart all` : Redémarrer tout.

### 7.2 Commandes système
- `cat fichier` : Afficher tout le contenu d'un fichier.
- `less fichier` : Lire un fichier page par page (tapez `q` pour quitter).
- `tail -f fichier` : Suivre la fin d'un fichier en temps réel (utile pour les logs).
- `nano fichier` : Éditer un fichier (Ctrl+O pour sauver, Ctrl+X pour quitter).
