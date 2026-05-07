<!-- Voir p.8 -->
# ADR-002 - Service actuel indisponible dans 6 mois
**Statut :** Accepté
**Date :** 2026-05-07
**Auteurs :** Mathilde, Sandra

## Contexte
Jusqu'ici basé sur les services de BT-BLUE, on nous annonce que celui-ci ne sera plus fonctionnel dans 6 mois : une migration vers un autre service de cloud similaire est impératif.

## Rappel des critères
Notre plateforme étant déjà disponible en ligne et utilisée, il est important de conserver les critères auxquels nous répondions avec BT-BLUE :
- Souveraineté française
- Immunité aux lois extra-territoriales
- Certification HDS V2.0
- Certification SecNumCloud
- Service managé

Les anciennes solutions évaluées ne peuvent pas être exploitées car elles ne répondent pas à nos engagements pris en terme de sécurité et de gestion système.

## Décision
Après avoir étudié les options nous correspondant, nous avons relevé un match avec notre solution actuelle.

### Cloud Temple
- Hébergeur français
- Immunité aux lois extra-territoriales
- Certifié HDS v2.0
- Certifié SecNumCloud
- Service managé

## Migration
Les deux services utilisent des technologies basées sur VMWare, facilitant la migration. Les services étant managés, ils s'occupent de l'aspect technique de la transition.

Le transfert du service s'étale sur environ 2 mois et l'interruption du service ne durera que quelques minutes (coupure de l'instance côté BT-BLUE et démarrage côté Cloud Temple).

## Conséquences
- **Positives :** les critères actuels sont conservés, avec en plus la certification SecNumCloud attribuée.
- **Négatives :** le coût mensuel est plus élevé (835€/mois pour BT-BLUE contre 1240€/mois pour Cloud Temple à capacités et services égaux).