#!/usr/bin/env python3
"""Simulateur Ancréal : une opération (achat, travaux, location) puis le parc sur N ans.

Usage :
  python3 .claude/skills/founder/sim_ancreal.py                 # opération type du site
  python3 .claude/skills/founder/sim_ancreal.py --achat 55000 --travaux 45000 --loyer 520
  python3 .claude/skills/founder/sim_ancreal.py --montecarlo 5000
  python3 .claude/skills/founder/sim_ancreal.py --json            # sortie machine

Toutes les valeurs par défaut sont des HYPOTHÈSES à remplacer par des devis réels
(notaire, Cohesif BTP, banque, bailleur). Rien ici n'est un conseil financier.
"""
import argparse
import json
import random
import statistics


def mensualite(capital, taux_annuel, annees):
    if capital <= 0:
        return 0.0
    r = taux_annuel / 12
    n = annees * 12
    if r == 0:
        return capital / n
    return capital * r / (1 - (1 + r) ** -n)


def operation(p):
    """Calcule une opération à partir d'un dict de paramètres."""
    frais_notaire = p["achat"] * p["frais_notaire_pct"]
    cout_total = p["achat"] + frais_notaire + p["travaux"] * (1 + p["aleas_travaux_pct"])
    aides = p["aides"]
    pret = (cout_total - aides) * p["part_pret"]
    apport = cout_total - aides - pret
    # Intérêts intercalaires pendant le différé (travaux), payés sur l'apport
    interets_differe = pret * p["taux"] * p["mois_travaux"] / 12
    apport_total = apport + interets_differe
    m = mensualite(pret, p["taux"], p["duree_ans"])
    assurance_emprunteur = pret * p["assurance_pret_pct"] / 12

    loyer_encaisse = p["loyer"] * (1 - p["vacance_pct"])
    charges = (
        p["taxe_fonciere"] / 12
        + p["assurance_pno"] / 12
        + p["loyer"] * p["entretien_pct"]
        + p["loyer"] * p["gestion_pct"]
    )
    cash_flow = loyer_encaisse - charges - m - assurance_emprunteur
    dscr = (loyer_encaisse - charges) / (m + assurance_emprunteur) if m else float("inf")
    # Loyer minimum pour cash-flow nul (résolution linéaire)
    fixe = p["taxe_fonciere"] / 12 + p["assurance_pno"] / 12 + m + assurance_emprunteur
    coef = (1 - p["vacance_pct"]) - p["entretien_pct"] - p["gestion_pct"]
    loyer_equilibre = fixe / coef
    loyer_banque = (p["taxe_fonciere"] / 12 + p["assurance_pno"] / 12 + 1.2 * (m + assurance_emprunteur)) / coef
    rendement_brut = p["loyer"] * 12 / cout_total
    return {
        "cout_total": round(cout_total),
        "frais_notaire": round(frais_notaire),
        "pret": round(pret),
        "apport_a_trouver": round(apport_total),
        "mensualite_credit": round(m + assurance_emprunteur),
        "charges_mensuelles": round(charges),
        "loyer_encaisse": round(loyer_encaisse),
        "cash_flow_mensuel": round(cash_flow),
        "cash_flow_annuel": round(cash_flow * 12),
        "dscr": round(dscr, 2),
        "loyer_equilibre": round(loyer_equilibre),
        "loyer_pour_banque_dscr_1_2": round(loyer_banque),
        "rendement_brut_pct": round(rendement_brut * 100, 2),
    }


def parc(p, annees=10, apport_initial=None):
    """Projection du parc : on lance une nouvelle opération dès que la trésorerie
    couvre l'apport. Hypothèse : 1 logement par opération, pas de cession."""
    op = operation(p)
    tresorerie = op["apport_a_trouver"] if apport_initial is None else apport_initial
    logements, en_travaux, lignes = 0, [], []
    apport_ext_annuel = p["apport_externe_annuel"]
    for an in range(1, annees + 1):
        tresorerie += apport_ext_annuel
        # mises en location
        livrees = [t for t in en_travaux if t <= an]
        logements += len(livrees)
        en_travaux = [t for t in en_travaux if t > an]
        tresorerie += logements * op["cash_flow_annuel"] * (1 - p["is_pct"] if op["cash_flow_annuel"] > 0 else 1)
        lancees = 0
        while tresorerie >= op["apport_a_trouver"] and lancees < p["max_ops_par_an"]:
            tresorerie -= op["apport_a_trouver"]
            en_travaux.append(an + 1)
            lancees += 1
        lignes.append({"annee": an, "logements_loues": logements, "en_travaux": len(en_travaux),
                       "lancees": lancees, "tresorerie": round(tresorerie)})
    return lignes


