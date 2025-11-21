# Guide de Déploiement en Production

## 📋 Prérequis

Avant de déployer, assurez-vous que :
- ✅ Le code est poussé sur GitHub (commit `7b086c5`)
- ✅ Vous avez accès SSH au serveur : `ssh webapps@www-event2one-com`
- ✅ PM2 est installé sur le serveur
- ✅ Apache est configuré

---

## 🚀 Étape 1 : Déploiement Automatique via GitHub Actions

Le workflow GitHub Actions devrait se déclencher automatiquement. Pour vérifier :

1. **Aller sur GitHub** : https://github.com/event2one/event2one-broadcast/actions
2. **Vérifier le workflow** "Deploy to Production"
3. **Attendre la fin** (environ 2-3 minutes)

Si le workflow échoue, passez au déploiement manuel ci-dessous.

---

## 🔧 Étape 2 : Déploiement Manuel (si nécessaire)

### Sur le Serveur de Production

```bash
# 1. Se connecter au serveur
ssh webapps@www-event2one-com

# 2. Aller dans le répertoire du projet
cd /var/www/e2o/broadcast

# 3. Récupérer les derniers changements
git pull origin main

# 4. Aller dans broadcast-app
cd broadcast-app

# 5. Créer/vérifier le fichier .env
nano .env
```

### Contenu du fichier `.env` :

```env
# Database Configuration (si utilisé par les API routes)
DB_HOST=localhost
DB_USER=event2one_com_www
DB_PASSWORD=votre_mot_de_passe_mysql
DB_DATABASE=nom_de_votre_base

# Server Configuration
PORT=3001
NODE_ENV=production
```

**Sauvegarder** : `Ctrl+X`, puis `Y`, puis `Entrée`

```bash
# 6. Installer les dépendances
npm install

# 7. Builder l'application Next.js
npm run build

# 8. Arrêter les anciens processus PM2
pm2 delete all

# 9. Démarrer avec PM2
pm2 start ecosystem.config.js

# 10. Sauvegarder la configuration PM2
pm2 save

# 11. Vérifier que tout fonctionne
pm2 status
pm2 logs broadcast --lines 50
```

---

## 🌐 Étape 3 : Configuration Apache

### Modifier le VirtualHost existant de www.event2one.com

Éditez le fichier de configuration Apache existant :

```bash
sudo nano /etc/apache2/sites-available/www.event2one.com.conf
```

Dans le bloc `<VirtualHost *:443>`, **ajoutez** ces lignes :

```apache
# Reverse Proxy pour /broadcast
ProxyPreserveHost On
ProxyPass /broadcast http://localhost:3001/broadcast
ProxyPassReverse /broadcast http://localhost:3001/broadcast

# Support WebSocket pour Socket.IO
RewriteEngine On
RewriteCond %{HTTP:Upgrade} =websocket [NC]
RewriteRule /broadcast/(.*) ws://localhost:3001/broadcast/$1 [P,L]

# Headers de sécurité
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
```

**Exemple de VirtualHost complet :**

```apache
<VirtualHost *:443>
    ServerName www.event2one.com
    DocumentRoot /var/www/html
    
    # Configuration SSL existante
    SSLEngine on
    SSLCertificateFile /etc/letsencrypt/live/www.event2one.com/fullchain.pem
    SSLCertificateKeyFile /etc/letsencrypt/live/www.event2one.com/privkey.pem
    
    # ... autres configurations existantes ...
    
    # ===== AJOUTER ICI =====
    # Reverse Proxy pour /broadcast
    ProxyPreserveHost On
    ProxyPass /broadcast http://localhost:3001/broadcast
    ProxyPassReverse /broadcast http://localhost:3001/broadcast
    
    # Support WebSocket pour Socket.IO
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /broadcast/(.*) ws://localhost:3001/broadcast/$1 [P,L]
    
    # Headers de sécurité
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    # ===== FIN =====
</VirtualHost>
```

### Activer les modules et recharger Apache

```bash
# Activer les modules nécessaires
sudo a2enmod proxy proxy_http proxy_wstunnel rewrite headers

# Vérifier la configuration
sudo apache2ctl configtest

# Recharger Apache
sudo systemctl reload apache2
```

---

## ✅ Étape 4 : Vérification

### 1. Vérifier PM2
```bash
pm2 list
# Devrait afficher "broadcast" avec status "online"

pm2 logs broadcast
# Devrait afficher "> Ready on http://localhost:3001"
```

### 2. Vérifier Apache
```bash
# Vérifier qu'Apache écoute sur 80 et 443
sudo netstat -tlnp | grep apache

# Voir les logs Apache
sudo tail -f /var/log/apache2/broadcast-error.log
```

### 3. Tester dans le Navigateur

**URLs de test :**
- Admin : `https://www.event2one.com/broadcast/event/470/admin/176895`
- Screen : `https://www.event2one.com/broadcast/screen/1`

### 4. Tester Socket.IO
1. Ouvrir la page admin
2. Ouvrir la page screen dans un autre onglet
3. Cliquer sur "Publier" pour un contact
4. Vérifier que le screen se met à jour

---

## 🐛 Dépannage

### Erreur 502 Bad Gateway
```bash
# Vérifier que PM2 tourne
pm2 list

# Redémarrer si nécessaire
pm2 restart broadcast
```

### Socket.IO ne se connecte pas
```bash
# Vérifier les logs du navigateur (Console F12)
# Vérifier que proxy_wstunnel est activé
sudo a2enmod proxy_wstunnel
sudo systemctl reload apache2
```

### Erreur de certificat SSL
```bash
# Vérifier les certificats
sudo certbot certificates

# Renouveler si nécessaire
sudo certbot renew
```

---

## 📊 Monitoring

### Logs en temps réel
```bash
# Logs PM2
pm2 logs broadcast

# Logs Apache
sudo tail -f /var/log/apache2/broadcast-error.log
sudo tail -f /var/log/apache2/broadcast-access.log
```

### Statistiques PM2
```bash
pm2 monit
```

---

## 🔄 Mises à Jour Futures

Pour les prochains déploiements, il suffira de :

```bash
# Sur le serveur
cd /var/www/e2o/broadcast/broadcast-app
git pull origin main
npm install
npm run build
pm2 reload ecosystem.config.js
```

Ou simplement **pusher sur GitHub** et laisser GitHub Actions déployer automatiquement !

---

## 📞 Support

En cas de problème :
1. Vérifier les logs : `pm2 logs broadcast`
2. Vérifier Apache : `sudo tail -f /var/log/apache2/broadcast-error.log`
3. Redémarrer PM2 : `pm2 restart broadcast`
4. Redémarrer Apache : `sudo systemctl restart apache2`
