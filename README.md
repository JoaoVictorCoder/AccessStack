# Checkpoint 1 - Credenciamento Setor Cafeeiro

Sistema web full stack para cadastro e consulta de credenciados em evento do setor cafeeiro.

Stack:
- React + Vite
- Node.js + Express
- PostgreSQL
- Prisma
- Docker Compose

## Estrutura

```txt
.
|-- backend
|   |-- prisma
|   |   |-- schema.prisma
|   |   `-- seed.js
|   |-- src
|   |   |-- app.js
|   |   |-- prisma.js
|   |   |-- server.js
|   |   `-- validation.js
|   |-- Dockerfile
|   |-- package.json
|   `-- start.sh
|-- frontend
|   |-- src
|   |   |-- App.jsx
|   |   |-- main.jsx
|   |   `-- styles.css
|   |-- Dockerfile
|   |-- index.html
|   |-- package.json
|   `-- vite.config.js
`-- docker-compose.yml
```

## Categorias suportadas

- Expositor: `cnpj`, `siteEmpresa`, `nomeEmpresa`
- Cafeicultor: `ccir`, `nomePropriedade`
- Visitante: sem campos extras
- Imprensa: `cnpj`, `nomeVeiculo`, `siteEmpresa`
- Comissao Organizadora: `funcaoCargo`
- Colaborador Terceirizado: `cnpj`, `nomeEmpresa`, `funcaoCargo`

Campos comuns:
- `id` UUID (gerado no backend)
- `nomeCompleto`
- `cpf`
- `rg`
- `celular`
- `email`
- `municipio`
- `uf`
- `aceitouLgpd`

## API

- `POST /credenciados`
- `GET /credenciados`
- `GET /credenciados/:id`

Healthcheck:
- `GET /health`

## Rodando com Docker Compose (recomendado)

Na raiz do projeto:

```bash
docker compose up --build
```

URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- PostgreSQL: `localhost:5432`

Credenciais do banco (docker):
- Database: `credenciamento`
- User: `postgres`
- Password: `postgres`

## Rodando local sem Docker

Pre-requisitos:
- Node 20+
- PostgreSQL rodando local

### 1) Backend

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npx prisma db push
npm run seed
npm run dev
```

### 2) Frontend

Em outro terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Exemplo de payload

```json
{
  "categoria": "EXPOSITOR",
  "nomeCompleto": "Joao da Silva",
  "cpf": "12345678900",
  "rg": "1234567",
  "celular": "11999999999",
  "email": "joao@empresa.com",
  "municipio": "Ribeirao Preto",
  "uf": "SP",
  "aceitouLgpd": true,
  "cnpj": "12345678000199",
  "siteEmpresa": "https://empresa.com",
  "nomeEmpresa": "Cafe Forte"
}
```

## Dados de teste

O seed cria 3 registros iniciais:
- 1 Expositor
- 1 Cafeicultor
- 1 Visitante

Arquivo: `backend/prisma/seed.js`.
