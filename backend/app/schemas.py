from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class ProdutoBase(BaseModel):
    nome_produto: str
    categoria_produto: str
    peso_produto_gramas: Optional[float] = None
    comprimento_centimetros: Optional[float] = None
    altura_centimetros: Optional[float] = None
    largura_centimetros: Optional[float] = None
    imageUrl: Optional[str] = None


class ProdutoCreate(ProdutoBase):
    preco: Optional[float] = None
    estoque: Optional[int] = None


class Produto(ProdutoBase):
    id_produto: str
    preco_calculado: Optional[float] = None
    estoque_derivado: Optional[int] = None
    nota_media: Optional[float] = None
    vendas_fechadas: Optional[int] = None
    receita_global: Optional[float] = None

    class Config:
        orm_mode = True


class Avaliacao(BaseModel):
    id_avaliacao: str
    id_pedido: str
    avaliacao: int
    titulo_comentario: Optional[str] = None
    comentario: Optional[str] = None
    data_comentario: Optional[datetime] = None

    class Config:
        orm_mode = True


class Venda(BaseModel):
    id_pedido: str
    id_item: int
    preco_BRL: float
    preco_frete: float
    data_pedido: datetime

    class Config:
        orm_mode = True


class KPI(BaseModel):
    total_receita: float
    total_vendas: int
    total_produtos: int
    avaliacao_media: float


class RankingReceita(BaseModel):
    id_produto: str
    nome_produto: str
    total_receita: float


class RankingVendas(BaseModel):
    id_produto: str
    nome_produto: str
    total_vendas: int


class RankingAvaliacoes(BaseModel):
    id_produto: str
    nome_produto: str
    media_avaliacoes: float


class EstoqueBaixo(BaseModel):
    id_produto: str
    nome_produto: str
    estoque: int
