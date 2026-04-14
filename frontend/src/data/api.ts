import { Product, Sale, Review, KPI, Ranking, LowStockItem } from '../types';

const API_BASE_URL = 'http://localhost:8000/api';

const api = {
  // Products
  async getProducts(search?: string, category?: string): Promise<Product[]> {
    const params = new URLSearchParams();
    if (search) params.append('busca', search);
    if (category) params.append('categoria', category);
    const response = await fetch(`${API_BASE_URL}/produtos/?${params.toString()}`);
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  async getProduct(id: string): Promise<Product | null> {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch product');
    }
    return response.json();
  },

  async createProduct(data: Partial<import('../types').ProductCreate>): Promise<Product> {
    const response = await fetch(`${API_BASE_URL}/produtos/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create product');
    return response.json();
  },

  async updateProduct(id: string, data: Partial<import('../types').ProductCreate>): Promise<Product | null> {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to update product');
    }
    return response.json();
  },

  async deleteProduct(id: string): Promise<boolean> {
    const response = await fetch(`${API_BASE_URL}/produtos/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 404) return false;
      throw new Error('Failed to delete product');
    }
    return true;
  },

  // Reviews
  async getReviews(productId: string): Promise<{ media: number; avaliacoes: Review[] }> {
    const response = await fetch(`${API_BASE_URL}/produtos/${productId}/avaliacoes`);
    if (!response.ok) throw new Error('Failed to fetch reviews');
    return response.json();
  },

  // Sales
  async getSales(productId: string): Promise<Sale[]> {
    const response = await fetch(`${API_BASE_URL}/produtos/${productId}/vendas`);
    if (!response.ok) throw new Error('Failed to fetch sales');
    return response.json();
  },

  // Stats
  async getKPIs(): Promise<KPI> {
    const response = await fetch(`${API_BASE_URL}/stats/kpis`);
    if (!response.ok) throw new Error('Failed to fetch KPIs');
    return response.json();
  },

  async getRevenueRanking(): Promise<Ranking[]> {
    const response = await fetch(`${API_BASE_URL}/stats/ranking/receita`);
    if (!response.ok) throw new Error('Failed to fetch revenue ranking');
    return response.json();
  },

  async getSalesRanking(): Promise<Ranking[]> {
    const response = await fetch(`${API_BASE_URL}/stats/ranking/vendas`);
    if (!response.ok) throw new Error('Failed to fetch sales ranking');
    return response.json();
  },

  async getRatingRanking(): Promise<Ranking[]> {
    const response = await fetch(`${API_BASE_URL}/stats/ranking/avaliacoes`);
    if (!response.ok) throw new Error('Failed to fetch rating ranking');
    return response.json();
  },

  async getLowStockItems(): Promise<LowStockItem[]> {
    const response = await fetch(`${API_BASE_URL}/stats/estoque-baixo`);
    if (!response.ok) throw new Error('Failed to fetch low stock items');
    return response.json();
  },
};

export { api };
