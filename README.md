# Telepathie - Backend API

Backend du projet Telepathie basé sur Node.js, Express et TypeScript avec PostgreSQL.

## Prérequis

- **Node.js** 18+ et **npm**
- **Docker** et **Docker Compose**

## Installation rapide

### 1. Cloner le projet

```bash
git clone https://github.com/MathPrm/telepathie_back.git
cd telepathie_back
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Adapter les valeurs dans `.env` si nécessaire (les valeurs par défaut devraient fonctionner avec Docker).

### 3. Démarrer avec Docker Compose

```bash
docker-compose up --build -d
```

## Commandes utiles

```bash
# Voir les logs
docker-compose logs -f api

# Arrêter les services
docker-compose down

# Redémarrer
docker-compose up -d
```
