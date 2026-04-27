import json
import math
from pathlib import Path

import pandas as pd


SOURCE = Path("/Users/jominseo/Downloads/OECD Dataset.xlsx")
SHEET = "complete_p4d3_df"
OUT = Path(__file__).resolve().parents[1] / "data" / "oecd-data.js"

USECOLS = [
    "year",
    "country",
    "region",
    "region_macro",
    "organization_name",
    "Donor_country",
    "sector_description",
    "subsector_description",
    "grant_recipient_project_title",
    "project_description",
    "usd_disbursements_defl",
]

PROJECTS = [
    {
        "id": "offline-learning-ghana",
        "title": "Offline-first learning app for rural schools",
        "country": "Ghana",
        "region": "West Africa",
        "sector": "Education",
        "keywords": [
            "education",
            "learning",
            "digital",
            "school",
            "schools",
            "rural",
            "students",
            "access",
            "offline",
        ],
    },
    {
        "id": "maternal-health-india",
        "title": "Digital maternal health triage tool",
        "country": "India",
        "region": "South Asia",
        "sector": "Health",
        "keywords": ["maternal", "health", "clinic", "pregnant", "pregnancy", "rural", "digital", "triage"],
    },
    {
        "id": "sms-climate-kenya",
        "title": "SMS climate alert system for smallholder farmers",
        "country": "Kenya",
        "region": "East Africa",
        "sector": "Climate / Agriculture",
        "keywords": ["climate", "agriculture", "farmer", "farmers", "crop", "smallholder", "weather", "adaptation"],
    },
    {
        "id": "water-quality-nigeria",
        "title": "Community water quality reporting tool",
        "country": "Nigeria",
        "region": "West Africa",
        "sector": "Civic Tech / Health",
        "keywords": ["water", "quality", "health", "community", "reporting", "civic", "safety"],
    },
    {
        "id": "telemedicine-indonesia",
        "title": "Low-cost telemedicine access kiosk",
        "country": "Indonesia",
        "region": "Southeast Asia",
        "sector": "Health",
        "keywords": ["telemedicine", "health", "rural", "clinic", "patient", "healthcare", "access", "digital"],
    },
]


def clean_value(value):
    if pd.isna(value):
        return None
    if isinstance(value, (pd.Timestamp,)):
        return value.isoformat()
    if isinstance(value, (int, float)):
        if math.isnan(value) or math.isinf(value):
            return None
        return float(value)
    return str(value).strip()


def money_millions(value):
    value = float(value or 0)
    return value


def format_amount(millions):
    millions = float(millions or 0)
    if millions >= 1000:
        return f"${millions / 1000:.1f}B"
    if millions >= 1:
        return f"${millions:.1f}M"
    return f"${millions * 1000:.0f}K"


def record_to_project(row, score=None, reason=None):
    return {
        "title": clean_value(row.get("grant_recipient_project_title")) or "Untitled funded project",
        "description": clean_value(row.get("project_description")) or "",
        "donor": clean_value(row.get("organization_name")) or "Unknown funder",
        "donorCountry": clean_value(row.get("Donor_country")) or "Unknown",
        "country": clean_value(row.get("country")) or "Unknown",
        "region": clean_value(row.get("region")) or clean_value(row.get("region_macro")) or "Unknown",
        "sector": clean_value(row.get("sector_description")) or "Unspecified",
        "subsector": clean_value(row.get("subsector_description")) or "Unspecified",
        "year": int(row.get("year")) if not pd.isna(row.get("year")) else None,
        "amount": money_millions(row.get("usd_disbursements_defl")),
        "amountLabel": format_amount(row.get("usd_disbursements_defl")),
        "relevance": reason or "Related project description and sector",
        "score": int(score or 0),
    }


def sector_terms(sector):
    sector = sector.lower()
    if "education" in sector:
        return ["education", "learning", "school", "teacher", "student", "digital"]
    if "health" in sector:
        return ["health", "clinic", "maternal", "patient", "medical", "digital"]
    if "climate" in sector or "agriculture" in sector:
        return ["climate", "agriculture", "farmer", "crop", "adaptation", "weather"]
    if "water" in sector or "civic" in sector:
        return ["water", "community", "health", "reporting", "public", "civic"]
    return [sector]


