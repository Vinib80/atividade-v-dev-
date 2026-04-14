from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from . import models, schemas


# Produtos
def get_produto(db: Session, produto_id: str):
    subq_vendas = db.query(
        models.ItemPedido.id_produto,
        func.count(models.ItemPedido.id_item).label("total_vendas"),
        func.sum(models.ItemPedido.preco_BRL + models.ItemPedido.preco_frete).label("faturamento"),
        func.max(models.ItemPedido.preco_BRL).label("preco_calc")
    ).filter(models.ItemPedido.id_produto == produto_id).group_by(models.ItemPedido.id_produto).subquery()

    subq_avalia = db.query(
        models.ItemPedido.id_produto,
        func.avg(models.AvaliacaoPedido.avaliacao).label("media_avaliacoes")
    ).join(models.AvaliacaoPedido, models.ItemPedido.id_pedido == models.AvaliacaoPedido.id_pedido) \
     .filter(models.ItemPedido.id_produto == produto_id).group_by(models.ItemPedido.id_produto).subquery()

    query = db.query(
        models.Produto,
        func.coalesce(subq_vendas.c.total_vendas, 0).label("total_vendas"),
        func.coalesce(subq_vendas.c.faturamento, 0).label("faturamento"),
        subq_vendas.c.preco_calc,
        func.coalesce(subq_avalia.c.media_avaliacoes, 0).label("media_avaliacoes")
    ).outerjoin(subq_vendas, models.Produto.id_produto == subq_vendas.c.id_produto) \
     .outerjoin(subq_avalia, models.Produto.id_produto == subq_avalia.c.id_produto) \
     .filter(models.Produto.id_produto == produto_id)

    row = query.first()
    if row:
        p = row.Produto
        p.vendas_fechadas = row.total_vendas
        p.receita_global = row.faturamento
        p.nota_media = row.media_avaliacoes
        p.preco_calculado = row.preco_calc
        p.estoque_derivado = 0  # Placeholder, as requested to send some value
        return p
    return None


def get_produtos(db: Session, skip: int = 0, limit: int = 100, busca: str = None, categoria: str = None):
    subq_vendas = db.query(
        models.ItemPedido.id_produto,
        func.count(models.ItemPedido.id_item).label("total_vendas"),
        func.sum(models.ItemPedido.preco_BRL + models.ItemPedido.preco_frete).label("faturamento"),
        func.max(models.ItemPedido.preco_BRL).label("preco_calc")
    ).group_by(models.ItemPedido.id_produto).subquery()

    subq_avalia = db.query(
        models.ItemPedido.id_produto,
        func.avg(models.AvaliacaoPedido.avaliacao).label("media_avaliacoes")
    ).join(models.AvaliacaoPedido, models.ItemPedido.id_pedido == models.AvaliacaoPedido.id_pedido) \
     .group_by(models.ItemPedido.id_produto).subquery()

    query = db.query(
        models.Produto,
        func.coalesce(subq_vendas.c.total_vendas, 0).label("total_vendas"),
        func.coalesce(subq_vendas.c.faturamento, 0).label("faturamento"),
        subq_vendas.c.preco_calc,
        func.coalesce(subq_avalia.c.media_avaliacoes, 0).label("media_avaliacoes")
    ).outerjoin(subq_vendas, models.Produto.id_produto == subq_vendas.c.id_produto) \
     .outerjoin(subq_avalia, models.Produto.id_produto == subq_avalia.c.id_produto)

    if busca:
        query = query.filter(models.Produto.nome_produto.contains(busca))
    if categoria:
        query = query.filter(models.Produto.categoria_produto == categoria)
        
    results = query.offset(skip).limit(limit).all()
    
    produtos_output = []
    for row in results:
        p = row.Produto
        p.vendas_fechadas = row.total_vendas
        p.receita_global = row.faturamento
        p.nota_media = row.media_avaliacoes
        p.preco_calculado = row.preco_calc
        p.estoque_derivado = 0  # Placeholder, as requested to send some value
        produtos_output.append(p)
        
    return produtos_output


def create_produto(db: Session, produto: schemas.ProdutoCreate):
    # Simple random ID for now
    import uuid
    import logging
    
    if produto.preco is not None or produto.estoque is not None:
        logging.warning("Preço ou estoque recebidos na criação de produto. Ignorando silenciosamente.")
        
    db_produto = models.Produto(**produto.dict(exclude={"preco", "estoque"}), id_produto=str(uuid.uuid4()).replace("-", ""))
    db.add(db_produto)
    db.commit()
    return get_produto(db, db_produto.id_produto)


