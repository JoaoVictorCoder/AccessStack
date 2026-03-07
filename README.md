# Checkpoint 2 - Plataforma de Credenciamento (Publico + Admin)

Evolucao incremental sobre o projeto existente, sem recriar do zero.

## O que foi implementado no Checkpoint 2

- Separacao clara entre area publica e area administrativa.
- Autenticacao com JWT em cookie HttpOnly e autorizacao por papeis.
- Papeis: `ADMIN`, `APP_GATE`, `SYSTEM`.
- DTOs separados para publico/admin/check-in/audit/fraude.
- Geração de QR Code e PDF da credencial.
- Fluxo de validacao de acesso/check-in com `ALLOW`/`DENY` e motivo.
- Arquitetura pronta para integracao de catraca via `GateProvider` (mock).
- Analytics simples e insights de fraude.
- LGPD aplicada com minimizacao de dados.

## Estrutura principal

```txt
backend/
  prisma/
    schema.prisma
    seed.js
    migrations/
      20260307120000_iam_foundation/
      20260307123000_add_observability_indexes/
      20260307140000_add_admin_user/
      20260308100000_checkpoint2_security_access/
  src/
    config/
    controllers/
    domain/
    middlewares/
    mappers/
    providers/
      gate/
      pdf/
      qrcode/
    repositories/
    routes/
    services/
    validators/
frontend/
  src/
    api/
    components/
    constants/
    App.jsx
```

## Modelos atuais (Prisma)

- `Credenciado`
- `Credencial`
- `EventoSistema`
- `AdminUser`
- `AuditLog`
- `GateDevice`
- `AccessAttempt`

## Enums/status

- `Categoria`
- `StatusCredenciamento`: `CADASTRADO`, `APROVADO`, `BLOQUEADO`, `CHECKED_IN`
- `StatusCredencial`: `GERADA`, `ATIVA`, `INATIVA`, `UTILIZADA`
- `TipoEventoSistema`: `CREDENCIAMENTO_CRIADO`, `CREDENCIAL_GERADA`, `DADOS_ATUALIZADOS`, `ACESSO_VALIDADO`, `ACESSO_NEGADO`
- `AdminRole`: `ADMIN`, `APP_GATE`, `SYSTEM`
- `AccessResult`: `ALLOW`, `DENY`
- `AccessReason`: `CREDENCIAL_INVALIDA`, `CREDENCIAL_BLOQUEADA`, `JA_UTILIZADA`, `FORA_DO_HORARIO`, `ACESSO_PERMITIDO`
- `AuditActorType`: `ADMIN_USER`, `APP_GATE`, `SYSTEM`

## Rotas

Publicas:
- `POST /credenciados`
- `GET /credenciados/:id/status`
- `GET /credenciais/:id/pdf`
- `GET /credenciais/:id/qrcode`
- `GET /health`

Auth:
- `POST /auth/login`
- `POST /auth/logout`
- `GET /auth/me`

Admin protegidas:
- `GET /admin/credenciados`
- `GET /admin/credenciados/:id`
- `GET /admin/credenciados/:id/eventos`
- `POST /admin/credenciados/comissao-organizadora`
- `GET /admin/eventos`
- `GET /admin/audit-logs`
- `POST /admin/check-in/validate`
- `GET /admin/analytics/overview`
- `GET /admin/analytics/fraud`
- `GET /admin/credenciais/:id`

## LGPD (aplicado)

- Cadastro publico exige `aceitouLgpd = true`.
- Texto explicito de consentimento no formulario publico.
- Dados minimizados em respostas publicas.
- Listagens administrativas protegidas por autenticacao/role.
- CPF mascarado em listagens administrativas.
- Dados completos apenas em detalhes administrativos.
- Trilhas de auditoria para acoes administrativas e check-in.
- Estrutura preparada para retencao/anonimizacao futura.

## Credenciais seed

Admin:
- Email: `admin@evento.com`
- Senha: `Admin@123`
- Role: `ADMIN`

Gate app:
- Email: `gate@evento.com`
- Senha: `Gate@123`
- Role: `APP_GATE`

## Como rodar local

Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate:dev -- --name checkpoint2
npm run seed
npm run dev
```

Frontend:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Como rodar com Docker

```bash
docker compose up --build
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:3001`

## Como testar (roteiro rapido)

1. Cadastro publico em `/`.
2. Consulte status usando `GET /credenciados/:id/status`.
3. Abra PDF da credencial: `GET /credenciais/:id/pdf`.
4. Visualize QR: `GET /credenciais/:id/qrcode`.
5. Login admin em `/admin/login`.
6. No painel admin:
   - lista/busca/filtro de credenciados
   - detalhes de credenciado
   - eventos e audit logs
   - check-in via codigo unico (retorno ALLOW/DENY)
   - analytics overview e fraude
7. Consulte credencial interna em `/admin/credenciais/:id`.

## Pendencias/limitacoes atuais

- Gate provider real ainda nao implementado (apenas mock).
- Regras de fraude ainda sao heuristicas simples.
- Sem biometria/hardware real.
- Sem politica automatica de retencao/anonimizacao.
- Sem testes automatizados de integracao.
