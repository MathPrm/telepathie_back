<!-- Voir p.19 -->
# Document de défense

## Question 1 : “Pourquoi ce service plutôt qu’un autre ?”
Nous avons fait un benchmark afin de comparer les différentes solutions qui pourraient nous correspondre : cela nous a permis d'établir nos critères obligatoires et souhaités pour notre solution.
Le choix de BT-BLUE nous a parus évident puisqu'il dispose d'un service français managé, certifié HDS v2.0 et en cours de validation pour le SecNumCloud. Son plus grand concurrent dans notre benchmark (Outscale) ne disposait pas de service managé, ce qui l'a écarté de la liste.
BT-BLUE était la solution la plus chère du benchmark mais lorsqu'il s'agit de données très sensibles, il est important de privilégier un service de qualité, il ne faut donc pas s'arrêter au prix dans la mesure du possible.

## Question 2 : “Si votre trafic double demain ?”
Dans le cas où télépathie connaît un pic de traffic, l'utilisation légère du site est capable de l'encaisser avec les capacités que nous avons établies, ce qui nous permettra de voir arriver la vague. L'utilisation lourde (visio-consultation) devra par contre nécessiter d'augmenter la bande passante mais puisqu'elle nécessite une réservation au préalable, nous serons en mesure de constater l'augmentation des créneaux de visio.

## Question 3 : “Si votre fournisseur principal devient inaccessible ?”
Dans le cas où BT-BLUE serait inaccessible, nous optons pour les services de Cloud Temple. En plus de leur utilisation commune de technologies VMWare qui permettraient une migration rapide, Cloud Temple rempli les critères obligatoires établis lors du benchmark. De ce fait, la bascule d'un service à l'autre sera rapide et avec une interruption très courte (quelques minutes). 

## Question 4 : “Combien coûte votre architecture à la fin du mois ?”
En utilisant les services de BT-BLUE et avec les capacités définies, le coût mensuel est de 835€. Ce prix inclut les 3 instances, le stockage, la rétention et la bande passante. Le service ayant un palier gratuit généreux de bande passante, toute augmentation ne devrait pas faire monter le coût en flèche. 

## Question 5 : “Pourquoi privilégier un service managé à un recrutement d'un admin sys ?”
Etant une équipe majoritairement composée de développeurs, l'aspect technique ne nous concerne pas. Nous sommes une équipe où chacun investi son temps personnel dans le projet et afin de respecter cette idée, embaucher un admin sys ne collait pas à notre direction de début de projet (budget nul).
