<!-- Voir p.18 -->
# Tensions et arbitrages identifiés dans le brief

## Tension 1 : Rapidité de déploiement vs Souveraineté des données
- **Citation du brief :** 
"La souveraineté numérique garantit la maîtrise des données sous droit national, à l’abri des lois extraterritoriales étrangères."

- **Pourquoi c'est une tension :** 
Les leaders du Cloud offrent des services très rapides à intégrer, mais ils sont soumis au Cloud Act, ce qui entre en conflit direct avec notre exigence de souveraineté totale.

- **Notre arbitrage :** 
Nous avons choisi BT-BLUE (puis Cloud Temple après la contrainte), des hébergeurs 100% français certifiés HDS, quitte à devoir configurer nous-mêmes certains services applicatifs (comme les serveurs de signalement visio).


## Tension 2 : Disponibilité critique vs Isolation des données de santé
- **Citation du brief :** 
"PCA (Plan de Continuité) : Maintenir l'activité pendant la perturbation... réplication synchrone temps réel."

- **Pourquoi c'est une tension :** 
La réplication synchrone sur plusieurs sites (Nantes/Rennes) augmente la complexité technique et les coûts de latence, alors que les données de santé imposent des normes stricts qui rendent les échanges entre zones géographiques plus complexes à sécuriser.

- **Notre arbitrage :** 
Nous avons privilégié une architecture haute disponibilité avec un basculement automatique. La sécurité des tunnels de réplication est assurée par un chiffrement de bout en bout pour ne jamais sacrifier la protection au profit de la disponibilité.


## Tension 3 : Expérience utilisateur vs Authentification Forte
- **Citation du brief :** 
"La garantie absolue que vos informations médicales restent strictement confidentielles."

- **Pourquoi c'est une tension :** 
Pour une application de prise de RDV, l'utilisateur veut de la fluidité (connexion simple). Or, les données de santé imposent souvent une authentification sécurisée (2FA), ce qui peut décourager certains utilisateurs.

- **Notre arbitrage :** 
Nous appliquons un arbitrage de sécurité par palier : une connexion simple pour la prise de RDV, mais une authentification forte dès qu'il s'agit d'accéder au dossier médical ou de lancer la visio.