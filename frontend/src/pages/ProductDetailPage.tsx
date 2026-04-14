import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, ShoppingBag, Star, Package, TrendingUp } from 'lucide-react';
import { Review, Sale, Product } from '../types';
import { api } from '../data/api';
import { Stars } from '../components/Stars';
import { ProductForm } from '../components/ProductForm';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { useToast } from '../components/ToastProvider';

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString('pt-BR');
}

type Tab = 'info' | 'sales' | 'reviews';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('info');
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [p, r, s] = await Promise.all([
          api.getProduct(id!),
          api.getReviews(id!),
          api.getSales(id!),
        ]);
        if (!p) { navigate('/'); return; }
        setProduct(p);
        setReviews(r.avaliacoes);
        setSales(s);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      load();
    }
  }, [id, navigate]);

  async function handleUpdate(data: Partial<import('../types').ProductCreate>) {
    if (!product) return;
    const updated = await api.updateProduct(product.id_produto, data);
    if (updated) {
      const p = await api.getProduct(product.id_produto);
      if (p) setProduct(p);
      toast('Produto atualizado!', 'success');
    }
    setShowEdit(false);
  }

  async function handleDelete() {
    if (!product) return;
    setDeleting(true);
    await api.deleteProduct(product.id_produto);
    toast('Produto excluído.', 'info');
    navigate('/');
  }

  if (loading) {
    return (
      <div className="loading-wrap">
        <div className="spinner" />
        <span style={{ color: 'var(--text3)', fontSize: '0.875rem' }}>Carregando produto…</span>
      </div>
    );
  }
  if (!product) return null;

  // Group sales by id_pedido
  const groupedSalesObj = sales.reduce((acc, curr) => {
    if (!acc[curr.id_pedido]) {
      acc[curr.id_pedido] = { ...curr, qty: 0, preco_BRL: 0, preco_frete: 0 };
    }
    acc[curr.id_pedido].qty += 1;
    acc[curr.id_pedido].preco_BRL += curr.preco_BRL;
    acc[curr.id_pedido].preco_frete += curr.preco_frete;
    return acc;
  }, {} as Record<string, Sale & { qty: number }>);
  
  const groupedSales = Object.values(groupedSalesObj).sort(
    (a, b) => new Date(b.data_pedido).getTime() - new Date(a.data_pedido).getTime()
  );

  const maxSaleQty = Math.max(...groupedSales.map(s => s.qty), 1);

  return (
    <div className="detail-page">
      <button className="back-btn" onClick={() => navigate('/')}>
        <ArrowLeft size={16} /> Voltar ao catálogo
      </button>

      <div className="detail-grid">
        {/* Left column: image */}
        <div className="detail-img-wrap">
          <img
            className="detail-img"
            src={product.imageUrl || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'}
            alt={product.nome_produto}
            onError={e => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=80'; }}
          />
        </div>

        {/* Right column */}
        <div className="detail-info">
          <div>
            <div className="detail-category">{product.categoria_produto}</div>
            <h1 className="detail-name">{product.nome_produto}</h1>
            <Stars rating={product.nota_media || 0} size={18} />
          </div>

          <div className="detail-price">{fmt(product.preco_calculado || 0)}</div>

          {/* Stats */}
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-label">Vendas totais</div>
              <div className="stat-value">{product.vendas_fechadas || 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Receita gerada</div>
              <div className="stat-value" style={{ fontSize: '1.05rem' }}>{fmt(product.receita_global || 0)}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Estoque atual</div>
              <div className="stat-value" style={{
                color: (product.estoque_derivado || 0) === 0 ? 'var(--red)' : (product.estoque_derivado || 0) < 20 ? 'var(--amber)' : 'var(--green)'
              }}>{product.estoque_derivado || 0}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="detail-actions">
            <button className="btn btn-primary" onClick={() => setShowEdit(true)}>
              <Edit2 size={15} /> Editar
            </button>
            <button className="btn btn-danger" onClick={() => setShowDelete(true)}>
              <Trash2 size={15} /> Excluir
            </button>
          </div>

          {/* Tabs */}
          <div>
            <div className="tabs">
              <button className={`tab-btn ${tab === 'info' ? 'active' : ''}`} onClick={() => setTab('info')}>
                <Package size={13} style={{ display: 'inline', marginRight: 5 }} />Detalhes
              </button>
              <button className={`tab-btn ${tab === 'sales' ? 'active' : ''}`} onClick={() => setTab('sales')}>
                <TrendingUp size={13} style={{ display: 'inline', marginRight: 5 }} />Vendas ({sales.length})
              </button>
              <button className={`tab-btn ${tab === 'reviews' ? 'active' : ''}`} onClick={() => setTab('reviews')}>
                <Star size={13} style={{ display: 'inline', marginRight: 5 }} />Avaliações ({reviews.length})
              </button>
            </div>

            {tab === 'info' && (
              <>
                <p style={{ color: 'var(--text2)', lineHeight: 1.7, marginBottom: 20 }}>{product.description || 'Sem descrição'}</p>
                <h4 className="section-title">Medidas & Peso</h4>
                <div className="measures-grid">
                  {[
                    { k: 'Peso', v: `${product.peso_produto_gramas || 0} g` },
                    { k: 'Largura', v: `${product.largura_centimetros || 0} cm` },
                    { k: 'Altura', v: `${product.altura_centimetros || 0} cm` },
                    { k: 'Comprimento', v: `${product.comprimento_centimetros || 0} cm` },
                  ].map(({ k, v }) => (
                    <div key={k} className="measure-item">
                      <span className="measure-key">{k}</span>
                      <span className="measure-val">{v}</span>
                    </div>
                  ))}
                </div>
                <p style={{ marginTop: 12, fontSize: '0.8rem', color: 'var(--text3)' }}>
                  Cadastrado em: {fmtDate(product.createdAt || new Date().toISOString())}
                </p>
              </>
            )}

            {tab === 'sales' && (
              <div className="sales-section">
                {groupedSales.length === 0 ? (
                  <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '32px 0' }}>
                    <ShoppingBag size={32} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.4 }} />
                    Nenhuma venda registrada
                  </p>
                ) : groupedSales.map(s => (
                  <div key={s.id_pedido} className="sale-row">
                    <span className="sale-date">{fmtDate(s.data_pedido)}</span>
                    <div className="sale-bar-wrap">
                      <div className="sale-bar" style={{ width: `${(s.qty / maxSaleQty) * 100}%` }} />
                    </div>
                    <span className="sale-qty">{s.qty} un.</span>
                    <span className="sale-revenue">{fmt(s.preco_BRL + s.preco_frete)}</span>
                  </div>
                ))}
              </div>
            )}

            {tab === 'reviews' && (
              <div className="reviews-list">
                {reviews.length === 0 ? (
                  <p style={{ color: 'var(--text3)', textAlign: 'center', padding: '32px 0' }}>
                    <Star size={32} style={{ display: 'block', margin: '0 auto 8px', opacity: 0.4 }} />
                    Nenhuma avaliação ainda
                  </p>
                ) : reviews.map(r => (
                  <div key={r.id_avaliacao} className="review-card">
                    <div className="review-header">
                      <div>
                        <span className="review-author">{r.titulo_comentario || 'Anônimo'}</span>
                        <Stars rating={r.avaliacao} size={12} />
                      </div>
                      <span className="review-date">{fmtDate(r.data_comentario || new Date().toISOString())}</span>
                    </div>
                    <p className="review-comment">{r.comentario}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showEdit && (
        <ProductForm
          product={product}
          onSave={handleUpdate}
          onClose={() => setShowEdit(false)}
        />
      )}
      {showDelete && (
        <ConfirmDialog
          title="Excluir produto"
          message={`Tem certeza que deseja excluir "${product.nome_produto}"? Esta ação não pode ser desfeita.`}
          onConfirm={handleDelete}
          onClose={() => setShowDelete(false)}
          loading={deleting}
        />
      )}
    </div>
  );
}
