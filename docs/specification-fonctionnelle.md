<!-- Voir p.6 -->
# Spécification fonctionnelle

## Acteurs
### 1. Patient
- Inscription/connexion à son espace
- Recherche d'un praticien (nom, prénom, spécialité)
- Réservation de rendez-vous
- Consultation des RDV (passés, à venir, annulés) et gestion (annulation si le RDV est dans +24h)
- Page profil minimaliste
- Déconnexion

### 2. Praticien
- Inscription/connexion à son espace
- Configuration des horaires de travail, de la spécialité et des types de prestation
- Calendrier des RDV programmés (format semaine/mois)
- Déconnexion

## Flux principaux
### 1. Réservation d'un rendez-vous (patient)
Nous partons du principe que le patient vient de se connecter à son espace.

1. **Landing page :** Le patient est redirié vers la page d'accueil. Il clique sur "Prendre un RDV".
2. **Recherche :** Il entre la spécialité dont il a besoin (ex: médecin généraliste).
3. **Résultats de recherche :** Il regarde les praticiens disponibles et en choisit un en cliquant sur son bouton "Voir les disponibilités".
4. **Page praticien :** Il observe les horaires du praticien, descends et sélectionne le créneau qui lui convient puis il clique sur "Réserver".
5. **"Mes rendez-vous" :** Il est alors redirigé sur une page contenant tous ses rendez-vous à venir.

### 2. Configuration du profil (praticien)
Nous partons du principe que le praticien se connecte pour la première fois après avoir crée son compte.

1. **Landing page :** Le praticien est redirigé sur la page d'accueil. Il a un message lui précisant qu'il n'a pas encore configuré son compte et que c'est nécessaire pour proposer des services. Il clique sur le lien associé à la notification.
2. **Profil :** Il est redirigé sur la sa page de profil, il y entre sa spécialité (ex: médecin généraliste), des types de prestation et leur durée (ex: Première consultation, 20min) et définit ses horaires de travail. Une fois rempli, il clique sur le bouton "Enregistrer les paramètres". Un message de confirmation s'affiche.

### 3. Consultation des rendez-vous programmés (praticien)
Nous partons du principe que le praticien est connecté à son espace.

1. **Landing page :** Le praticien est sur la page d'accueil, il clique dans la barre de navigation sur "Calendrier".
2. **Calendrier :** Il est redirigé sur la page de calendrier (au format semaine par défaut) affichant les créneaux réservés par les patients (Prénom NOM, type de consultation, heure de début et de fin de consultation).

### 4. Consultation des rendez-vous programmés (patient)
Nous partons du principe que le patient vient de se connecter à son espace.

1. **Landing page :** Le patient est redirigé sur la page d'accueil. Il clique dans la barre de navigation sur "Mes RDV".
2. **"Mes rendez-vous" :** Il arrive sur la page listant les RDV à venir.

## Règles métier critiques
### 1. Sécurité et confidentialité
- **Accès aux données :** Un praticien ne peut accéder aux informations personnelles d'un patient que si un rendez-vous a été programmé entre eux.
- **Identité :** Un utilisateur ne peut pas posséder à la fois un profil "Médecin" et un profil "Patient" avec la même adresse email.
- **Connexion :** Un utilisateur ne peut pas accéder à des données sensibles sans une authentification forte.

### 2. Prise de rendez-vous
- **Limite :** Un patient ne peut pas prendre un RDV dont la date/heure est déjà entamée ou passée.
- **Chevauchement :** Deux rendez-vous ne peuvent pas être pris sur un même créneau pour le même praticien.
- **Annulation :** Un patient ne peut pas annuler un rendez-vous à moins de 24 heures de son début.

## Contraintes non-fonctionnelles
### 1. Sécurité
- Les données doivent être chiffrées et respecter les normes actuelles applicables.
- Séparation des utilisateurs connectés par rôles attribués (patient/praticien).

### 2. Conformité et souveraineté
- Le système doit être déployé sur un service certifié HDS v2.0 et SecNumCloud.
- Application des règles de RGPD, dont la minimisation (collecte du strict nécessaire).
- L'architecture doit permettre un changement de fournisseur cloud en moins de 6 mois

### 3. Performance et disponibilité
- L'API doit répondre en moins de 200ms pour 95% des requêtes.
- Le frontend doit être affichée en moins de 2 secondes sur une connexion moyenne.
- Latence vidéo inférieure à 150ms pour la viso consultation.

### 4. Maintenabilité et évolutivité
- Utilisation des containers Docker pour assurer un fonctionnement identique.
- Centralisation des logs à des fins de maintenabilité et de traçabilité.
- Couverture de tests pour les fonctionnalités critiques.