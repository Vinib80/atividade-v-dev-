import csv
from datetime import datetime
from app.database import SessionLocal
from app.models import Consumidor, Produto, Vendedor, Pedido, ItemPedido, AvaliacaoPedido

arquivos_para_modelos = [
    ("dados/dim_consumidores.csv", Consumidor),
    ("dados/dim_produtos.csv", Produto),
    ("dados/dim_vendedores.csv", Vendedor),
    ("dados/fat_pedidos.csv", Pedido),
    ("dados/fat_itens_pedidos.csv", ItemPedido),
    ("dados/fat_avaliacoes_pedidos.csv", AvaliacaoPedido),
]

def carregar_dados():
    db = SessionLocal()
    try:

        # Pre-load category images
        categoria_imagens = {}
        try:
            with open("dados/dim_categoria_imagens.csv", mode="r", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    if row.get("Categoria") and row.get("Link"):
                        categoria_imagens[row["Categoria"]] = row["Link"]
        except Exception as e:
            print(f"Aviso: Não foi possível ler dim_categoria_imagens.csv: {e}")

        for caminho_csv, modelo in arquivos_para_modelos:

            print(f"Populando {modelo.__tablename__}...")
            with open(caminho_csv, mode='r', encoding='utf-8') as arquivo:
                leitor = csv.DictReader(arquivo)
                ids_vistos = set() 
                
                for linha in leitor:
                    # Evita duplicatas na tabela de avaliações
                    if modelo.__tablename__ == "avaliacoes_pedidos":
                        if linha["id_avaliacao"] in ids_vistos:
                            continue
                        ids_vistos.add(linha["id_avaliacao"])

                    # Limpa e formata os dados
                    for chave, valor in linha.items():
                        if valor == "":
                            if chave == "categoria_produto":
                                linha[chave] = "Sem categoria"
                            else:
                                linha[chave] = None
                        elif valor and ("timestamp" in chave or "data_" in chave):
                            try:
                                if len(valor) > 10: 
                                    linha[chave] = datetime.strptime(valor, "%Y-%m-%d %H:%M:%S")
                                else: 
                                    linha[chave] = datetime.strptime(valor, "%Y-%m-%d").date()
                            except ValueError:
                                linha[chave] = None
                                

                    if modelo.__tablename__ == "produtos":
                        cat = linha.get("categoria_produto")
                        if cat and cat in categoria_imagens:
                            linha["imageUrl"] = categoria_imagens[cat]
                        else:
                            linha["imageUrl"] = None

                    registro = modelo(**linha)

                    db.add(registro)
            db.commit()
            print("Sucesso!")
    except Exception as e:
        db.rollback()
        print(f"Erro: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    carregar_dados()
