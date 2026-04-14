from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, models, schemas
from app.database import SessionLocal

router = APIRouter()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/produtos/", response_model=schemas.Produto)
def create_produto(produto: schemas.ProdutoCreate, db: Session = Depends(get_db)):
    return crud.create_produto(db=db, produto=produto)


@router.get("/produtos/", response_model=List[schemas.Produto])
def read_produtos(skip: int = 0, limit: int = 100, busca: Optional[str] = None, categoria: Optional[str] = None,
                  db: Session = Depends(get_db)):
    produtos = crud.get_produtos(db, skip=skip, limit=limit, busca=busca, categoria=categoria)
    return produtos


@router.get("/produtos/{produto_id}", response_model=schemas.Produto)
def read_produto(produto_id: str, db: Session = Depends(get_db)):
    db_produto = crud.get_produto(db, produto_id=produto_id)
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto not found")
    return db_produto


@router.put("/produtos/{produto_id}", response_model=schemas.Produto)
def update_produto(produto_id: str, produto: schemas.ProdutoCreate, db: Session = Depends(get_db)):
    db_produto = crud.update_produto(db, produto_id=produto_id, produto=produto)
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto not found")
    return db_produto


@router.delete("/produtos/{produto_id}", response_model=schemas.Produto)
def delete_produto(produto_id: str, db: Session = Depends(get_db)):
    db_produto = crud.delete_produto(db, produto_id=produto_id)
    if db_produto is None:
        raise HTTPException(status_code=404, detail="Produto not found")
    return db_produto


@router.get("/produtos/{produto_id}/vendas", response_model=List[schemas.Venda])
def read_produto_vendas(produto_id: str, db: Session = Depends(get_db)):
    vendas = crud.get_historico_vendas_produto(db, produto_id=produto_id)
    # This is a bit of a hack, we are adding the data_pedido to the ItemPedido object
    # In a real app, you would probably want to create a new schema for this
    result = []
    for venda in vendas:
        venda_dict = venda.__dict__
        venda_dict["data_pedido"] = venda.pedido.pedido_compra_timestamp
        result.append(venda_dict)
    return result


@router.get("/produtos/{produto_id}/avaliacoes")
def read_produto_avaliacoes(produto_id: str, db: Session = Depends(get_db)):
    avaliacoes = crud.get_avaliacoes_produto(db, produto_id=produto_id)
    media = crud.get_media_avaliacoes_produto(db, produto_id=produto_id)
    return {"media": media or 0, "avaliacoes": avaliacoes}
