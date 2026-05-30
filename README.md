# Projet Laravel - Backend API de Réservation de Vols

## Description

Ce projet est le backend d'une application de réservation de vols développée avec Laravel. Il fournit les API nécessaires pour la gestion des utilisateurs, des vols, des réservations et de l'authentification.

---

# Prérequis

Avant de commencer, assurez-vous d'avoir installé les outils suivants :

* PHP >= 8.2
* Composer
* MySQL/xampp 
* Git
* Node.js et npm (optionnel)
* Laravel CLI (optionnel)

Vérification des versions :

```bash
php -v
composer -V
mysql --version
git --version
```

---

# Cloner le projet

```bash
git clone https://github.com/votre-compte/projet_laravel.git
cd projet_laravel
```

---

# Installation des dépendances

Installer les dépendances PHP :

```bash
composer install
```

---

# Configuration de l'environnement

Copier le fichier d'exemple :

```bash
cp .env.example .env
```

Sous Windows :

```bash
copy .env.example .env
```

Générer la clé de l'application :

```bash
php artisan key:generate
```

---

# Configuration de la base de données

Modifier le fichier `.env` :

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=reservation_vols
DB_USERNAME=root
DB_PASSWORD=
```

Créer la base de données :

```sql
CREATE DATABASE reservation_vols;
```

---

# Exécution des migrations

Créer les tables :

```bash
php artisan migrate
```

Si des seeders :

```bash
php artisan db:seed
```

Ou :

```bash
php artisan migrate --seed
```

---

# Installation de Laravel Sanctum 

```bash
composer require laravel/sanctum
```

Publier les fichiers :

```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

Exécuter les migrations :

```bash
php artisan migrate
```

---

# Lancement du serveur

```bash
php artisan serve
```

Le serveur sera accessible à l'adresse :

```text
http://127.0.0.1:8000
```

---

# Structure principale du projet

```text
app/
├── Http/
│   ├── Controllers/
│   ├── Middleware/
│   └── Requests/

database/
├── migrations/
├── seeders/

routes/
├── api.php
├── web.php

storage/

tests/
```

---

# Variables d'environnement importantes

```env
APP_NAME="Reservation Vols"
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://127.0.0.1:8000

LOG_CHANNEL=stack

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=reservation_vols
DB_USERNAME=root
DB_PASSWORD=

CACHE_DRIVER=file
QUEUE_CONNECTION=sync
SESSION_DRIVER=file
```

---

# Commandes utiles

Nettoyer le cache :

```bash
php artisan cache:clear
```

Nettoyer la configuration :

```bash
php artisan config:clear
```

Afficher les routes :

```bash
php artisan route:list
```

Créer un contrôleur :

```bash
php artisan make:controller FlightController
```

Créer un modèle avec migration :

```bash
php artisan make:model Flight -m
```

Créer un seeder :

```bash
php artisan make:seeder FlightSeeder
```

---

# Exécution des tests

Lancer tous les tests :

```bash
php artisan test
```

Ou :

```bash
vendor/bin/phpunit
```

Exécuter un test spécifique :

```bash
php artisan test --filter=FlightTest
```

---

# Documentation API

Les routes API sont disponibles dans :

```text
routes/api.php
```

Exemples d'endpoints :

```http
POST /api/register
POST /api/login
POST /api/logout

GET /api/flights
POST /api/flights

GET /api/reservations
POST /api/reservations
```

---

# Déploiement en production

Installer les dépendances :

```bash
composer install --no-dev --optimize-autoloader
```

Mettre en cache la configuration :

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

Exécuter les migrations :

```bash
php artisan migrate --force
```

---

# Auteurs

Projet réalisé dans le cadre du développement d'une application de réservation de vols avec Laravel et React.

---

