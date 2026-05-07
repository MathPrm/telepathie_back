<!-- Voir p.8 -->
# ADR-001 - Choix du service cloud utilisé
**Statut :** Accepté
**Date :** 2026-05-07
**Auteurs :** Mathilde, Sandra

## Contexte
Notre projet (plateforme de télémédecine) impose deux contraintes :
- Conformité réglementaire stricte (RGPD, HDS, DSP2)
- Souveraineté des données (données devant rester en France/Europe)

## Critères établis
### 1. Hébergeur français
Au delà de la souveraineté des données imposée, qui peut être européenne, nous misons sur du 100% français afin de se protéger de futures réglementations.

### 2. Immunité aux lois extra-territoriales
Les données de santé de nos utilisateurs ne doivent en aucun cas être exposées. En se protégeant de certaines lois comme le Cloud Act, nous limitons les risques.

### 3. Certifié HDS v2.0
Parmi les critères imposés est précisé le HDS, qui est une norme de sécurité sur l'hébergement des données de santé qui se décline en 6 activités. Il est également important de préciser la version de cette norme car la v2.0 devient obligatoire pour l'hébergement de données de santé à partir du 16 mai 2026. 

### 4. Certifié SecNumCloud 
Le SecNumCloud est une norme française exigeante sur la sécurité des données et la traçabilité. Elle est souvent demandée par les services publics comme les hôpitaux. Si nous ne disposons pas de cette norme, nous nous fermons des portes.

### 5. Service managé
Lors du lancement du projet, nous avons établis que nous ne voulions pas recruter de service technique pour la partie administration système. De ce fait, il nous faut un service managé pouvant gérer cet aspect technique à notre place.

## Choix relevés

### 1. BT-BLUE
- Hébergeur français
- Immunité aux lois extra-territoriales
- Certifié HDS v2.0
- Certifié SecNumCloud en cours
- Service managé

### 2. AB6
- Hébergeur français
- Immunité aux lois extra-territoriales
- Certifié HDS v2.0
- Service managé

### 3. Outscale
- Hébergeur français
- Immunité aux lois extra-territoriales
- Certifié HDS v2.0
- Certifié SecNumCloud

## Décision
**Après comparatif des besoins, nous avons opté pour BT-BLUE**
Des services relevés, il dispose de quatre critères et travaille sur l'obtention du SecNumCloud. Outscale aurait été une bonne solution si nous disposions d'un admin sys.

## Conséquences
- **Positives :** souveraineté assurée, pas de Cloud Act, support en français et service managé.
- **Négatives :** certification SecNumCloud en cours d'obtention.
- **Risques :** dépendance à un service managé.
Plan B : engager un admin sys.
- **Réversibilité :** ~2 mois pour migrer vers Cloud Temple avec une coupure du service que de quelques minutes.