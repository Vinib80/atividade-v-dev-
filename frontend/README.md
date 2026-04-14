# 🛍️ Commerce HQ — Frontend

Sistema de Gerenciamento de E-Commerce desenvolvido com **Vite + React + TypeScript**.

## Funcionalidades

- 📦 **Catálogo de produtos** com busca em tempo real e filtro por categoria
- 🔍 **Detalhes do produto**: descrição, medidas, estoque e preço
- 📊 **Desempenho de vendas** por produto com visualização em barras
- ⭐ **Avaliações** dos consumidores com média calculada automaticamente
- ✏️ **CRUD completo**: criar, editar e excluir produtos individualmente
- 📈 **Página de Estatísticas**: ranking de receita, mais vendidos, melhores avaliados e alertas de estoque baixo
- 🔔 Notificações toast de feedback ao usuário

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | React 18 |
| Linguagem | TypeScript |
| Build tool | Vite 5 |
| Roteamento | React Router v6 |
| Ícones | Lucide React |
| Fontes | Playfair Display + Outfit (Google Fonts) |

> **Nota:** Esta versão usa dados mockados em memória para simular a API do backend. Para conectar ao backend FastAPI, substitua as chamadas em `src/data/api.ts` por requisições `fetch` reais.

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- npm >= 9

## Como executar

```bash
# 1. Clone o repositório
git clone https://github.com/SEU_USUARIO/ecommerce-frontend.git
cd ecommerce-frontend

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:5173** no navegador.

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia servidor de desenvolvimento com HMR |
| `npm run build` | Gera build de produção em `/dist` |
| `npm run preview` | Serve o build de produção localmente |

## Estrutura do projeto

```
src/
├── components/
│   ├── ConfirmDialog.tsx   # Modal de confirmação de exclusão
│   ├── ProductForm.tsx     # Formulário de criação/edição
│   ├── Sidebar.tsx         # Navegação lateral
│   ├── Stars.tsx           # Componente de estrelas
│   └── ToastProvider.tsx   # Sistema de notificações
├── data/
│   ├── api.ts              # Camada de serviço (mock → substituir por API real)
│   └── mockData.ts         # Dados de produtos, vendas e avaliações
├── pages/
│   ├── CatalogPage.tsx     # Grid de produtos com busca e filtros
│   ├── ProductDetailPage.tsx # Detalhe com abas (info, vendas, avaliações)
│   └── StatsPage.tsx       # Dashboard de desempenho geral
├── types/
│   └── index.ts            # Interfaces TypeScript
├── App.tsx                 # Roteamento principal
├── index.css               # Estilos globais
└── main.tsx                # Entry point
```

## Conectando ao Backend (FastAPI)

Substitua as funções em `src/data/api.ts` por chamadas reais. Exemplo:

```ts
// Antes (mock)
async getProducts(): Promise<ProductWithStats[]> {
  await delay();
  return products.map(computeStats);
}

// Depois (API real)
async getProducts(search?: string, category?: string): Promise<ProductWithStats[]> {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (category) params.set('category', category);
  const res = await fetch(`http://localhost:8000/products?${params}`);
  return res.json();
}
```

## Licença

MIT
