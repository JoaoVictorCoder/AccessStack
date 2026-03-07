# Checkpoint 1 - Base IAM para Credenciamento de Evento

Refatoracao incremental do projeto original (sem recomeco do zero) para evoluir de cadastro simples para fundacao de identidade e acesso de eventos.

## O que mudou no dominio

Antes:
- `Credenciado` apenas como cadastro de participante.

Agora:
- `Credenciado` representa uma identidade do evento.
- Cada identidade possui status de credenciamento.
- Cada identidade possui uma `Credencial` digital vinculada.
- Cada acao relevante gera `EventoSistema` para rastreabilidade.

## Arquitetura atual (incremental)

```txt
.
|-- backend
|   |-- prisma
|   |   |-- migrations
|   |   |   |-- 20260307120000_iam_foundation
|   |   |   |   `-- migration.sql
|   |   |   `-- migration_lock.toml
|   |   |-- schema.prisma
|   |   `-- seed.js
|   |-- src
|   |   |-- controllers
|   |   |   |-- credenciadoController.js
|   |   |   |-- credencialController.js
|   |   |   `-- eventoSistemaController.js
|   |   |-- domain
|   |   |   `-- enums.js
|   |   |-- middlewares
|   |   |   `-- asyncHandler.js
|   |   |-- repositories
|   |   |   |-- credenciadoRepository.js
|   |   |   |-- credencialRepository.js
|   |   |   `-- eventoSistemaRepository.js
|   |   |-- routes
|   |   |   `-- index.js
|   |   |-- services
|   |   |   `-- credenciamentoService.js
|   |   |-- utils
|   |   |   `-- codeGenerator.js
|   |   |-- validators
|   |   |   `-- credenciadoValidator.js
|   |   |-- app.js
|   |   |-- prisma.js
|   |   `-- server.js
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
|-- docker-compose.yml
`-- README.md
```

## Modelo de dados (Prisma)

Entidades:
- `Credenciado`
- `Credencial`
- `EventoSistema`

Enums:
- `Categoria`
- `StatusCredenciamento`: `CADASTRADO`, `APROVADO`, `BLOQUEADO`, `CHECKED_IN`
- `StatusCredencial`: `GERADA`, `ATIVA`, `INATIVA`, `UTILIZADA`
- `TipoEventoSistema`: `CREDENCIAMENTO_CRIADO`, `CREDENCIAL_GERADA`, `DADOS_ATUALIZADOS`, `ACESSO_VALIDADO`, `ACESSO_NEGADO`

Relacoes:
- `Credenciado` 1:1 `Credencial`
- `Credenciado` 1:N `EventoSistema`

## Regras de negocio implementadas

No `POST /credenciados`:
1. valida categoria + campos comuns + campos dinamicos.
2. cria `Credenciado` com `statusCredenciamento = CADASTRADO`.
3. cria `Credencial` automatica com:
   - `codigoUnico`
   - `qrCodePayload` (payload pronto para checkpoint de QR)
   - `statusCredencial = GERADA`
4. registra eventos:
   - `CREDENCIAMENTO_CRIADO`
   - `CREDENCIAL_GERADA`

Tudo em transacao Prisma.

## API

Mantidas:
- `POST /credenciados`
- `GET /credenciados`
- `GET /credenciados/:id`

Novas:
- `GET /credenciais/:id`
- `GET /eventos`
- `GET /credenciados/:id/eventos`

Observacao:
- `GET /credenciados` e `GET /credenciados/:id` retornam dados essenciais da credencial vinculada (`include`).

## Frontend

Mantido:
- tela unica de cadastro/listagem.
- seletor de categoria.
- campos dinamicos por categoria.

Evoluido:
- apos cadastro, mostra status do credenciamento e codigo da credencial.
- listagem exibe:
  - nome
  - categoria
  - status
  - codigo da credencial
- detalhe mostra:
  - dados completos do credenciado + credencial
  - historico basico de eventos (`/credenciados/:id/eventos`)

## Como rodar (Docker)

```bash
docker compose up --build
```

Acessos:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`
- Health: `http://localhost:3001/health`

## Como rodar migrations

Com Docker (backend container):
- startup usa `prisma db push` para compatibilidade rapida de hackathon.
- migrations versionadas estao em `backend/prisma/migrations`.
- para aplicar migrations estritas no ambiente local, use os comandos abaixo.

Local (sem Docker):

```bash
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name iam_incremental_base
npm run seed
npm run dev
```

## Fluxo de teste rapido

1. Abra o frontend em `http://localhost:5173`.
2. Cadastre um participante (qualquer categoria).
3. Verifique mensagem de sucesso com:
   - status do credenciamento
   - codigo da credencial
4. Na lista, clique no registro criado.
5. Confira nos detalhes:
   - objeto da credencial vinculada
   - historico de eventos.
6. Opcional API:
   - `GET /eventos`
   - `GET /credenciais/:id`

## Restricoes respeitadas neste checkpoint

Nao implementado ainda:
- leitura de QR por camera
- autenticacao complexa
- dashboard analitico completo
- data lake real
- IA conversacional pronta

Mas a base ficou preparada para evolucao nesses pontos.
