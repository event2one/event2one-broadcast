# Guide de configuration GitHub

Il semble que **Git ne soit pas installé** ou pas accessible dans votre terminal actuel. Voici comment procéder pour lier votre projet à GitHub.

## 1. Installer Git (si nécessaire)

Téléchargez et installez Git pour Windows : [https://git-scm.com/download/win](https://git-scm.com/download/win)

Après l'installation, redémarrez votre terminal (ou VS Code).

## 2. Initialiser le projet

Ouvrez un terminal à la racine du projet (`e:\sysencom\dev\lab\broadcast`) et lancez :

```bash
git init
git add .
git commit -m "Initial commit"
```

*Note : Si c'est la première fois que vous utilisez Git, il vous demandera peut-être de configurer votre email :*
```bash
git config --global user.email "votre-email@exemple.com"
git config --global user.name "Votre Nom"
```

## 3. Créer le dépôt sur GitHub

1.  Allez sur [https://github.com/orgs/event2one/repositories/new](https://github.com/orgs/event2one/repositories/new)
2.  Nommez le dépôt (par exemple `broadcast`).
3.  Ne cochez **pas** "Initialize with README" ou .gitignore (nous les avons déjà).
4.  Cliquez sur "Create repository".

## 4. Lier et Pousser

Une fois le dépôt créé, GitHub vous affichera des commandes. Copiez et exécutez celles qui ressemblent à ceci :

```bash
git remote add origin https://github.com/event2one/event2one-broadcast.git
git branch -M main
git push -u origin main
```

*(Remplacez l'URL par celle de votre nouveau dépôt)*

---

## Fichiers ignorés
J'ai déjà créé un fichier `.gitignore` à la racine pour éviter d'envoyer des fichiers inutiles ou sensibles (comme `node_modules` ou `.env`) sur GitHub.
