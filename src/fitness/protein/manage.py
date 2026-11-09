import argparse
import re
import db


def make_slug(brand: str, name: str, flavor: str, size_label: str) -> str:
    raw = f"{brand}-{name}-{flavor}-{size_label}".lower()
    return re.sub(r"[^a-z0-9]+", "-", raw).strip("-")


def cmd_add(args):
    slug = args.slug or make_slug(args.brand, args.name, args.flavor, args.size)
    db.upsert_product({
        "slug": slug,
        "asin": args.asin,
        "brand": args.brand,
        "name": args.name,
        "flavor": args.flavor,
        "size_label": args.size,
        "servings": args.servings,
        "protein_per_serving_g": args.protein,
        "calories_per_serving": args.calories,
        "price": args.price,
        "notes": args.notes or ""
    })
    print(f"Saved: {slug} (ASIN: {args.asin})")


def cmd_price(args):
    db.update_price(args.asin, args.price)
    print(f"Updated {args.asin} price to ${args.price:.2f}")


def cmd_list(_args):
    rows = db.fetch_all_products()
    if not rows:
        print("Database is empty.")
        return
    for r in rows:
        total_g = r["servings"] * r["protein_per_serving_g"]
        cost_per_g = r["price"] / total_g if total_g else 0
        print(f"[{r['asin']}] {r['brand']} {r['name']} ({r['flavor']}, {r['size_label']}) -> ${cost_per_g:.4f}/g (Internal price: ${r['price']:.2f})")


def main():
    parser = argparse.ArgumentParser(description="Manage protein.db records")
    sub = parser.add_subparsers(dest="cmd", required=True)

    # Add / update full product
    p_add = sub.add_parser("add", help="Add or update a protein product")
    p_add.add_argument("--asin", required=True)
    p_add.add_argument("--brand", required=True)
    p_add.add_argument("--name", required=True)
    p_add.add_argument("--flavor", required=True)
    p_add.add_argument("--size", required=True, help="e.g. '6 lb'")
    p_add.add_argument("--servings", type=float, required=True)
    p_add.add_argument("--protein", type=float, required=True, help="Grams of protein per serving")
    p_add.add_argument("--calories", type=int, required=True, help="Calories per serving")
    p_add.add_argument("--price", type=float, required=True, help="Current price (kept internal)")
    p_add.add_argument("--notes", default="")
    p_add.add_argument("--slug", default=None)
    p_add.set_defaults(func=cmd_add)

    # Quick price update
    p_price = sub.add_parser("price", help="Update price for an existing ASIN")
    p_price.add_argument("asin")
    p_price.add_argument("price", type=float)
    p_price.set_defaults(func=cmd_price)

    # List DB contents
    p_list = sub.add_parser("list", help="List all products in DB")
    p_list.set_defaults(func=cmd_list)

    args = parser.parse_args()
    args.func(args)


if __name__ == "__main__":
    main()