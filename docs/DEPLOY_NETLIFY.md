# Deploy no Netlify

O `netlify.toml` na raiz publica o projeto inteiro no Netlify:

- **Frontend**: build do Vite servido como site estático (`frontend/dist`).
- **Backend**: o app Express roda como uma Netlify Function
  (`backend/netlify/functions/api.js`), exposta em `/api/*`. Frontend e API
  ficam no mesmo domínio, então o cookie de login funciona sem CORS.
- **Banco**: PostgreSQL externo. O [Neon](https://neon.tech) tem plano gratuito.

A cada deploy o build instala as dependências, aplica as migrations, roda o
seed e gera o frontend.

## 1. Criar o banco no Neon

1. Crie um projeto em https://console.neon.tech.
2. Em **Connection Details**, copie duas strings de conexão:
   - **Pooled connection** (o host contém `-pooler`): vai em `DATABASE_URL`.
     Acrescente `&pgbouncer=true&connection_limit=1` ao final.
   - **Direct connection** (sem `-pooler`): vai em `DIRECT_DATABASE_URL`.
     É usada só no build, para migrations e seed.

## 2. Criar o site no Netlify

1. **Add new project → Import an existing project → GitHub** e escolha o
   repositório.
2. Branch: a que você quer publicar. As configurações de build vêm do
   `netlify.toml`, não precisa preencher nada.
3. Antes do primeiro deploy, configure as variáveis abaixo em
   **Project configuration → Environment variables**.

## 3. Variáveis de ambiente

| Variável | Valor |
| --- | --- |
| `DATABASE_URL` | String *pooled* do Neon + `&pgbouncer=true&connection_limit=1` |
| `DIRECT_DATABASE_URL` | String *direct* do Neon |
| `NODE_ENV` | `production` |
| `JWT_SECRET` | Segredo aleatório com 32+ caracteres (ex.: `openssl rand -hex 32`) |
| `TRUST_PROXY` | `true` |
| `CORS_ORIGINS` | URL do site, ex.: `https://seu-site.netlify.app` |
| `BACKUP_DIR` | `/tmp/backups` |
| `ADMIN_PASSWORD`, `MASTER_PASSWORD`, `GATE_PASSWORD`, `SCANNER_PASSWORD`, `GOVERNANCE_PASSWORD` | Senhas dos usuários iniciais |

Opcionais: `ADMIN_EMAIL`, `MASTER_EMAIL`, `GATE_EMAIL`, `SCANNER_EMAIL`,
`GOVERNANCE_EMAIL`, `JWT_EXPIRES_IN`, `GATE_START_HOUR`, `GATE_END_HOUR` e os
limites `*_RATE_LIMIT_*` (veja `backend/.env.example`).

As senhas só são gravadas quando o usuário é criado. Trocar a variável depois
não muda a senha de quem já existe.

## 4. Deploy

Clique em **Deploy**. Depois de pronto:

- `https://seu-site.netlify.app/api/health` deve responder `{"status":"ok"}`.
- Entre no painel admin com o `MASTER_EMAIL` (padrão `owner@acessstack.local`)
  e a `MASTER_PASSWORD` que você definiu.

## Limitações desta hospedagem

- **Backups**: o export grava em `/tmp`, que é apagado entre execuções da
  função. Use os backups do próprio Neon.
- **Rate limit**: os contadores ficam em memória em cada instância da função,
  então o limite é aproximado.
- **Tempo de execução**: funções do Netlify têm limite de 10 s por requisição
  (padrão), suficiente para as rotas atuais.
- **Dados de demonstração**: o seed cria um evento e alguns participantes de
  exemplo. Apague-os pelo painel se não quiser que apareçam.
- **Primeira requisição lenta**: depois de um tempo sem uso, a função e o banco
  do Neon (plano gratuito) "dormem" e a primeira chamada demora alguns segundos.

Para uma hospedagem definitiva, o `docker-compose.yml` continua funcionando em
qualquer servidor com Docker.
