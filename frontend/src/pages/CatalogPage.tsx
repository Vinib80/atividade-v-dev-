import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Package } from 'lucide-react';
import { api } from '../data/api';
import { Stars } from '../components/Stars';
import { ProductForm } from '../components/ProductForm';
import { useToast } from '../components/ToastProvider';
import { Product } from '../types';

// Mocked categories as they are not in the backend
const CATEGORIES = [
  "beleza_saude", "informatica_acessorios", "automotivo", "cama_mesa_banho",
  "moveis_decoracao", "esporte_lazer", "perfumaria", "utilidades_domesticas",
  "relogios_presentes", "telefonia", "brinquedos", "bebes", "cool_stuff"
];


function stockClass(stock: number) {
  if (stock === 0) return 'stock-out';
  if (stock < 20) return 'stock-low';
  return 'stock-ok';
}
function stockLabel(stock: number) {
  if (stock === 0) return 'Sem estoque';
  if (stock < 20) return `${stock} restantes`;
  return `${stock} em estoque`;
}
function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function CatalogPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getProducts(search || undefined, category || undefined);
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  async function handleCreate(data: import('../types').ProductCreate) {
    await api.createProduct(data);
    toast('Produto criado com sucesso!', 'success');
    setShowForm(false);
    load();
  }

  // Stagger animation delay
  const cardStyle = (i: number) => ({ animationDelay: `${i * 40}ms` });

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Catálogo de Produtos</h2>
          <p>{products.length} produto{products.length !== 1 ? 's' : ''} encontrado{products.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Novo Produto
        </button>
      </div>

      <div className="toolbar">
        <div className="search-wrap">
          <Search size={16} />
          <input
            className="search-input"
            placeholder="Buscar produtos…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select className="select-filter" value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Todas as categorias</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading-wrap">
          <div className="spinner" />
          <span style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Carregando produtos…</span>
        </div>
      ) : (
        <div className="product-grid">
          {products.length === 0 ? (
            <div className="empty-state">
              <Package size={48} />
              <h3>Nenhum produto encontrado</h3>
              <p>Tente ajustar os filtros ou adicione um novo produto.</p>
            </div>
          ) : products.map((p, i) => (
            <div
              key={p.id_produto}
              className="product-card"
              style={cardStyle(i)}
              onClick={() => navigate(`/product/${p.id_produto}`)}
            >
              <img
                className="card-img"
                src={p.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'}
                alt={p.nome_produto}
                onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'; }}
              />
              <div className="card-body">
                <span className="card-category">{p.categoria_produto}</span>
                <h3 className="card-name">{p.nome_produto}</h3>
                <div className="card-price">{fmt(p.preco_calculado || 0)}</div>
              </div>
              <div className="card-footer">
                <Stars rating={p.nota_media || 0} />
                <span className={`stock-badge ${stockClass(p.estoque_derivado || 0)}`}>{stockLabel(p.estoque_derivado || 0)}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductForm onSave={handleCreate} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
