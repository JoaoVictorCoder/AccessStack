# Guia de Manutencao

Este documento resume onde alterar o sistema sem precisar redescobrir a arquitetura manualmente.
O objetivo e reduzir o risco de quebrar contratos entre frontend, backend e banco ao fazer ajustes futuros.

## Visao rapida da arquitetura

- `frontend/src/App.jsx`: ponto central das rotas e da composicao das tres areas do sistema (`Publico`, `Admin`, `Operador QR`).
- `frontend/src/api/credenciamentoApi.js`: contrato HTTP do frontend com o backend.
- `frontend/src/components/*`: blocos visuais e formularios especializados.
- `backend/src/routes/*`: exposicao de endpoints.
- `backend/src/controllers/*`: adaptacao HTTP.
- `backend/src/http/*`: helpers de camada HTTP (parsing de query/paginacao e contexto de ator).
- `backend/src/services/*`: regras de negocio mais amplas e fluxos administrativos.
- `backend/src/application/*`: casos de uso e portas da estrutura hexagonal.
- `backend/src/adapters/out/*`: ligacao da aplicacao com persistencia, PDF, QR e catraca.
- `backend/src/repositories/*`: acesso ao Prisma.
- `backend/prisma/schema.prisma`: modelo de dados.

## Fluxos principais

### 1. Credenciamento publico

1. A tela em `frontend/src/App.jsx` monta o formulario com base em `frontend/src/constants/formConfig.js`.
2. A validacao local acontece em `frontend/src/utils/validation.js`.
3. O envio usa `createCredenciadoPublic` em `frontend/src/api/credenciamentoApi.js`.
4. O backend recebe em `POST /credenciados`, processa o cadastro e gera credencial/QR/PDF.

Se um campo novo for adicionado, normalmente os arquivos afetados sao:

- `frontend/src/constants/formConfig.js`
- `frontend/src/utils/validation.js`
- `frontend/src/components/CredenciadoForm.jsx`
- `frontend/src/App.jsx`
- validador ou service correspondente no backend
- `backend/prisma/schema.prisma`, se houver persistencia nova

### 2. Painel administrativo

`frontend/src/App.jsx` concentra a carga de dados do admin na funcao `loadData`.
Esse e o melhor lugar para encaixar novos cards, listas ou relatorios, porque o refresh ja esta centralizado apos operacoes CRUD.

Regras praticas:

- Se mudar filtros da listagem, atualizar frontend e backend juntos.
- Se mudar permissoes por papel, revisar a navegacao e a carga de dados condicionada por `admin.role`.
- Se uma tela precisar de detalhes adicionais do credenciado, revisar `backend/src/repositories/credenciadoRepository.js`, pois o `includeIdentity` abastece varias consultas.

### 3. Operacao de QR / check-in

- Login do operador: `POST /auth/operator/login`
- Validacao: `POST /operator/check-in/validate`
- Historico resumido: `GET /operator/history-basic`

O frontend trata operador como uma sessao separada, apesar de o backend devolver o usuario no mesmo formato de `admin`.
Essa separacao acontece em `frontend/src/App.jsx` pelo `role === "OPERADOR_QR"`.

## Pontos de acoplamento sensiveis

### Contrato HTTP

Qualquer endpoint novo ou alterado deve entrar primeiro em `frontend/src/api/credenciamentoApi.js`.
Evite `fetch` direto dentro de componentes; isso espalha contrato de API e dificulta manutencao.

### Layout do PDF

O desenho da credencial esta em `backend/src/providers/pdf/credentialPdfProvider.js`.
Altere esse arquivo quando precisar mudar:

- identidade visual
- patrocinadores
- textos fixos
- dimensoes ou dobras
- organizacao QR/codigo de barras

O adapter `backend/src/adapters/out/pdf/pdfAdapter.js` deve continuar fino; a regra e manter a assinatura estavel da geracao de PDF.

### Integracao de catraca

Hoje `backend/src/adapters/out/gate/gateAdapter.js` aponta para um mock.
Quando houver integracao real, a troca ideal acontece no provider/adapter sem reescrever os casos de uso.

### Persistencia

O adapter `backend/src/adapters/out/prisma/prismaAdapter.js` reexporta as operacoes necessarias para a aplicacao.
Prefira preservar esse contrato e modificar os repositories quando houver mudanca de banco, include ou estrategia de consulta.

Os includes/selects compartilhados de consultas Prisma ficam em `backend/src/repositories/queryFragments.js`.
Quando um payload de consulta for alterado, ajuste primeiro esse arquivo e depois valide os mappers e telas que dependem dele.

### Parsing HTTP e escopo de ator

Para manter consistencia entre controllers:

- `backend/src/http/queryParsers.js`: paginação, limites e strings de query.
- `backend/src/http/actorContext.js`: resolve `actorType` e escopo de comissao organizadora.

Ao criar endpoint novo, reutilize esses helpers antes de adicionar parsing manual em controller.

## Receitas de alteracao comum

### Adicionar um campo no cadastro

1. Adicionar valor padrao em `frontend/src/constants/formConfig.js`.
2. Exibir o campo em `frontend/src/components/CredenciadoForm.jsx`.
3. Validar e normalizar em `frontend/src/utils/validation.js`.
4. Sincronizar efeitos derivados em `frontend/src/App.jsx`, se houver mascara ou preenchimento automatico.
5. Ajustar backend, banco e responses.
6. Testar cadastro publico, visualizacao admin e PDF, se o campo aparecer na credencial.

### Adicionar um novo filtro administrativo

1. Criar o estado do filtro no `App.jsx`.
2. Enviar o parametro via `frontend/src/api/credenciamentoApi.js`.
3. Ler o query param na rota/controller/backend.
4. Aplicar o filtro no repository.

### Adicionar um novo papel de usuario interno

1. Atualizar enums/seed/schema no backend.
2. Revisar autenticacao e autorizacao.
3. Revisar `App.jsx` para navegacao, tabs e blocos condicionais.
4. Revisar componentes de gestao de usuarios internos.

### Alterar o PDF da credencial

1. Ajustar `backend/src/providers/pdf/credentialPdfProvider.js`.
2. Gerar um PDF de amostra.
3. Validar se o QR continua legivel e se o layout ainda cabe em A4 dobravel.

## Ordem segura para mudancas estruturais

1. Atualizar schema e contratos do backend.
2. Atualizar repositories (inclusive `queryFragments.js`) e services.
3. Atualizar controllers, reaproveitando helpers em `backend/src/http/*`.
4. Atualizar `frontend/src/api/credenciamentoApi.js`.
5. Atualizar telas e componentes.
6. Validar manualmente os tres fluxos: publico, admin e operador.

## Checklist rapido antes de finalizar uma alteracao

- O endpoint mudou? Atualizou `credenciamentoApi.js`.
- O payload mudou? Atualizou validacao, DTO e persistencia.
- O papel do usuario mudou? Revisou renderizacao por `role`.
- A listagem admin mudou? Revisou `includeIdentity` e filtros do repository.
- O PDF mudou? Gerou um arquivo real para conferir visualmente.
- O dado e sensivel? Revisou impacto em LGPD, audit log e exibicao publica.
