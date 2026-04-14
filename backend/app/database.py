import csv
from pathlib import Path

from sqlalchemy import create_engine, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def _load_category_image_map() -> dict[str, str]:
    csv_path = Path(__file__).resolve().parents[1] / "dados" / "dim_categoria_imagens.csv"
    if not csv_path.exists():
        return {}

    mapping: dict[str, str] = {}
    with csv_path.open(mode="r", encoding="utf-8") as csv_file:
        reader = csv.DictReader(csv_file)
        for row in reader:
            categoria = (row.get("Categoria") or "").strip()
            link = (row.get("Link") or "").strip()
            if categoria and link:
                mapping[categoria] = link
    return mapping


def ensure_produtos_image_column() -> None:
    with engine.begin() as conn:
        columns = conn.execute(text("PRAGMA table_info(produtos)")).fetchall()
        if not columns:
            return

        column_names = {column[1] for column in columns}
        if "imageUrl" not in column_names:
            conn.execute(text('ALTER TABLE produtos ADD COLUMN "imageUrl" VARCHAR(2000)'))

        categoria_imagens = _load_category_image_map()
        for categoria, image_url in categoria_imagens.items():
            conn.execute(
                text(
                    'UPDATE produtos SET "imageUrl" = :image_url '
                    'WHERE categoria_produto = :categoria AND ("imageUrl" IS NULL OR "imageUrl" = "")'
                ),
                {"image_url": image_url, "categoria": categoria},
            )


ensure_produtos_image_column()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