def montecarlo(p, n, seed=42):
    rnd = random.Random(seed)
    cfs, apports, negatifs = [], [], 0
    for _ in range(n):
        q = dict(p)
        q["aleas_travaux_pct"] = max(0, rnd.gauss(p["aleas_travaux_pct"] + 0.05, 0.10))
        q["vacance_pct"] = min(0.5, max(0, rnd.gauss(p["vacance_pct"], 0.04)))
        q["taux"] = max(0.01, rnd.gauss(p["taux"], 0.005))
        q["achat"] = p["achat"] * rnd.uniform(0.85, 1.15)
        q["aides"] = p["aides"] * rnd.choice([0, 0.5, 1, 1])  # aides incertaines
        q["entretien_pct"] = max(0.02, rnd.gauss(p["entretien_pct"], 0.03))
        o = operation(q)
        cfs.append(o["cash_flow_mensuel"])
        apports.append(o["apport_a_trouver"])
        negatifs += o["cash_flow_mensuel"] < 0
    cfs.sort(); apports.sort()
    pct = lambda xs, k: xs[int(k * (len(xs) - 1))]
    return {
        "tirages": n,
        "cash_flow_mensuel_p10": pct(cfs, 0.10),
        "cash_flow_mensuel_median": pct(cfs, 0.5),
        "cash_flow_mensuel_p90": pct(cfs, 0.90),
        "proba_cash_flow_negatif_pct": round(100 * negatifs / n, 1),
        "apport_median": pct(apports, 0.5),
        "apport_p90": pct(apports, 0.9),
    }


DEFAUTS = {
    # Opération type affichée sur le site : ~100 k€ achat + travaux, 70 % de prêt, loyer 500 €
    "achat": 50000, "travaux": 50000, "frais_notaire_pct": 0.08, "aleas_travaux_pct": 0.10,
    "aides": 0, "part_pret": 0.70, "taux": 0.040, "duree_ans": 20, "assurance_pret_pct": 0.003,
    "mois_travaux": 8, "loyer": 500, "vacance_pct": 0.05, "taxe_fonciere": 800,
    "assurance_pno": 180, "entretien_pct": 0.05, "gestion_pct": 0.07,
    "is_pct": 0.15, "apport_externe_annuel": 0, "max_ops_par_an": 3,
}


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    for k, v in DEFAUTS.items():
        ap.add_argument("--" + k.replace("_", "-"), type=type(v), default=v)
    ap.add_argument("--annees", type=int, default=10)
    ap.add_argument("--montecarlo", type=int, default=0)
    ap.add_argument("--json", action="store_true")
    a = vars(ap.parse_args())
    p = {k: a[k] for k in DEFAUTS}
    out = {"hypotheses": p, "operation": operation(p), "parc": parc(p, a["annees"])}
    if a["montecarlo"]:
        out["montecarlo"] = montecarlo(p, a["montecarlo"])
    if a["json"]:
        print(json.dumps(out, ensure_ascii=False, indent=2)); return
    o = out["operation"]
    print("== Opération")
    for k, v in o.items():
        print(f"  {k:<28} {v:>10}")
    verdict = "OK" if o["dscr"] >= 1.2 else ("FRAGILE" if o["dscr"] >= 1 else "NON FINANÇABLE en l'état")
    print(f"  -> verdict banque (DSCR >= 1,2) : {verdict}")
    print(f"\n== Parc sur {a['annees']} ans (réinvestissement des excédents)")
    for l in out["parc"]:
        print(f"  an {l['annee']:>2} : {l['logements_loues']:>2} loués, {l['en_travaux']} en travaux, trésorerie {l['tresorerie']:>8} €")
    if "montecarlo" in out:
        print("\n== Monte Carlo (dérapage travaux, vacance, taux, prix, aides)")
        for k, v in out["montecarlo"].items():
            print(f"  {k:<30} {v:>10}")


if __name__ == "__main__":
    main()
