import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Product, ProductCreate } from '../types';

// Mocked categories as they are not in the backend
const CATEGORIES = [
  "beleza_saude", "informatica_acessorios", "automotivo", "cama_mesa_banho",
  "moveis_decoracao", "esporte_lazer", "perfumaria", "utilidades_domesticas",
  "relogios_presentes", "telefonia", "brinquedos", "bebes", "cool_stuff"
];

interface ProductFormProps {
  product?: Partial<Product> | null;
  onSave: (data: ProductCreate) => Promise<void>;
  onClose: () => void;
}

const EMPTY: ProductCreate = {
  nome_produto: '',
  categoria_produto: CATEGORIES[0],
  description: '',
  preco: 0,
  estoque: 0,
  peso_produto_gramas: 0,
  largura_centimetros: 0,
  altura_centimetros: 0,
  comprimento_centimetros: 0,
  imageUrl: '',
};

export function ProductForm({ product, onSave, onClose }: ProductFormProps) {
  const [form, setForm] = useState<ProductCreate>(EMPTY);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (product) {
      setForm({
        nome_produto: product.nome_produto || '',
        categoria_produto: product.categoria_produto || CATEGORIES[0],
        description: product.description || '',
        preco: product.preco_calculado || 0,
        estoque: product.estoque_derivado || 0,
        peso_produto_gramas: product.peso_produto_gramas || 0,
        largura_centimetros: product.largura_centimetros || 0,
        altura_centimetros: product.altura_centimetros || 0,
        comprimento_centimetros: product.comprimento_centimetros || 0,
        imageUrl: product.imageUrl || '',
      });
    } else {
      setForm(EMPTY);
    }
  }, [product]);

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    if (!form.nome_produto.trim()) return;
    setSaving(true);
    try { await onSave(form); } finally { setSaving(false); }
  }

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3>{product ? 'Editar Produto' : 'Novo Produto'}</h3>
          <button className="modal-close" onClick={onClose}><X size={20} /></button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group form-full">
              <label className="form-label">Nome do Produto *</label>
              <input className="form-input" value={form.nome_produto} placeholder="Ex: Fone de Ouvido Bluetooth"
                onChange={e => set('nome_produto', e.target.value)} />
            </div>
            <div className="form-group form-full">
              <label className="form-label">Descrição</label>
              <textarea className="form-input" value={form.description} placeholder="Descreva o produto..."
                onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">
                Preço (R$) 
                <span style={{ fontSize: '0.75rem', color: 'var(--amber)', display: 'block', fontWeight: 400 }}>Gerado automaticamente pela IA</span>
              </label>
              <input type="number" className="form-input" value={form.preco || ''}
                placeholder="0,00" step="0.01" min="0" disabled
                onChange={e => set('preco', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Categoria</label>
              <select className="form-input" value={form.categoria_produto}
                onChange={e => set('categoria_produto', e.target.value)}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">
                Estoque
                <span style={{ fontSize: '0.75rem', color: 'var(--amber)', display: 'block', fontWeight: 400 }}>Inferido automaticamente</span>
              </label>
              <input type="number" className="form-input" value={form.estoque || ''} min="0" disabled
                onChange={e => set('estoque', parseInt(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Peso (g)</label>
              <input type="number" className="form-input" value={form.peso_produto_gramas || ''} min="0" step="0.01"
                onChange={e => set('peso_produto_gramas', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Largura (cm)</label>
              <input type="number" className="form-input" value={form.largura_centimetros || ''} min="0"
                onChange={e => set('largura_centimetros', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Altura (cm)</label>
              <input type="number" className="form-input" value={form.altura_centimetros || ''} min="0"
                onChange={e => set('altura_centimetros', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group">
              <label className="form-label">Comprimento (cm)</label>
              <input type="number" className="form-input" value={form.comprimento_centimetros || ''} min="0"
                onChange={e => set('comprimento_centimetros', parseFloat(e.target.value) || 0)} />
            </div>
            <div className="form-group form-full">
              <label className="form-label">URL da Imagem</label>
              <input className="form-input" value={form.imageUrl} placeholder="https://..."
                onChange={e => set('imageUrl', e.target.value)} />
            </div>
          </div>
          <div className="form-actions">
            <button className="btn btn-ghost" onClick={onClose} disabled={saving}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving || !form.nome_produto.trim()}>
              {saving ? 'Salvando…' : product ? 'Salvar alterações' : 'Criar produto'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
