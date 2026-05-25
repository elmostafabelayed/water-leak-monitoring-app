# Water Leak Guardian - Documentation Complète

## 1. Pitch & Script (Présentation du Projet)

### PARTIE 1 — Le Problème
"Au Maroc, près de 35 % de l’eau potable est perdue dans les canalisations, dont une grande majorité due à des fuites invisibles. Les factures d’eau augmentent, les ressources s’épuisent, et pourtant, personne ne s’en rend compte immédiatement. Ces fuites cachées coûtent chaque année des milliers de dirhams aux familles marocaines."

### PARTIE 2 — La Solution
"Nous avons créé **Water Leak Guardian**, un système intelligent qui surveille vos canalisations en temps réel. Dès qu’une fuite est détectée, le système envoie une alerte sur votre téléphone et ferme automatiquement le robinet. Finis le gaspillage et les dégâts. Détecter. Alerter. Agir."

### PARTIE 3 — Démonstration
"En conditions normales, l’eau circule librement dans la canalisation. Une LED verte indique que tout est en ordre. Dès qu’une fuite apparaît, même minime, le capteur de débit la détecte immédiatement. La LED rouge s’allume, une alarme sonore se déclenche. Le robinet se ferme automatiquement en moins de trois secondes. L’eau s’arrête complètement. Et sur votre téléphone, une notification apparaît : 'Fuite détectée, robinet fermé'. Tout cela sans aucune intervention humaine."

### PARTIE 4 — Application Mobile
"Notre application mobile vous donne un contrôle total. Suivez votre consommation d’eau en temps réel, consultez l’historique des alertes, ouvrez ou fermez le robinet à distance. Recevez des statistiques hebdomadaires pour mieux gérer vos ressources. Partout, à tout moment."

### PARTIE 5 — Conclusion
"Water Leak Guardian s’inscrit dans la vision des villes intelligentes. En connectant les infrastructures hydrauliques aux technologies numériques, nous contribuons à réduire le gaspillage de l’eau et à protéger notre avenir.

**Ce projet a été réalisé par :**
- **Anass Es-Salmany**
- **El Mostafa Belayd**
*(Stagiaires en Développement Digital Full Stack à l’ISTA Al Adarissa de Fès)*

Ensemble, économisons l’eau intelligemment."

---

## 2. Conception de la Base de Données (Laravel + MySQL)

Pour supporter ces fonctionnalités, voici le schéma de la base de données :

### Table: `users`
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt (PK) | Identifiant unique de l'utilisateur |
| `name` | String | Nom complet |
| `email` | String (Unique) | Adresse email pour la connexion |
| `password` | String | Mot de passe haché |
| `phone_token` | String (Null) | Token pour les notifications Push |
| `created_at` | Timestamp | Date de création du compte |

### Table: `water_readings` (Données envoyées par l'ESP32)
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt (PK) | ID du relevé |
| `user_id` | Foreign Key | Lien vers l'utilisateur |
| `flow_rate` | Float | Débit d'eau actuel (L/min) |
| `pressure` | Float | Pression dans les tuyaux (PSI/Bar) |
| `is_leak` | Boolean | `true` si le système a détecté une fuite |
| `created_at` | Timestamp | Date et heure précise du relevé |

### Table: `alerts` (Historique des alertes)
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt (PK) | ID de l'alerte |
| `user_id` | Foreign Key | Lien vers l'utilisateur |
| `type` | String | Type: `LEAK_DETECTED`, `HIGH_PRESSURE`, `LOW_BATTERY` |
| `severity` | Enum | `CRITICAL`, `WARNING`, `INFO` |
| `is_acknowledged` | Boolean | Si l'utilisateur a vu l'alerte (`default: false`) |
| `created_at` | Timestamp | Date de détection |

### Table: `valve_logs` (Contrôle du Robinet)
| Colonne | Type | Description |
| :--- | :--- | :--- |
| `id` | BigInt (PK) | ID du log |
| `user_id` | Foreign Key | Lien vers l'utilisateur |
| `action` | String | `OPEN` ou `CLOSE` |
| `triggered_by` | String | `SYSTEM` (Auto-fuite) ou `USER` (App mobile) |
| `created_at` | Timestamp | Date de l'action |

---

## 3. Architecture Technique
- **Frontend :** React Native (Expo) + NativeWind.
- **Backend :** Laravel 11 + Sanctum (API REST).
- **Hardware :** ESP32 + Capteur de débit YF-S201 + Électrovanne + LED + Buzzer.
- **Communication :** HTTP (Laravel API) ou WebSockets (pour le temps réel).