def similarity_reason(row, project, sector_hit, country_hit, keyword_hits):
    pieces = []
    if country_hit:
        pieces.append("same recipient country")
    if sector_hit:
        pieces.append("similar sector")
    if keyword_hits:
        pieces.append("related project language")
    if not pieces:
        pieces.append("adjacent funding theme")
    return " and ".join(pieces).capitalize()


def find_similar(df, project, limit=8):
    keywords = set(project["keywords"] + sector_terms(project["sector"]))
    text = (
        df["grant_recipient_project_title"].fillna("").astype(str)
        + " "
        + df["project_description"].fillna("").astype(str)
        + " "
        + df["sector_description"].fillna("").astype(str)
        + " "
        + df["subsector_description"].fillna("").astype(str)
    ).str.lower()
    sector_text = (df["sector_description"].fillna("").astype(str) + " " + df["subsector_description"].fillna("").astype(str)).str.lower()
    country_hit = df["country"].fillna("").astype(str).str.lower().eq(project["country"].lower())
    sector_words = [w for w in sector_terms(project["sector"]) if len(w) > 3]
    sector_hit = sector_text.apply(lambda v: any(w in v for w in sector_words))
    keyword_scores = pd.Series(0, index=df.index)
    for keyword in keywords:
        keyword_scores += text.str.contains(keyword, regex=False).astype(int)
    amount_score = pd.to_numeric(df["usd_disbursements_defl"], errors="coerce").fillna(0).clip(upper=100) / 100
    score = keyword_scores * 3 + sector_hit.astype(int) * 5 + country_hit.astype(int) * 7 + amount_score
    candidates = df.assign(_score=score, _country_hit=country_hit, _sector_hit=sector_hit, _keyword_score=keyword_scores)
    candidates = candidates[candidates["_score"] > 7].sort_values("_score", ascending=False).head(limit)
    results = []
    for _, row in candidates.iterrows():
        reason = similarity_reason(row, project, bool(row["_sector_hit"]), bool(row["_country_hit"]), int(row["_keyword_score"]))
        results.append(record_to_project(row, row["_score"], reason))
    return results


def top_group(df, by, limit=8):
    grouped = (
        df.dropna(subset=[by])
        .groupby(by, dropna=True)["usd_disbursements_defl"]
        .sum()
        .sort_values(ascending=False)
        .head(limit)
    )
    return [{"label": str(idx), "amount": float(val), "amountLabel": format_amount(val)} for idx, val in grouped.items()]


def count_group(df, by, limit=8):
    grouped = df.dropna(subset=[by]).groupby(by).size().sort_values(ascending=False).head(limit)
    return [{"label": str(idx), "count": int(val)} for idx, val in grouped.items()]


def donor_relevance(df, project, limit=5):
    similar = find_similar(df, project, limit=80)
    sim_df = pd.DataFrame(similar)
    if sim_df.empty:
        return []
    grouped = (
        sim_df.groupby("donor")
        .agg(amount=("amount", "sum"), records=("title", "count"), countries=("country", lambda values: sorted(set(values))[:3]))
        .sort_values(["records", "amount"], ascending=False)
        .head(limit)
    )
    funders = []
    for donor, row in grouped.iterrows():
        records = int(row["records"])
        fit = "High" if records >= 4 else "Medium-High" if records >= 2 else "Medium"
        countries = ", ".join(row["countries"])
        funders.append(
            {
                "name": donor,
                "fit": fit,
                "reason": f"Historical OECD records include {records} related grant{'s' if records != 1 else ''} touching {project['sector'].lower()} themes in {countries}.",
                "amountLabel": format_amount(row["amount"]),
            }
        )
    return funders


