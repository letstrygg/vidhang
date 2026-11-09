from pathlib import Path
from fitness.protein import build as build_protein

ROOT_DIR = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT_DIR / "docs"


def main():
    build_protein.build(DOCS_DIR)


if __name__ == "__main__":
    main()