def update_produto(db: Session, produto_id: str, produto: schemas.ProdutoCreate):
    import logging
    
    db_produto_db = db.query(models.Produto).filter(models.Produto.id_produto == produto_id).first()
    if db_produto_db:
        if produto.preco is not None or produto.estoque is not None:
            logging.warning("Preço ou estoque recebidos na atualização de produto. Ignorando silenciosamente.")
            
        for key, value in produto.dict(exclude={"preco", "estoque"}).items():
            setattr(db_produto_db, key, value)
        db.commit()
    return get_produto(db, produto_id)


def delete_produto(db: Session, produto_id: str):
    db_produto = get_produto(db, produto_id)
    if db_produto:
        db.delete(db_produto)
        db.commit()
    return db_produto


# Vendas
def get_historico_vendas_produto(db: Session, produto_id: str):
    return db.query(models.ItemPedido).join(models.Pedido).filter(models.ItemPedido.id_produto == produto_id).order_by(
        models.Pedido.pedido_compra_timestamp.desc()).all()


# Avaliações
def get_avaliacoes_produto(db: Session, produto_id: str):
    return db.query(models.AvaliacaoPedido).join(models.ItemPedido,
                                                 models.AvaliacaoPedido.id_pedido == models.ItemPedido.id_pedido).filter(
        models.ItemPedido.id_produto == produto_id).all()


def get_media_avaliacoes_produto(db: Session, produto_id: str):
    return db.query(func.avg(models.AvaliacaoPedido.avaliacao)).join(models.ItemPedido,
                                                                      models.AvaliacaoPedido.id_pedido == models.ItemPedido.id_pedido).filter(
        models.ItemPedido.id_produto == produto_id).scalar()


# KPIs
def get_kpis_globais(db: Session):
    total_receita = db.query(func.sum(models.ItemPedido.preco_BRL + models.ItemPedido.preco_frete)).scalar()
    total_vendas = db.query(func.count(models.ItemPedido.id_item)).scalar()
    total_produtos = db.query(func.count(models.Produto.id_produto)).scalar()
    avaliacao_media = db.query(func.avg(models.AvaliacaoPedido.avaliacao)).scalar()
    return {
        "total_receita": total_receita or 0,
        "total_vendas": total_vendas or 0,
        "total_produtos": total_produtos or 0,
        "avaliacao_media": avaliacao_media or 0,
    }


def get_ranking_receita(db: Session, limit: int = 5):
    return db.query(
        models.Produto.id_produto,
        models.Produto.nome_produto,
        func.sum(models.ItemPedido.preco_BRL + models.ItemPedido.preco_frete).label("total_receita")
    ).join(models.ItemPedido, models.Produto.id_produto == models.ItemPedido.id_produto).group_by(
        models.Produto.id_produto).order_by(desc("total_receita")).limit(limit).all()


def get_ranking_vendas(db: Session, limit: int = 5):
    return db.query(
        models.Produto.id_produto,
        models.Produto.nome_produto,
        func.count(models.ItemPedido.id_item).label("total_vendas")
    ).join(models.ItemPedido, models.Produto.id_produto == models.ItemPedido.id_produto).group_by(
        models.Produto.id_produto).order_by(desc("total_vendas")).limit(limit).all()


def get_ranking_avaliacoes(db: Session, limit: int = 5):
    return db.query(
        models.Produto.id_produto,
        models.Produto.nome_produto,
        func.avg(models.AvaliacaoPedido.avaliacao).label("media_avaliacoes")
    ).join(models.ItemPedido, models.Produto.id_produto == models.ItemPedido.id_produto).join(
        models.AvaliacaoPedido, models.ItemPedido.id_pedido == models.AvaliacaoPedido.id_pedido).group_by(
        models.Produto.id_produto).order_by(desc("media_avaliacoes")).limit(limit).all()


def get_estoque_baixo(db: Session, limit: int = 5):
    # Mocked as there is no stock information in the database model
    # In a real scenario, you would have a stock count in the Produto model
    produtos = db.query(models.Produto).limit(limit).all()
    return [{"id_produto": p.id_produto, "nome_produto": p.nome_produto, "estoque": 1} for p in produtos]
