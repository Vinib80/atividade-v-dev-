# Sistema de Gerenciamento de E-Commerce

Este projeto é um módulo de um Sistema de Gerenciamento de E-Commerce, desenvolvido como parte da atividade da Visagio.

## Stack Tecnológica

-   **Frontend:** React com TypeScript, Vite e Tailwind CSS.
-   **Backend:** Python com FastAPI, SQLite, SQLAlchemy e Alembic.

## Pré-requisitos

-   [Python 3.8+](https://www.python.org/downloads/)
-   [Node.js 16+](https://nodejs.org/en/) (que inclui o npm)

## Como Executar a Aplicação

Siga os passos abaixo para configurar e executar o ambiente de desenvolvimento local.

### 1. Backend (FastAPI)

Navegue até a pasta do backend:
```bash
cd backend
```

**Crie e ative um ambiente virtual:**

*No Linux/macOS:*
```bash
python3 -m venv .venv
source .venv/bin/activate
```

*No Windows:*
```bash
python -m venv .venv
.venv\Scripts\activate
```

**Instale as dependências:**
```bash
pip install -r requirements.txt
```

**Aplique as migrações do banco de dados:**
O Alembic cuidará da criação do banco de dados SQLite (`app.db`) e da aplicação das tabelas.
```bash
alembic upgrade head
```

**Popule o banco de dados com dados iniciais:**
Execute o script para popular o banco de dados com os dados dos arquivos CSV.
```bash
python popular_banco.py
```

**Inicie o servidor backend:**
```bash
uvicorn app.main:app --reload
```
O servidor estará em execução em `http://127.0.0.1:8000`. Você pode acessar a documentação da API em `http://127.0.0.1:8000/docs`.

### 2. Frontend (React)

Em um **novo terminal**, navegue até a pasta do frontend:
```bash
cd frontend
```

**Instale as dependências:**
```bash
npm install
```

**Inicie o servidor de desenvolvimento:**
```bash
npm run dev
```
A aplicação frontend estará acessível em `http://localhost:5173` (ou outra porta, se a 5173 estiver em uso).

## Estrutura do Projeto

```
/
├── backend/                # Código-fonte do FastAPI
│   ├── alembic/            # Migrações do Alembic
│   ├── app/                # Lógica principal da aplicação
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── routers/        # Rotas da API
│   │   ├── crud.py         # Funções de acesso ao banco
│   │   ├── main.py         # Ponto de entrada da API
│   │   └── ...
│   ├── dados/              # Arquivos CSV para popular o banco
│   ├── alembic.ini         # Configuração do Alembic
│   ├── popular_banco.py    # Script para popular o banco
│   └── requirements.txt    # Dependências Python
│
└── frontend/               # Código-fonte do React
    ├── src/                # Arquivos da aplicação
    │   ├── components/     # Componentes React reutilizáveis
    │   ├── pages/          # Páginas da aplicação
    │   ├── data/           # Lógica de acesso à API
    │   ├── types/          # Definições de tipos TypeScript
    │   └── ...
    ├── package.json        # Dependências e scripts Node.js
    └── vite.config.ts      # Configuração do Vite
```
