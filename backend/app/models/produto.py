from typing import Optional

from sqlalchemy import String, Float
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Produto(Base):
    __tablename__ = "produtos"

    id_produto: Mapped[str] = mapped_column(String(32), primary_key=True)
    nome_produto: Mapped[str] = mapped_column(String(255))
    categoria_produto: Mapped[str] = mapped_column(String(100))
    peso_produto_gramas: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    comprimento_centimetros: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    altura_centimetros: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    largura_centimetros: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    imageUrl: Mapped[Optional[str]] = mapped_column(String(2000), nullable=True)

    @property
    def preco(self) -> float:
        if getattr(self, "preco_calc", None) is not None:
            return round(self.preco_calc, 2)
        # Deterministic fallback based on weight
        peso = self.peso_produto_gramas or 100.0
        return round(peso * 0.05 + 10.0, 2)

    @property
    def estoque(self) -> int:
        if not self.id_produto:
            return 0
        # Deterministic simulation based on ID
        soma_char = sum(ord(c) for c in self.id_produto)
        return (soma_char % 50) + 1

