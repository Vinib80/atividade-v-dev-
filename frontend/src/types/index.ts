export interface ProductBase {
  nome_produto: string;
  categoria_produto: string;
  peso_produto_gramas?: number;
  comprimento_centimetros?: number;
  altura_centimetros?: number;
  largura_centimetros?: number;
  description?: string;
  imageUrl?: string;
}

export interface ProductCreate extends ProductBase {
  preco?: number;
  estoque?: number;
}

export interface Product extends ProductBase {
  id_produto: string;
  preco_calculado?: number;
  estoque_derivado?: number;
  nota_media?: number;
  vendas_fechadas?: number;
  receita_global?: number;
  createdAt?: string;
}

export interface Sale {
  id_pedido: string;
  id_item: number;
  preco_BRL: number;
  preco_frete: number;
  data_pedido: string;
}

export interface Review {
  id_avaliacao: string;
  id_pedido: string;
  avaliacao: number;
  titulo_comentario?: string;
  comentario?: string;
  data_comentario?: string;
}

export interface KPI {
  total_receita: number;
  total_vendas: number;
  total_produtos: number;
  avaliacao_media: number;
}

export interface Ranking {
  id_produto: string;
  nome_produto: string;
  total_receita?: number;
  total_vendas?: number;
  media_avaliacoes?: number;
}

export interface LowStockItem {
    id_produto: string;
    nome_produto: string;
    estoque: number;
}
