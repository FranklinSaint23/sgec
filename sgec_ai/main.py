from fastapi import FastAPI
from pydantic import BaseModel
from typing import List, Optional
from rapidfuzz import fuzz

app = FastAPI()

# ── helpers ──────────────────────────────────────────────────────────────────

def similarity(a: str, b: str) -> float:
    return fuzz.token_sort_ratio(a.lower(), b.lower()) / 100.0

# ── naissance ─────────────────────────────────────────────────────────────────

class Candidat(BaseModel):
    id: int
    nom: str
    date_naiss: str
    nom_pere: Optional[str] = ""
    nom_mere: Optional[str] = ""

class NouvelActe(BaseModel):
    nom: str
    date_naiss: str
    nom_pere: Optional[str] = ""
    nom_mere: Optional[str] = ""

class CheckRequest(BaseModel):
    nouvel_acte: NouvelActe
    candidats: List[Candidat]
    seuil: float = 0.80

def texte_naissance(nom, date_naiss, nom_pere, nom_mere):
    return f"{nom} {date_naiss} {nom_pere} {nom_mere}".strip()

@app.post("/detect-duplicate/naissance")
def detect_duplicate(payload: CheckRequest):
    if not payload.candidats:
        return {"doublons_potentiels": []}

    texte_nouveau = texte_naissance(
        payload.nouvel_acte.nom, payload.nouvel_acte.date_naiss,
        payload.nouvel_acte.nom_pere, payload.nouvel_acte.nom_mere
    )

    resultats = []
    for c in payload.candidats:
        texte_c = texte_naissance(c.nom, c.date_naiss, c.nom_pere, c.nom_mere)
        score = similarity(texte_nouveau, texte_c)
        if c.date_naiss == payload.nouvel_acte.date_naiss:
            score = min(score + 0.10, 1.0)
        if score >= payload.seuil:
            resultats.append({"id": c.id, "nom": c.nom, "date_naiss": c.date_naiss, "score": round(score, 3)})

    resultats.sort(key=lambda r: r["score"], reverse=True)
    return {"doublons_potentiels": resultats}

# ── mariage ───────────────────────────────────────────────────────────────────

class CandidatMariage(BaseModel):
    id: int
    nom_homme: str
    nom_femme: str
    date_naiss_homme: Optional[str] = ""
    date_naiss_femme: Optional[str] = ""

class NouvelActeMariage(BaseModel):
    nom_homme: str
    nom_femme: str
    date_naiss_homme: Optional[str] = ""
    date_naiss_femme: Optional[str] = ""

class CheckMariageRequest(BaseModel):
    nouvel_acte: NouvelActeMariage
    candidats: List[CandidatMariage]
    seuil: float = 0.80

@app.post("/detect-duplicate/mariage")
def detect_duplicate_mariage(payload: CheckMariageRequest):
    if not payload.candidats:
        return {"doublons_potentiels": []}

    def texte(nom_h, nom_f, dn_h, dn_f):
        return f"{nom_h} {nom_f} {dn_h} {dn_f}".strip()

    texte_nouveau = texte(
        payload.nouvel_acte.nom_homme, payload.nouvel_acte.nom_femme,
        payload.nouvel_acte.date_naiss_homme, payload.nouvel_acte.date_naiss_femme
    )

    resultats = []
    for c in payload.candidats:
        score = similarity(texte_nouveau, texte(c.nom_homme, c.nom_femme, c.date_naiss_homme, c.date_naiss_femme))
        if score >= payload.seuil:
            resultats.append({"id": c.id, "nom_homme": c.nom_homme, "nom_femme": c.nom_femme, "score": round(score, 3)})

    resultats.sort(key=lambda r: r["score"], reverse=True)
    return {"doublons_potentiels": resultats}

# ── décès ─────────────────────────────────────────────────────────────────────

class CandidatDeces(BaseModel):
    id: int
    nom_decede: str
    date_deces: str
    lieu_deces: Optional[str] = ""

