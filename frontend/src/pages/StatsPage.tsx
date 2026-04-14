import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, ShoppingBag, Star, Package, AlertTriangle } from 'lucide-react';
import { KPI, Ranking, LowStockItem } from '../types';
import { api } from '../data/api';
import { Stars } from '../components/Stars';

function fmt(n: number) {
  return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function StatsPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [topRevenue, setTopRevenue] = useState<Ranking[]>([]);
  const [topSales, setTopSales] = useState<Ranking[]>([]);
  const [topRated, setTopRated] = useState<Ranking[]>([]);
  const [lowStock, setLowStock] = useState<LowStockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [k, rev, sls, rat, low] = await Promise.all([
          api.getKPIs(),
          api.getRevenueRanking(),
          api.getSalesRanking(),
          api.getRatingRanking(),
          api.getLowStockItems(),
        ]);
        setKpis(k);
        setTopRevenue(rev);
        setTopSales(sls);
        setTopRated(rat);
        setLowStock(low);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || !kpis) return <div className="loading-wrap"><div className="spinner" /></div>;

  const maxRevenue = Math.max(...topRevenue.map(p => p.total_receita || 0), 1);
  const maxSales = Math.max(...topSales.map(p => p.total_vendas || 0), 1);

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h2>Estatísticas</h2>
          <p>Visão geral do desempenho da loja</p>
        </div>
      </div>

      <div style={{ padding: '24px 40px 40px' }}>
        {/* KPIs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 32 }}>
          {[
            { label: 'Receita Total', value: fmt(kpis.total_receita), icon: <TrendingUp size={22} />, color: 'var(--green)' },
            { label: 'Unidades Vendidas', value: kpis.total_vendas, icon: <ShoppingBag size={22} />, color: 'var(--blue)' },
            { label: 'Total de Produtos', value: kpis.total_produtos, icon: <Package size={22} />, color: 'var(--purple)' },
            { label: 'Nota Média', value: kpis.avaliacao_media.toFixed(1) + ' ★', icon: <Star size={22} />, color: 'var(--amber)' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ color, background: `${color}22`, padding: 12, borderRadius: 10 }}>{icon}</div>
              <div>
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
          {/* Top Revenue */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h4 className="section-title" style={{ marginBottom: 16 }}>Maior Receita</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topRevenue.map((p, i) => (
                <div key={p.id_produto} style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id_produto}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.83rem' }}>
                    <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.7rem', minWidth: 16 }}>#{i+1}</span>
                      {p.nome_produto}
                    </span>
                    <span style={{ color: 'var(--green)', fontWeight: 600, fontSize: '0.83rem' }}>{fmt(p.total_receita || 0)}</span>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 6 }}>
                    <div style={{ background: 'var(--green)', borderRadius: 4, height: 6, width: `${((p.total_receita || 0) / maxRevenue) * 100}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Sales Volume */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h4 className="section-title" style={{ marginBottom: 16 }}>Mais Vendidos</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {topSales.map((p, i) => (
                <div key={p.id_produto} style={{ cursor: 'pointer' }} onClick={() => navigate(`/product/${p.id_produto}`)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: '0.83rem' }}>
                    <span style={{ color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.7rem', minWidth: 16 }}>#{i+1}</span>
                      {p.nome_produto}
                    </span>
                    <span style={{ color: 'var(--blue)', fontWeight: 600 }}>{p.total_vendas} un.</span>
                  </div>
                  <div style={{ background: 'var(--bg3)', borderRadius: 4, height: 6 }}>
                    <div style={{ background: 'var(--blue)', borderRadius: 4, height: 6, width: `${((p.total_vendas || 0) / maxSales) * 100}%`, transition: 'width 0.6s ease' }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Top Rated */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h4 className="section-title" style={{ marginBottom: 16 }}>Melhor Avaliados</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {topRated.map((p, i) => (
                <div key={p.id_produto} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                  onClick={() => navigate(`/product/${p.id_produto}`)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ color: 'var(--amber)', fontWeight: 700, fontSize: '0.7rem', minWidth: 20 }}>#{i+1}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{p.nome_produto}</span>
                  </div>
                  <Stars rating={p.media_avaliacoes || 0} count={0} size={13} />
                </div>
              ))}
            </div>
          </div>

          {/* Low Stock Alert */}
          <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <h4 className="section-title" style={{ marginBottom: 16 }}>
              <AlertTriangle size={14} style={{ marginRight: 6, color: 'var(--amber)' }} />
              Estoque Baixo
            </h4>
            {lowStock.length === 0 ? (
              <p style={{ color: 'var(--green)', fontSize: '0.875rem' }}>✓ Todos os produtos com estoque adequado</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lowStock.map(p => (
                  <div key={p.id_produto} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
                    onClick={() => navigate(`/product/${p.id_produto}`)}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{p.nome_produto}</span>
                    <span className={`stock-badge ${p.estoque === 0 ? 'stock-out' : 'stock-low'}`}>
                      {p.estoque === 0 ? 'Esgotado' : `${p.estoque} un.`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
