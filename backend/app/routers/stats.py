from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app import crud, schemas
from app.database import SessionLocal

router = APIRouter()


# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats/kpis")
def get_kpis(db: Session = Depends(get_db)):
    return crud.get_kpis_globais(db)


@router.get("/stats/ranking/receita", response_model=List[schemas.RankingReceita])
def get_ranking_receita(db: Session = Depends(get_db)):
    return crud.get_ranking_receita(db)


@router.get("/stats/ranking/vendas", response_model=List[schemas.RankingVendas])
def get_ranking_vendas(db: Session = Depends(get_db)):
    return crud.get_ranking_vendas(db)


@router.get("/stats/ranking/avaliacoes", response_model=List[schemas.RankingAvaliacoes])
def get_ranking_avaliacoes(db: Session = Depends(get_db)):
    return crud.get_ranking_avaliacoes(db)


@router.get("/stats/estoque-baixo", response_model=List[schemas.EstoqueBaixo])
def get_estoque_baixo(db: Session = Depends(get_db)):
    return crud.get_estoque_baixo(db)
