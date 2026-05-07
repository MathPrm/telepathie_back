<!-- Voir p.32 -->
# Postmortem : Télépathie

**Date :** 2026-05-07
**Auteurs :** Mathilde, Sandra

## Résumé
Nous avons intégré divers systèmes permettant de prendre RDV avec un praticien.
Il est important de se rappeler que la partie de configuration prend un temps conséquent et que l'hébergement est une étape décisive et parfois complexe.

## Ce qui a marché
- Inscription/connexion pour les praticiens et les clients.
- Page profil avec configuration des horaires, de la spécialité et des types de prestation pour le praticien.
- Recherche d'un praticien par nom, prénom et spécialité.
- Page consultable du praticien avec possibilité de réservation d'un RDV.
- Page client "Mes rendez-vous gardant trace de toute réservation passée, à venir et annulée.
- Page calendrier praticien affichant les RDV programmés avec choix de format semaine/mois.

## Ce qui n'a pas marché
- Hébergement chez un cloud à la fois souverain, managé et certifié HDS/SecNumCloud.

## Surprises
- Les services managés et certifiés HDS/SecNumCloud n'ont pas de free-tier : l'hébergement du prototype n'est pas abordable en respectant les contraintes imposées.
- La mise en place du front et du back en container Docker à été laborieuse : prévoir plus de temps pour le setup du projet.

## Ce qu'on referait différemment
- Prévoir une solution d'hébergement pour le prototype correspondant aux contraintes budgétaires avant d'entamer le projet.
- Répartir le temps de manière plus stratégique (comme ne pas miser sur le one-shot du setup du projet et de la mise en ligne).

## Décisions à porter dans le futur
- Mettre en place une pipeline CI/CD pour automatiser une partie les tests.
- Développer un système de visio conférence.
- Intégrer une connexion plus sécurisée.