#!/usr/bin/env python3
"""Génère les pages HTML du site Ancréal.

Chaque page de src/pages/ commence par un en-tête de métadonnées :

    ---
    title: Titre de la page
    description: Description pour les moteurs de recherche
    nav: modele            (lien de menu à marquer comme actif)
    ---

puis contient le HTML du <main>. Le script l'assemble avec les gabarits
de src/partials/ et écrit le résultat à la racine du dépôt.

Variables disponibles dans les pages et gabarits :
    {{img:cle}}   URL d'une image déclarée dans src/images.json
    {{site_url}}  URL publique du site (SITE_URL ci-dessous)
    {{year}}      année courante

Usage : python3 tools/build.py
"""
import datetime
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# URL publique du site, utilisée pour les liens canoniques, Open Graph et le sitemap.
# À adapter au nom de domaine réellement réservé.
SITE_URL = "https://www.ancreal.fr"

NAV = [
    ("modele", "modele.html", "Notre modèle"),
    ("engagements", "engagements.html", "Engagements"),
    ("partenaires", "partenaires.html", "Nous rejoindre"),
    ("a-propos", "a-propos.html", "À propos"),
    ("contact", "contact.html", "Contact"),
]


def parse_page(text):
    meta = {}
    match = re.match(r"---\n(.*?)\n---\n", text, re.S)
    if match:
        for line in match.group(1).splitlines():
            key, _, value = line.partition(":")
            meta[key.strip()] = value.strip()
        text = text[match.end():]
    return meta, text


def render(template, values, images):
    def img(match):
        key = match.group(1)
        if key not in images:
            raise SystemExit(f"Image inconnue : {key}")
        return images[key]["src"]

    out = re.sub(r"\{\{img:([\w-]+)\}\}", img, template)
    for key, value in values.items():
        out = out.replace("{{" + key + "}}", value)
    leftover = re.findall(r"\{\{[^}]+\}\}", out)
    if leftover:
        raise SystemExit(f"Variables non remplacées : {sorted(set(leftover))}")
    return out


def nav_html(active):
    items = []
    for key, href, label in NAV:
        current = ' aria-current="page"' if key == active else ""
        items.append(f'<li><a href="{href}"{current}>{label}</a></li>')
    return "\n        ".join(items)


def main():
    images = json.loads((SRC / "images.json").read_text(encoding="utf-8"))
    partials = {p.stem: p.read_text(encoding="utf-8") for p in (SRC / "partials").glob("*.html")}
    year = str(datetime.date.today().year)
    built = []

    for page in sorted((SRC / "pages").glob("*.html")):
        meta, body = parse_page(page.read_text(encoding="utf-8"))
        path = "" if page.name == "index.html" else page.name
        values = {
            "title": meta["title"],
            "description": meta["description"],
            "body_class": meta.get("body_class", ""),
            "robots": meta.get("robots", "index, follow"),
            "canonical": f"{SITE_URL}/{path}",
            "og_image": f"{SITE_URL}/assets/img/og-ancreal.jpg",
            "site_url": SITE_URL,
            "year": year,
            "nav": nav_html(meta.get("nav", "")),
        }
        values["header"] = render(partials["header"], values, images)
        values["footer"] = render(partials["footer"], values, images)
        values["main"] = render(body, values, images)
        html = render(partials["layout"], values, images)
        (ROOT / page.name).write_text(html, encoding="utf-8")
        if meta.get("robots", "").startswith("noindex") is False:
            built.append(path)
        print(f"  {page.name}")

    today = datetime.date.today().isoformat()
    urls = "\n".join(
        f"  <url><loc>{SITE_URL}/{p}</loc><lastmod>{today}</lastmod></url>" for p in built
    )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"{urls}\n</urlset>\n",
        encoding="utf-8",
    )
    (ROOT / "robots.txt").write_text(
        f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}/sitemap.xml\n", encoding="utf-8"
    )
    print(f"{len(built)} pages indexables, sitemap.xml et robots.txt générés.")


if __name__ == "__main__":
    main()
