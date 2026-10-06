# Ancréal — site institutionnel

Site statique multi-pages (HTML / CSS / JS, sans framework) pour le lancement d'Ancréal, entreprise de l'ESS dédiée au logement solidaire.

## Pages
| Fichier | Contenu |
|---|---|
| `index.html` | Accueil : hero, accès par profil, chiffres clés, mission, opération type, ambition, mot du fondateur |
| `modele.html` | Le cycle en 6 étapes (séquence animée), l'opération type, l'écosystème Groupe Cohesif, tableau comparatif |
| `engagements.html` | Les 6 engagements ESS statutaires, agréments (ESS / ESUS / MOI), gouvernance, mesure d'impact |
| `partenaires.html` | Cercle des entreprises fondatrices + simulateur, entreprises, associations, collectivités, propriétaires, investisseurs |
| `a-propos.html` | Vision, fondateur, Groupe Cohesif, feuille de route, espace presse |
| `contact.html` | Formulaire de contact + FAQ |
| `mentions-legales.html`, `404.html` | Pages légales et d'erreur |

## Modifier le site
Les pages HTML à la racine sont **générées** : on modifie les sources dans `src/`, puis on régénère.

```
src/pages/*.html      contenu de chaque page
src/partials/         gabarit commun (en-tête, pied de page, <head>)
src/images.json       toutes les photos du site, à un seul endroit
tools/build.py        génération des pages + sitemap.xml + robots.txt
```

```
python3 tools/build.py
```

**Nom de domaine** : renseigner `SITE_URL` dans `tools/build.py` (actuellement `https://www.ancreal.fr`), puis régénérer.

## Aperçu local
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000

## Photos et vidéo
- **Photos** : déclarées dans `src/images.json` (actuellement des liens Unsplash, licence libre). Pour les remplacer, déposer les fichiers dans `assets/img/photos/` et changer les `src`, puis régénérer.
- **Vidéo d'accueil** : déposer une vidéo libre de droits dans `assets/video/hero.mp4` (1080p, < 10 Mo, sans son). Sans fichier, un diaporama photo s'affiche.
- **Portrait du fondateur** : voir le commentaire dans `src/pages/a-propos.html`.

## Plaquette PDF
`assets/docs/Ancreal_Plaquette_Partenaires.pdf`, générée depuis `tools/plaquette.html` :
```
pip install playwright && python3 tools/make_pdf.py
```

## Formulaires
Le formulaire de contact et l'inscription aux nouvelles ouvrent par défaut la messagerie du visiteur. Pour recevoir les messages directement, ajouter `data-endpoint="https://formspree.io/f/XXXX"` sur la balise `<form>` concernée (dans `src/`).

## Technique
- Animations : GSAP + ScrollTrigger + SplitText, défilement fluide Lenis (hébergés dans `assets/vendor/`).
- Polices auto-hébergées (Archivo, Public Sans, Montserrat — licence SIL OFL) : aucun appel à Google Fonts.
- SEO : balises canoniques, Open Graph, données structurées, `sitemap.xml`, `robots.txt`, manifeste.
- Accessibilité : navigation clavier, `prefers-reduced-motion` respecté, contenu lisible sans JavaScript.

## Mise en ligne
Hébergement statique : GitHub Pages, Netlify, Vercel ou OVH (déposer le contenu du dépôt hors `src/` et `tools/`).
