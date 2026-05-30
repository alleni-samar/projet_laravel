# Projet Réservation de Vols - Frontend React

## Description

Ce projet représente l'interface utilisateur (Frontend) de l'application de réservation de vols. Il a été développé avec React.js et permet aux utilisateurs de consulter les vols disponibles, effectuer des réservations, gérer leur compte et interagir avec l'API Laravel.

---

# Technologies utilisées

* React.js
* React Router DOM
* Axios
* Bootstrap / CSS
* JavaScript ES6+

---

# Prérequis

Avant d'installer le projet, assurez-vous d'avoir :

* Node.js (version 18 ou supérieure recommandée)
* npm ou yarn
* Git
* Backend Laravel fonctionnel

Vérifier les versions :

```bash
node -v
npm -v
git --version
```

---

# Cloner le projet

```bash
git clone https://github.com/votre-compte/reservation-vols-frontend.git
cd reservation-vols-frontend
```

---

# Installation des dépendances

Installer toutes les dépendances du projet :

```bash
npm install
```

ou

```bash
yarn install
```

---

# Configuration de l'environnement

Créer un fichier `.env` à la racine du projet :

```env
REACT_APP_API_URL=http://127.0.0.1:8000/api
```

Exemple :

```env
REACT_APP_API_URL=http://localhost:8000/api
```

Cette variable permet de communiquer avec le backend Laravel.

---

# Structure du projet


src/
│
├── components/
│
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── FlightForm.jsx
│   ├── ReservationsList.jsx
│   └── ...
│
├── services/
│   └── api.js
│
├── context/
│
├── assets/
│
├── App.js

```

---

# Lancement du projet

Démarrer le serveur de développement :

```bash
npm start
```

ou

```bash
yarn start
```

L'application sera accessible à :

```text
http://localhost:3000
```

Le navigateur s'ouvrira automatiquement.

---


# Gestion des dépendances

Installer une nouvelle dépendance :

```bash
npm install nom-package
```

Exemple :

```bash
npm install axios
npm install react-router-dom
npm install bootstrap
```

---

# Scripts disponibles

### Démarrer le projet

```bash
npm start
```

# Connexion avec le Backend Laravel

Assurez-vous que le backend Laravel est démarré :

```bash
php artisan serve
```

Par défaut :

```text
http://127.0.0.1:8000
```

Configuration Axios :

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

export default api;
```

---

# Fonctionnalités du projet

* Authentification utilisateur
* Inscription utilisateur
* Connexion utilisateur
* Consultation des vols
* Recherche de vols
* Réservation de vols
* Gestion des réservations
* Tableau de bord administrateur
* Gestion des vols

---

# Résolution des problèmes

### Supprimer node_modules

```bash
rm -rf node_modules
npm install
```

Sous Windows :

```cmd
rmdir /s /q node_modules
npm install
```

### Nettoyer le cache npm

```bash
npm cache clean --force
```



# Auteur

Projet réalisé dans le cadre du développement d'une application de réservation de vols utilisant :

* Laravel (Backend)
* React.js (Frontend)
* MySQL (Base de données)

---

