"""Disease search using curated research knowledge base."""

from app.models.schemas import DiseaseSearchResult

DISEASE_DB = {
    "alzheimer": DiseaseSearchResult(
        name="Alzheimer's Disease",
        overview=(
            "A progressive neurodegenerative disorder characterized by cognitive decline. "
            "Research focuses on cholinergic signaling, amyloid plaques, and tau pathology."
        ),
        associated_targets=["ACHE", "BACE1", "GRIN1", "APP"],
        potential_candidates=["Donepezil", "Memantine", "Galantamine"],
        is_demo=False,
    ),
    "alzheimer's disease": DiseaseSearchResult(
        name="Alzheimer's Disease",
        overview=(
            "A progressive neurodegenerative disorder characterized by cognitive decline."
        ),
        associated_targets=["ACHE", "BACE1", "GRIN1", "APP"],
        potential_candidates=["Donepezil", "Memantine", "Galantamine"],
        is_demo=False,
    ),
    "cardiovascular disease": DiseaseSearchResult(
        name="Cardiovascular Disease",
        overview="Disorders of the heart and blood vessels including atherosclerosis and hypertension.",
        associated_targets=["PTGS2", "ACE", "HMGCR"],
        potential_candidates=["Aspirin", "Atorvastatin"],
        is_demo=False,
    ),
    "type 2 diabetes": DiseaseSearchResult(
        name="Type 2 Diabetes",
        overview="Metabolic disorder with insulin resistance and elevated blood glucose.",
        associated_targets=["AMPK", "DPP4", "SLC2A4"],
        potential_candidates=["Metformin"],
        is_demo=False,
    ),
    "inflammation": DiseaseSearchResult(
        name="Inflammation",
        overview="Immune response involving cytokines and prostaglandin pathways.",
        associated_targets=["PTGS2", "TNF", "IL6"],
        potential_candidates=["Ibuprofen", "Aspirin"],
        is_demo=False,
    ),
    "pulmonary hypertension": DiseaseSearchResult(
        name="Pulmonary Hypertension",
        overview="Elevated blood pressure in pulmonary arteries affecting heart function.",
        associated_targets=["PDE5A", "EDNRA", "BMPR2"],
        potential_candidates=["Sildenafil"],
        is_demo=False,
    ),
}


async def search_disease(query: str) -> DiseaseSearchResult:
    key = query.strip().lower()
    if key in DISEASE_DB:
        return DISEASE_DB[key]
    for k, v in DISEASE_DB.items():
        if key in k or k in key:
            return v.model_copy(update={"name": query.title()})
    return DiseaseSearchResult(
        name=query.title(),
        overview=(
            f"Limited curated data for '{query}'. "
            "Results are computational research placeholders — not clinical evidence."
        ),
        associated_targets=["Unknown — dataset expansion needed"],
        potential_candidates=[],
        is_demo=True,
    )