def gap_signal(df, project):
    sector_words = sector_terms(project["sector"])
    text = (
        df["sector_description"].fillna("").astype(str)
        + " "
        + df["subsector_description"].fillna("").astype(str)
        + " "
        + df["grant_recipient_project_title"].fillna("").astype(str)
        + " "
        + df["project_description"].fillna("").astype(str)
    ).str.lower()
    sector_mask = pd.Series(False, index=df.index)
    for word in sector_words:
        sector_mask |= text.str.contains(word, regex=False)
    sector_df = df[sector_mask].copy()
    if sector_df.empty:
        return {
            "label": "Needs Review",
            "countrySectorAmountLabel": "$0",
            "sectorMedianCountryAmountLabel": "$0",
            "interpretation": "Not enough OECD records matched this sector theme.",
        }
    by_country = sector_df.groupby("country")["usd_disbursements_defl"].sum().sort_values(ascending=False)
    country_amount = float(by_country.get(project["country"], 0))
    median_amount = float(by_country.median()) if len(by_country) else 0
    rank = int((by_country > country_amount).sum() + 1) if country_amount else None
    percentile = float((by_country < country_amount).sum() / max(len(by_country), 1))
    if country_amount < median_amount:
        label = "High"
    elif percentile < 0.6:
        label = "Medium-High"
    else:
        label = "Medium"
    return {
        "label": label,
        "countrySectorAmount": country_amount,
        "countrySectorAmountLabel": format_amount(country_amount),
        "sectorMedianCountryAmount": median_amount,
        "sectorMedianCountryAmountLabel": format_amount(median_amount),
        "sectorMatchedCountries": int(by_country.shape[0]),
        "countryRank": rank,
        "interpretation": "This is a funding-pattern signal for further review, not a conclusion about merit or investability.",
    }


def main():
    df = pd.read_excel(SOURCE, sheet_name=SHEET, usecols=lambda c: c in USECOLS)
    df["usd_disbursements_defl"] = pd.to_numeric(df["usd_disbursements_defl"], errors="coerce").fillna(0)
    df["_year_numeric"] = pd.to_numeric(
        df["year"].astype(str).str.extract(r"(\d{4})", expand=False),
        errors="coerce",
    )
    df = df[df["usd_disbursements_defl"] >= 0].copy()

    total = float(df["usd_disbursements_defl"].sum())
    by_year = (
        df.dropna(subset=["_year_numeric"])
        .groupby("_year_numeric")["usd_disbursements_defl"]
        .sum()
        .sort_index()
    )

    project_intel = {}
    for project in PROJECTS:
        project_intel[project["id"]] = {
            "similarProjects": find_similar(df, project, limit=10),
            "potentialFunders": donor_relevance(df, project, limit=5),
            "gapSignal": gap_signal(df, project),
        }

    payload = {
        "source": {
            "file": str(SOURCE),
            "sheet": SHEET,
            "amountField": "usd_disbursements_defl",
            "amountUnit": "USD millions, deflated",
        },
        "metrics": {
            "totalFunding": total,
            "totalFundingLabel": format_amount(total),
            "recordCount": int(df.shape[0]),
            "recordCountLabel": f"{df.shape[0] // 1000}K+",
            "recipientCountries": int(df["country"].nunique(dropna=True)),
            "donorOrganizations": int(df["organization_name"].nunique(dropna=True)),
        },
        "fundingByYear": [
            {"year": int(year), "amount": float(amount), "amountLabel": format_amount(amount)}
            for year, amount in by_year.items()
        ],
        "topRecipientCountries": top_group(df, "country", 10),
        "topSectors": top_group(df, "sector_description", 10),
        "topFunders": top_group(df, "organization_name", 10),
        "topDonorCountries": top_group(df, "Donor_country", 8),
        "recordCounts": {
            "countries": count_group(df, "country", 10),
            "sectors": count_group(df, "sector_description", 10),
        },
        "projectIntel": project_intel,
        "responsibleNotes": [
            "Similarity to past funded projects shows funder relevance, not project quality.",
            "Verification status: Self-reported.",
            "Underfunding is a signal, not a conclusion.",
            "Opportunity Atlas does not automatically decide who deserves funding. It helps funders discover, compare, and review overlooked local projects.",
        ],
    }

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text("window.OECD_DATA = " + json.dumps(payload, indent=2) + ";\n", encoding="utf-8")
    print(json.dumps({"output": str(OUT), "records": payload["metrics"]["recordCount"], "total": payload["metrics"]["totalFundingLabel"]}))


if __name__ == "__main__":
    main()
