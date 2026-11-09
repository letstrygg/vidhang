import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "protein.db"


def get_conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    with get_conn() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS products (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                slug TEXT UNIQUE NOT NULL,
                asin TEXT UNIQUE NOT NULL,
                brand TEXT NOT NULL,
                name TEXT NOT NULL,
                flavor TEXT NOT NULL,
                size_label TEXT NOT NULL,
                servings REAL NOT NULL,
                protein_per_serving_g REAL NOT NULL,
                calories_per_serving INTEGER NOT NULL,
                price REAL NOT NULL,
                updated_at TEXT DEFAULT CURRENT_DATE,
                notes TEXT
            )
        """)


def upsert_product(data: dict):
    init_db()
    with get_conn() as conn:
        conn.execute("""
            INSERT INTO products (
                slug, asin, brand, name, flavor, size_label,
                servings, protein_per_serving_g, calories_per_serving,
                price, updated_at, notes
            ) VALUES (
                :slug, :asin, :brand, :name, :flavor, :size_label,
                :servings, :protein_per_serving_g, :calories_per_serving,
                :price, DATE('now'), :notes
            )
            ON CONFLICT(asin) DO UPDATE SET
                slug = excluded.slug,
                brand = excluded.brand,
                name = excluded.name,
                flavor = excluded.flavor,
                size_label = excluded.size_label,
                servings = excluded.servings,
                protein_per_serving_g = excluded.protein_per_serving_g,
                calories_per_serving = excluded.calories_per_serving,
                price = excluded.price,
                updated_at = DATE('now'),
                notes = excluded.notes
        """, data)


def update_price(asin: str, new_price: float):
    init_db()
    with get_conn() as conn:
        cur = conn.execute(
            "UPDATE products SET price = ?, updated_at = DATE('now') WHERE asin = ?",
            (new_price, asin)
        )
        if cur.rowcount == 0:
            raise ValueError(f"ASIN {asin} not found in database.")


def fetch_all_products() -> list[dict]:
    init_db()
    with get_conn() as conn:
        rows = conn.execute("SELECT * FROM products").fetchall()
        return [dict(r) for r in rows]