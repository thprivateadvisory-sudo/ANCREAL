# Ancréal — site vitrine

Site statique (HTML / CSS / JS, sans dépendance) pour le lancement d'Ancréal, entreprise de l'ESS dédiée au logement solidaire.

## Structure
- `index.html` — page principale (mission, modèle, écosystème, engagements ESS, ambition, feuille de route, partenaires, fondateur, FAQ, contact)
- `mentions-legales.html` — mentions légales, RGPD, crédits photos (champs `[à compléter]` après immatriculation)
- `assets/css/style.css`, `assets/js/main.js`, `assets/img/` (logo PNG + SVG)

## Aperçu local
```
python3 -m http.server 8000
```
puis ouvrir http://localhost:8000

## À personnaliser
- **Vidéo d'en-tête** : déposer une vidéo libre de droits (Pexels, Mixkit…) dans `assets/video/hero.mp4` (1080p, < 10 Mo, sans son). Sans fichier, un diaporama photo s'affiche.
- **Photos** : hébergées sur Unsplash (licence libre, usage commercial). Pour les remplacer, changer les URL dans `index.html`.
- **Portrait du fondateur** : ajouter `assets/img/thomas-hoenig.jpg` et décommenter la balise `<img>` dans la section `#fondateur`.
- **Formulaire** : ouvre par défaut la messagerie du visiteur. Pour recevoir les messages directement, ajouter `data-endpoint="https://formspree.io/f/XXXX"` sur `<form id="contactForm">`.

## Mise en ligne
Hébergement gratuit possible via GitHub Pages, Netlify ou Vercel (glisser-déposer du dossier).
