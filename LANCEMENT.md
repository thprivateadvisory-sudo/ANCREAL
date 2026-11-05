# Ancréal : plan de lancement (semaine du 9 novembre 2026)

Objectif : site en ligne la semaine prochaine, et montage de la première opération lancé pour acquérir, rénover et louer la première maison.

## 1. Pourquoi le mécénat seul ne suffit pas (et ce qui change)

Ancréal est une **SAS de l'ESS**, pas une association d'intérêt général. En règle générale, une SAS ne peut donc pas délivrer de **reçu fiscal de mécénat** (réduction d'impôt de 60 %). C'est très probablement l'une des causes des refus reçus jusqu'ici : sans avantage fiscal, un « don » à une société commerciale est difficile à justifier pour une entreprise. **À valider avec l'expert-comptable.**

Ce qu'on propose à la place aux entreprises (le site est déjà à jour) :

- **Prêt solidaire** : remboursable, adossé à un actif immobilier, et bien plus facile à faire accepter qu'un don.
- **Apport en nature ou en compétences** : matériaux, mobilier, prestations.
- **Soutien financier / partenariat** : avec des contreparties de visibilité et un reporting RSE / CSRD (traité comptablement comme du parrainage, pas comme du mécénat).

Le site présente maintenant Ancréal comme une **entreprise de l'ESS avec un business plan**, financée par plusieurs sources : prêt bancaire (environ 70 %), fonds propres solidaires, aides à la rénovation, partenaires, coûts maîtrisés par le Groupe Cohesif, puis les loyers.

## 2. Mise en ligne du site (à finir avant mercredi)

| # | Action | Qui | Bloquant ? |
|---|---|---|---|
| 1 | Choisir l'hébergeur (recommandé : Netlify ou GitHub Pages, gratuits) | Thomas | Oui |
| 2 | Acheter / brancher le domaine `ancreal.fr` (sinon modifier `SITE_URL` dans `tools/build.py`) | Thomas | Oui |
| 3 | Compléter les mentions légales : capital, siège, RCS/SIRET, hébergeur (`src/pages/mentions-legales.html`) | Thomas | Oui (obligation légale) |
| 4 | Créer un formulaire Formspree (gratuit) et ajouter `data-endpoint` sur les formulaires | Thomas / Claude | Non (sinon ouverture de la messagerie) |
| 5 | Créer une adresse `contact@ancreal.fr` (le site affiche aujourd'hui contact@groupecohesif.com) | Thomas | Non |
| 6 | Portrait du fondateur : `assets/img/thomas-hoenig.jpg` | Thomas | Non |
| 7 | Régénérer : `python3 tools/build.py` | Claude | n/a |

Si la société n'est pas encore immatriculée la semaine prochaine, on peut quand même mettre le site en ligne avec la mention « société en cours d'immatriculation » à la place des numéros.

## 3. Montage de la première opération (en parallèle)

**Semaine 1 (du 9 au 13 novembre)**
- Rendez-vous **France Active** (territoire Grand Est) : garantie bancaire, prêt participatif ESS, accompagnement ESUS.
- Rendez-vous avec **2 banques** ayant une offre ESS (Crédit Coopératif, Crédit Mutuel, Banque Populaire, Caisse d'Épargne…) avec le business plan et une opération type chiffrée.
- Contacter le réseau **Initiative** ou **Réseau Entreprendre** pour un prêt d'honneur au fondateur : c'est du quasi-fonds propres, qui renforce le dossier bancaire.
- Relancer les entreprises qui ont refusé le mécénat, avec la nouvelle proposition : **prêt solidaire ou apport en nature**.

**Semaines 2 à 4**
- Sélectionner **2 ou 3 biens cibles** (maisons de ville décotées dans le Grand Est) et chiffrer les travaux avec Cohesif BTP.
- Consulter l'**ADIL** et l'**Anah** du département sur le conventionnement et les aides travaux mobilisables pour une personne morale.
- Signer **une association partenaire** de réinsertion : une lettre d'intention, utile pour la banque et pour l'ESUS.
- Faire une offre sous **conditions suspensives de financement**.

**Mois 2 et 3**
- Accord bancaire, acte authentique, démarrage des travaux (environ 8 mois).

## 4. Pièces du dossier financeurs (à rassembler cette semaine)

- [ ] Statuts ESS (avec les clauses de l'article 1 de la loi de 2014)
- [ ] Business plan à 3 ans et prévisionnel de l'opération n°1
- [ ] Plan de financement de l'opération n°1, réparti par source
- [ ] Chiffrage des travaux par Cohesif BTP
- [ ] Lettre(s) d'intention : association partenaire, entreprises partenaires
- [ ] CV du fondateur, références du Groupe Cohesif
- [ ] Plaquette : `assets/docs/Ancreal_Plaquette_Partenaires.pdf` (à jour)
