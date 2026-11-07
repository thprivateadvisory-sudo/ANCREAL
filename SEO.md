# Ancréal : plan de référencement (SEO)

Objectif : apparaître en tête de Google quand une association, une agence immobilière, une collectivité ou un investisseur cherche « logement social », « logement solidaire », « logement conventionné » ou « logement d'insertion », d'abord dans le Grand Est.

## 1. Ce qui est fait sur le site (novembre 2026)

| Chantier | Détail |
|---|---|
| Titres et descriptions | Chaque page cible un mot-clé : « logement social et solidaire Grand Est », « partenaires du logement social », etc. Titres de 60 caractères ou moins. |
| 4 pages guides | `logement-social.html` (page pilier), `agences-immobilieres.html`, `logement-solidaire-grand-est.html`, `investir-logement-solidaire.html` |
| Données structurées (schema.org) | Générées par `tools/build.py` sur chaque page : Organization, WebSite, WebPage, fil d'Ariane (BreadcrumbList), Article (guides), FAQPage (toute FAQ en `<details>`). |
| Maillage interne | Bloc « Guides » sur l'accueil, liens dans le pied de page de toutes les pages, liens croisés entre guides, FAQ contact enrichie. |
| Réseaux sociaux | Balises Open Graph et Twitter complètes, texte alternatif de l'image de partage. |
| Images | Textes alternatifs descriptifs sur toutes les photos de contenu. |
| Technique déjà en place | HTTPS, canoniques, sitemap.xml, robots.txt, pages légères, mobile, polices locales. |

Pour ajouter une page guide : créer `src/pages/ma-page.html` avec `type: article`, `crumb:` et `published:` dans l'en-tête, puis `python3 tools/build.py`. Le sitemap est mis à jour automatiquement.

## 2. À faire par Thomas cette semaine (le plus important)

Le site seul ne suffit pas : Google classe aussi selon la **notoriété** (liens d'autres sites) et la **présence locale**.

1. **Google Search Console** (gratuit, 10 min) : search.google.com/search-console → ajouter la propriété « Domaine » `ancreal.fr` → vérifier par un enregistrement **TXT** chez le registrar → menu *Sitemaps* → soumettre `https://www.ancreal.fr/sitemap.xml`. Puis *Inspection de l'URL* → *Demander l'indexation* pour l'accueil et les 4 guides.
2. **Bing Webmaster Tools** : importer directement depuis Search Console (2 min). Bing alimente aussi plusieurs assistants IA.
3. **Fiche Google Business Profile** (business.google.com) : catégorie « Société de gestion immobilière » ou « Organisme de logement social », zone desservie Grand Est (sans afficher d'adresse si pas de local). C'est ce qui fait apparaître Ancréal sur Google Maps et dans les recherches locales.
4. **Page LinkedIn entreprise** Ancréal + profil de Thomas qui pointe vers le site. Publier chaque étape (première visite, compromis, chantier, arrivée des locataires).

## 3. Obtenir des liens vers ancreal.fr (mois 1 à 3)

Par ordre d'impact :

- **Annuaires de l'ESS** : CRESS Grand Est, ESS France, Avise, annuaire des entreprises ESUS (une fois l'agrément obtenu), France Active Grand Est.
- **Partenaires** : demander à chaque association, banque, entreprise du cercle fondateur et à Cohesif BTP un lien vers ancreal.fr depuis leur site (page partenaires ou actualité).
- **Collectivités** : communes et intercommunalités où une opération a lieu (bulletin municipal, site de la mairie, programmes Petites villes de demain / Action cœur de ville).
- **Presse régionale** : DNA, L'Alsace, Le Républicain Lorrain, L'Est Républicain, L'Union, France 3 Grand Est. Angle : « une maison vacante devient un logement pour une personne en réinsertion ». L'achat de la première maison est le bon moment.
- **Réseaux** : Initiative, Réseau Entreprendre, CCI, Fédération des acteurs de la solidarité Grand Est, ADIL.
- **Agences immobilières** : proposer aux agences partenaires de mentionner Ancréal (lien vers `agences-immobilieres.html`).

Éviter absolument : achat de liens, annuaires « SEO » sans rapport, échanges de liens en masse. Google pénalise.

## 4. Contenu à publier ensuite (1 article par mois)

Chaque nouvelle page vise une recherche précise. Idées classées par priorité :

1. « Loc'Avantages : louer son bien en logement conventionné » (propriétaires)
2. « Intermédiation locative : comment ça marche » (associations, propriétaires)
3. « Logement vacant : que faire d'une maison inoccupée ? » (vendeurs, successions)
4. Une page par grande ville dès qu'une opération y a lieu : « Logement solidaire à Metz », « à Mulhouse »… avec photos réelles du chantier (jamais de page ville sans contenu réel : Google les considère comme du remplissage).
5. Journal des opérations : avant / après de chaque maison, chiffres réels, témoignage de l'association partenaire. C'est le contenu le plus puissant : il est unique.

## 5. Mesurer (chaque mois, dans Search Console)

- Requêtes qui affichent le site, position moyenne, clics.
- Pages indexées (toutes les pages du sitemap doivent l'être).
- Liens externes vers le site.

## Ce qu'il faut savoir

- Le référencement prend **3 à 6 mois** pour un nouveau domaine. Les recherches précises (« logement solidaire Grand Est », « vendre maison à rénover association logement ») viendront d'abord ; « logement social » seul est dominé par service-public.fr, les bailleurs et les grands médias, et demande des liens et du contenu réel sur la durée.
- Ne pas écrire sur le site qu'Ancréal est « leader » ou « n°1 » tant que ce n'est pas démontrable : c'est une pratique commerciale trompeuse au sens du Code de la consommation, et cela n'aide pas le référencement. « Devenir la référence » (ambition) est correct.
