"""PubChem REST API integration for drug compound data."""

from __future__ import annotations

import httpx

from app.models.schemas import DrugSearchResult
from app.utils.config import get_settings

DEMO_DRUGS = {
    "aspirin": DrugSearchResult(
        name="Aspirin",
        external_id="CID2244",
        molecular_formula="C9H8O4",
        molecular_weight=180.16,
        smiles="CC(=O)OC1=CC=CC=C1C(=O)O",
        targets=["PTGS1", "PTGS2"],
        bioactivity={"source": "Demo / Sample Data", "note": "Illustrative bioactivity"},
        is_demo=True,
    ),
    "metformin": DrugSearchResult(
        name="Metformin",
        external_id="CID4091",
        molecular_formula="C4H11N5",
        molecular_weight=129.16,
        smiles="CN(C)C(=N)NC(=N)N",
        targets=["AMPK"],
        bioactivity={"source": "Demo / Sample Data"},
        is_demo=True,
    ),
    "donepezil": DrugSearchResult(
        name="Donepezil",
        external_id="CID3152",
        molecular_formula="C24H29NO3",
        molecular_weight=379.49,
        smiles="COc1ccc2c(c1)cc(cn2)C(=O)OCC",
        targets=["ACHE"],
        bioactivity={"source": "Demo / Sample Data"},
        is_demo=True,
    ),
}


async def search_drug(query: str) -> DrugSearchResult:
    settings = get_settings()
    key = query.strip().lower()
    if settings.demo_mode or key in DEMO_DRUGS:
        if key in DEMO_DRUGS:
            return DEMO_DRUGS[key]
        return _generic_demo(query)

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            name_url = f"{settings.pubchem_base_url}/compound/name/{query}/cids/JSON"
            resp = await client.get(name_url)
            if resp.status_code != 200:
                return _generic_demo(query)
            cids = resp.json().get("IdentifierList", {}).get("CID", [])
            if not cids:
                return _generic_demo(query)
            cid = cids[0]
            prop_url = (
                f"{settings.pubchem_base_url}/compound/cid/{cid}/property/"
                "MolecularFormula,MolecularWeight,CanonicalSMILES/JSON"
            )
            prop_resp = await client.get(prop_url)
            props = {}
            if prop_resp.status_code == 200:
                props = prop_resp.json().get("PropertyTable", {}).get("Properties", [{}])[0]
            return DrugSearchResult(
                name=query.title(),
                external_id=f"CID{cid}",
                molecular_formula=props.get("MolecularFormula"),
                molecular_weight=props.get("MolecularWeight"),
                smiles=props.get("CanonicalSMILES") or props.get("ConnectivitySMILES"),
                targets=[],
                bioactivity={"source": "PubChem", "cid": cid},
                is_demo=False,
            )
    except Exception:
        return _generic_demo(query)


def _generic_demo(query: str) -> DrugSearchResult:
    return DrugSearchResult(
        name=query.title(),
        external_id="DEMO",
        molecular_formula=None,
        molecular_weight=None,
        smiles=None,
        targets=[],
        bioactivity={"source": "Demo / Sample Data", "note": "Live API unavailable"},
        is_demo=True,
    )