class NouvelActeDeces(BaseModel):
    nom_decede: str
    date_deces: str
    lieu_deces: Optional[str] = ""

class CheckDecesRequest(BaseModel):
    nouvel_acte: NouvelActeDeces
    candidats: List[CandidatDeces]
    seuil: float = 0.80

@app.post("/detect-duplicate/deces")
def detect_duplicate_deces(payload: CheckDecesRequest):
    if not payload.candidats:
        return {"doublons_potentiels": []}

    def texte(nom, date, lieu):
        return f"{nom} {date} {lieu}".strip()

    texte_nouveau = texte(
        payload.nouvel_acte.nom_decede, payload.nouvel_acte.date_deces, payload.nouvel_acte.lieu_deces
    )

    resultats = []
    for c in payload.candidats:
        score = similarity(texte_nouveau, texte(c.nom_decede, c.date_deces, c.lieu_deces))
        if c.date_deces == payload.nouvel_acte.date_deces:
            score = min(score + 0.10, 1.0)
        if score >= payload.seuil:
            resultats.append({"id": c.id, "nom_decede": c.nom_decede, "date_deces": c.date_deces, "score": round(score, 3)})

    resultats.sort(key=lambda r: r["score"], reverse=True)
    return {"doublons_potentiels": resultats}

# ── recherche approximative ───────────────────────────────────────────────────

class RecordItem(BaseModel):
    id: int
    texte: str

class SearchRequest(BaseModel):
    query: str
    records: List[RecordItem]
    top_k: int = 10

@app.post("/search/approximate")
def search_approximate(payload: SearchRequest):
    if not payload.records:
        return {"resultats": []}

    resultats = sorted(
        [{"id": r.id, "score": round(similarity(payload.query, r.texte), 3)} for r in payload.records],
        key=lambda x: x["score"],
        reverse=True
    )
    return {"resultats": resultats[:payload.top_k]}

# ── comportements suspects ────────────────────────────────────────────────────

class ActionUtilisateur(BaseModel):
    user_id: int
    username: str
    total_actions: int
    creations: int
    modifications: int
    suppressions: int
    ip_distinctes: int
    actions_hors_horaires: int
    types_actes_distincts: int

class AnalyseRequest(BaseModel):
    utilisateurs: List[ActionUtilisateur]

def analyser_utilisateur(u: ActionUtilisateur) -> dict:
    raisons = []
    taux_suppression = u.suppressions / u.total_actions if u.total_actions else 0

    if u.total_actions >= 50:
        raisons.append(f"Volume d'actions anormalement élevé ({u.total_actions} sur la période)")
    if taux_suppression > 0.3:
        raisons.append(f"Taux de suppression élevé ({round(taux_suppression * 100)}%)")
    if u.ip_distinctes > 2:
        raisons.append(f"{u.ip_distinctes} adresses IP différentes utilisées")
    if u.actions_hors_horaires > 0:
        raisons.append(f"{u.actions_hors_horaires} action(s) hors des horaires de bureau (avant 6h ou après 22h)")
    if u.types_actes_distincts >= 3 and u.total_actions >= 10:
        raisons.append("Activité dispersée sur tous les types d'actes en peu de temps")

    niveau = "élevé" if len(raisons) >= 3 else "moyen" if len(raisons) >= 1 else "normal"
    return {"user_id": u.user_id, "username": u.username, "niveau": niveau, "raisons": raisons}

@app.post("/detect-suspicious-behavior")
def detect_suspicious_behavior(payload: AnalyseRequest):
    resultats = [analyser_utilisateur(u) for u in payload.utilisateurs]
    alertes = [r for r in resultats if r["niveau"] != "normal"]
    alertes.sort(key=lambda r: len(r["raisons"]), reverse=True)
    return {"alertes": alertes, "total_utilisateurs_analyses": len(resultats)}
