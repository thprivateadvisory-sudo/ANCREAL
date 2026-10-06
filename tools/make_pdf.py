#!/usr/bin/env python3
"""Génère la plaquette PDF à partir de tools/plaquette.html.

Prérequis : pip install playwright (Chromium installé).
Usage : python3 tools/make_pdf.py [chemin-vers-chromium]
"""
import asyncio
import pathlib
import sys

from playwright.async_api import async_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = ROOT / "tools" / "plaquette.html"
TARGET = ROOT / "assets" / "docs" / "Ancreal_Plaquette_Partenaires.pdf"


async def main():
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        options = {"executable_path": sys.argv[1]} if len(sys.argv) > 1 else {}
        browser = await p.chromium.launch(**options)
        page = await browser.new_page()
        await page.goto(SOURCE.as_uri())
        await page.evaluate("document.fonts.ready")
        await page.pdf(path=str(TARGET), format="A4", print_background=True, prefer_css_page_size=True)
        await browser.close()
    print(f"PDF généré : {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    asyncio.run(main())
