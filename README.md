<!-- Voir p.12 -->
# Nom du projet
**Télépathie - La médecine qui vous devine.**
Plateforme de télémédecine intégrant une gestion des rendez-vous médicaux et téléconsultation.

## Prérequis

- **Node.js** 18+ et **npm**
- **Docker** et **Docker Compose**

## Démarrage rapide

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

## Architecture
Voir [`docs/architecture.md`](docs/architecture.md).

## Contraintes & arbitrages
- [Contrainte spécifique 1] : voir ADR 0001
- [Contrainte spécifique 2] : voir ADR 0002

## Équipe
- Mathilde, rôle (frontend / backend / data / ops)
- Sandra, rôle (frontend / backend / data / ops)

## État du projet

### 1. Ce qui marche
- ...

### 2. Ce qui ne marche pas
- ...

### 3. Ce qui est partiel
- ...

## Roadmap (non-engageante)
[Ce qu'on ferait si on continuait]
