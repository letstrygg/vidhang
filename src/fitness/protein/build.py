import json
from pathlib import Path
from . import db

AFFILIATE_TAG = "vidhang-20"


def get_cost_tier(dollars_per_gram: float) -> tuple[str, str]:
    """Returns (symbol, css_class) based on $/gram of protein."""
    if dollars_per_gram <= 0.040:
        return "$", "tier-green"
    elif dollars_per_gram <= 0.055:
        return "$$", "tier-yellow"
    else:
        return "$$$", "tier-red"


def transform_row(row: dict) -> dict:
    total_protein_g = row["servings"] * row["protein_per_serving_g"]
    dollars_per_gram = row["price"] / total_protein_g if total_protein_g > 0 else 999.0
    tier_symbol, tier_class = get_cost_tier(dollars_per_gram)
    protein_cal_pct = round((row["protein_per_serving_g"] * 4.0 / row["calories_per_serving"]) * 100, 1)

    return {
        # Internal sort key (stripped before writing public JSON)
        "_dollars_per_gram": dollars_per_gram,
        # Public fields
        "slug": row["slug"],
        "asin": row["asin"],
        "brand": row["brand"],
        "name": row["name"],
        "flavor": row["flavor"],
        "size_label": row["size_label"],
        "cost_tier": tier_symbol,
        "cost_tier_class": tier_class,
        "protein_per_serving_g": row["protein_per_serving_g"],
        "calories_per_serving": row["calories_per_serving"],
        "protein_per_calorie_pct": protein_cal_pct,
        "amazon_url": f"https://www.amazon.com/dp/{row['asin']}/?tag={AFFILIATE_TAG}",
        "detail_url": f"{row['slug']}.html",
        "notes": row["notes"] or ""
    }


def render_index_html(items: list[dict]) -> str:
    rows = []
    for rank, item in enumerate(items, start=1):
        rows.append(f"""
        <tr>
            <td>#{rank}</td>
            <td><span class="badge {item['cost_tier_class']}">{item['cost_tier']}</span></td>
            <td><a href="{item['detail_url']}"><strong>{item['brand']} – {item['name']}</strong></a><br>
                <small>{item['flavor']} ({item['size_label']})</small></td>
            <td>{item['protein_per_calorie_pct']}%</td>
            <td>{item['protein_per_serving_g']:g}g / {item['calories_per_serving']} cal</td>
            <td><a href="{item['amazon_url']}" target="_blank" rel="nofollow noopener sponsored">Amazon</a></td>
        </tr>""")

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Protein Powder Value Rankings | VidHang</title>
    <style>
        body {{ font-family: system-ui, sans-serif; max-width: 960px; margin: 2rem auto; padding: 0 1rem; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 1rem; }}
        th, td {{ border-bottom: 1px solid #ddd; padding: 0.75rem; text-align: left; }}
        th {{ background: #f4f4f4; }}
        .badge {{ display: inline-block; padding: 0.25rem 0.6rem; border-radius: 4px; font-weight: bold; font-family: monospace; font-size: 1rem; }}
        .tier-green {{ background: #d4edda; color: #155724; }}
        .tier-yellow {{ background: #fff3cd; color: #856404; }}
        .tier-red {{ background: #f8d7da; color: #721c24; }}
    </style>
</head>
<body>
    <h1>Protein Powder Ranked by $/Gram Efficiency</h1>
    <p><small>As an Amazon Associate I earn from qualifying purchases. Ranked from lowest cost per gram of protein (#1) to highest.</small></p>
    <table>
        <thead>
            <tr>
                <th>Value Rank</th>
                <th>$/g Tier</th>
                <th>Product</th>
                <th>Protein / Calorie %</th>
                <th>Per Scoop</th>
                <th>Link</th>
            </tr>
        </thead>
        <tbody>
            {"".join(rows)}
        </tbody>
    </table>
</body>
</html>"""


def render_detail_html(item: dict, rank: int) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{item['brand']} {item['name']} ({item['flavor']}) | VidHang</title>
    <style>
        body {{ font-family: system-ui, sans-serif; max-width: 760px; margin: 2rem auto; padding: 0 1rem; line-height: 1.6; }}
        .badge {{ display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; font-family: monospace; }}
        .tier-green {{ background: #d4edda; color: #155724; }}
        .tier-yellow {{ background: #fff3cd; color: #856404; }}
        .tier-red {{ background: #f8d7da; color: #721c24; }}
    </style>
</head>
<body>
    <p><a href="./">&larr; Back to Protein Leaderboard</a></p>
    <h1>{item['brand']} {item['name']} ({item['flavor']}, {item['size_label']})</h1>
    <p><small>As an Amazon Associate I earn from qualifying purchases.</small></p>
    <ul>
        <li><strong>Value Rank:</strong> #{rank}</li>
        <li><strong>Cost per Gram Tier:</strong> <span class="badge {item['cost_tier_class']}">{item['cost_tier']}</span></li>
        <li><strong>Protein Efficiency (Calories from Protein):</strong> {item['protein_per_calorie_pct']}%</li>
        <li><strong>Nutrition per Scoop:</strong> {item['protein_per_serving_g']:g}g protein / {item['calories_per_serving']} calories</li>
    </ul>
    {f"<p><em>{item['notes']}</em></p>" if item['notes'] else ""}
    <p><a href="{item['amazon_url']}" target="_blank" rel="nofollow noopener sponsored">Check Current Price on Amazon</a></p>
</body>
</html>"""


def build(docs_dir: Path):
    protein_dir = docs_dir / "fitness" / "protein"
    protein_dir.mkdir(parents=True, exist_ok=True)

    raw_rows = db.fetch_all_products()
    items = [transform_row(r) for r in raw_rows]

    # Sort lowest $/gram first (#1 best value at the top)
    items.sort(key=lambda x: x["_dollars_per_gram"])

    # Strip internal _dollars_per_gram before writing public JSON
    public_items = [
        {"rank": idx + 1, **{k: v for k, v in item.items() if not k.startswith("_")}}
        for idx, item in enumerate(items)
    ]

    # 1. Write docs/fitness/protein/data.json
    (protein_dir / "data.json").write_text(json.dumps(public_items, indent=2), encoding="utf-8")

    # 2. Write docs/fitness/protein/index.html
    (protein_dir / "index.html").write_text(render_index_html(public_items), encoding="utf-8")

    # 3. Write individual product pages in docs/fitness/protein/<slug>.html
    for idx, item in enumerate(public_items, start=1):
        (protein_dir / f"{item['slug']}.html").write_text(render_detail_html(item, idx), encoding="utf-8")