#!/usr/bin/env python3
"""Génère les pages HTML du site Ancréal.

Chaque page de src/pages/ commence par un en-tête de métadonnées :

    ---
    title: Titre de la page
    description: Description pour les moteurs de recherche
    nav: modele            (lien de menu à marquer comme actif)
    crumb: Notre modèle    (libellé du fil d'Ariane, données structurées)
    type: article          (facultatif : page guide, balisée comme article)
    published: 2026-11-07  (facultatif, date de publication d'un article)
    ---

Les questions/réponses placées dans un bloc class="faq" (<details><summary>)
sont automatiquement balisées en FAQPage pour Google.

puis contient le HTML du <main>. Le script l'assemble avec les gabarits
de src/partials/ et écrit le résultat à la racine du dépôt.

Variables disponibles dans les pages et gabarits :
    {{img:cle}}   URL d'une image déclarée dans src/images.json
    {{site_url}}  URL publique du site (SITE_URL ci-dessous)
    {{year}}      année courante

Usage : python3 tools/build.py
"""
import datetime
import html as htmllib
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "src"

# URL publique du site, utilisée pour les liens canoniques, Open Graph et le sitemap.
# Domaine personnalisé servi par GitHub Pages (voir le fichier CNAME et le README).
SITE_URL = "https://ancreal.fr"

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


ORG_ID = SITE_URL + "/#organisation"
SITE_ID = SITE_URL + "/#site"

ORGANIZATION = {
    "@type": "Organization",
    "@id": ORG_ID,
    "name": "Ancréal",
    "alternateName": ["Ancreal", "ANCRÉAL"],
    "url": SITE_URL + "/",
    "logo": {"@type": "ImageObject", "url": SITE_URL + "/assets/img/logo-ancreal.png"},
    "image": SITE_URL + "/assets/img/og-ancreal.jpg",
    "slogan": "Un toit, une seconde chance.",
    "description": (
        "Société immobilière de l'Économie Sociale et Solidaire (ESS) dédiée au logement social "
        "et solidaire : acquisition, réhabilitation et location de logements conventionnés pour "
        "des personnes en réinsertion, dans le Grand Est."
    ),
    "founder": {"@type": "Person", "name": "Thomas Hoenig", "jobTitle": "Président"},
    "foundingDate": "2026",
    "email": "contact@groupecohesif.com",
    "telephone": "+33651951160",
    "address": {"@type": "PostalAddress", "addressRegion": "Grand Est", "addressCountry": "FR"},
    "areaServed": [
        {"@type": "AdministrativeArea", "name": "Grand Est"},
        {"@type": "AdministrativeArea", "name": "Alsace"},
        {"@type": "AdministrativeArea", "name": "Lorraine"},
        {"@type": "AdministrativeArea", "name": "Champagne-Ardenne"},
        {"@type": "Country", "name": "France"},
    ],
    "knowsAbout": [
        "Logement social", "Logement solidaire", "Logement conventionné",
        "Logement d'insertion", "Conventionnement Anah", "Loc'Avantages",
        "Intermédiation locative", "Réhabilitation de logements vacants",
        "Économie sociale et solidaire", "Investissement solidaire",
    ],
    "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "partenariats",
        "email": "contact@groupecohesif.com",
        "telephone": "+33651951160",
        "areaServed": "FR",
        "availableLanguage": "French",
    },
}

WEBSITE = {
    "@type": "WebSite",
    "@id": SITE_ID,
    "url": SITE_URL + "/",
    "name": "Ancréal",
    "description": "Logement social et solidaire dans le Grand Est",
    "inLanguage": "fr-FR",
    "publisher": {"@id": ORG_ID},
}


def strip_tags(fragment):
    text = re.sub(r"<[^>]+>", "", fragment)
    return re.sub(r"\s+", " ", htmllib.unescape(text)).strip()


def faq_items(body):
    """Extrait les questions/réponses des blocs <details> d'une page."""
    items = []
    for q, a in re.findall(r"<details>\s*<summary>(.*?)</summary>(.*?)</details>", body, re.S):
        items.append({
            "@type": "Question",
            "name": strip_tags(q),
            "acceptedAnswer": {"@type": "Answer", "text": strip_tags(a)},
        })
    return items


def jsonld(meta, body, canonical, title, description):
    page_id = canonical + "#page"
    graph = [ORGANIZATION, WEBSITE]
    is_article = meta.get("type") == "article"
    page = {
        "@type": "WebPage",
        "@id": page_id,
        "url": canonical,
        "name": title,
        "description": description,
        "inLanguage": "fr-FR",
        "isPartOf": {"@id": SITE_ID},
        "about": {"@id": ORG_ID},
        "primaryImageOfPage": SITE_URL + "/assets/img/og-ancreal.jpg",
    }
    crumb = meta.get("crumb")
    if crumb:
        page["breadcrumb"] = {"@id": canonical + "#ariane"}
        trail = [{"@type": "ListItem", "position": 1, "name": "Accueil", "item": SITE_URL + "/"}]
        if meta.get("parent"):
            label, _, href = meta["parent"].partition("|")
            trail.append({"@type": "ListItem", "position": 2, "name": label.strip(),
                          "item": f"{SITE_URL}/{href.strip()}"})
        trail.append({"@type": "ListItem", "position": len(trail) + 1, "name": crumb, "item": canonical})
        graph.append({"@type": "BreadcrumbList", "@id": canonical + "#ariane", "itemListElement": trail})
    graph.append(page)
    if is_article:
        published = meta.get("published", datetime.date.today().isoformat())
        graph.append({
            "@type": "Article",
            "@id": canonical + "#article",
            "headline": meta.get("headline", title)[:110],
            "description": description,
            "mainEntityOfPage": {"@id": page_id},
            "datePublished": published,
            "dateModified": datetime.date.today().isoformat(),
            "author": {"@type": "Person", "name": "Thomas Hoenig", "url": SITE_URL + "/a-propos.html"},
            "publisher": {"@id": ORG_ID},
            "image": SITE_URL + "/assets/img/og-ancreal.jpg",
            "inLanguage": "fr-FR",
        })
    faqs = faq_items(body)
    if faqs:
        graph.append({"@type": "FAQPage", "@id": canonical + "#faq", "mainEntity": faqs})
    data = {"@context": "https://schema.org", "@graph": graph}
    return json.dumps(data, ensure_ascii=False, indent=2).replace("</", "<\\/")


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
            "og_type": "article" if meta.get("type") == "article" else "website",
        }
        values["header"] = render(partials["header"], values, images)
        values["footer"] = render(partials["footer"], values, images)
        values["main"] = render(body, values, images)
        values["jsonld"] = jsonld(meta, values["main"], values["canonical"], meta["title"], meta["description"])
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
