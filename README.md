# COP Blog — Deploy no Vercel

## Estrutura
```text
/
├── public/                 ← arquivos estáticos e páginas públicas
│   ├── index.html          ← página inicial (home)
│   ├── blog.html           ← blog e notícias (dinâmico)
│   ├── clientes.html       ← página de parceiros/clientes (estático + JS dinâmico)
│   ├── equipe.html         ← corpo jurídico e equipe (página dedicada)
│   ├── admin/
│   │   └── index.html      ← painel do cliente (protegido por senha/JWT)
├── api/                    ← backend Vercel Serverless Functions
│   ├── posts.js            ← GET /api/posts · POST /api/posts
│   ├── posts/[id].js       ← GET · PUT · DELETE /api/posts/:id
│   ├── events.js           ← GET /api/events · POST /api/events
│   ├── events/[id].js      ← GET · PUT · DELETE /api/events/:id
│   ├── shorts.js           ← GET /api/shorts · POST /api/shorts (CRUD Web Stories)
│   ├── upload.js           ← POST /api/upload
│   ├── setup.js            ← POST /api/setup (cria e formata tabelas do banco)
│   └── auth/login.js       ← POST /api/auth/login
├── lib/
│   ├── db.js               ← conexão e métodos para @vercel/postgres
│   ├── allocateSlug.js     ← gerador inteligente de slugs únicos para posts/eventos
│   └── auth.js             ← middleware de autenticação JWT para API
├── .env.example
├── package.json
└── vercel.json
```

---

## Passo a passo do deploy

### 1. Suba o projeto no GitHub
```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/seu-usuario/cop.git
git push -u origin main
```

### 2. Importe no Vercel
- Acesse https://vercel.com/new
- Importe o repositório do GitHub
- Clique em **Deploy** (sem configurar nada ainda)

### 3. Crie o banco de dados (Vercel Postgres)
- No dashboard do projeto: **Storage → Create → Postgres**
- Dê um nome (ex: `cop-blog-db`)
- Clique em **Connect** — as variáveis `POSTGRES_*` são adicionadas automaticamente

### 4. Crie o storage de imagens (Vercel Blob)
- **Storage → Create → Blob**
- Dê um nome (ex: `cop-blog-images`)
- Clique em **Connect** — `BLOB_READ_WRITE_TOKEN` é adicionada automaticamente

### 5. Adicione as variáveis de ambiente
No painel do projeto: **Settings → Environment Variables**

| Variável | Valor |
|---|---|
| `ADMIN_PASSWORD` | Senha escolhida pelo cliente |
| `JWT_SECRET` | String aleatória longa (mín. 16 caracteres; recomenda-se 32+) |
| `ALLOWED_ORIGIN` | (Opcional) URL do site para restringir CORS; vazio = `*` |
| `CLOUDINARY_*` | Credenciais Cloudinary para upload de imagens no painel |

### 6. Faça redeploy
- **Deployments → ⋯ → Redeploy**

### 7. Inicialize o banco de dados
O endpoint `POST /api/setup` cria/atualiza as tabelas estruturais de banco do sistema (`posts`, `events`, `shorts`, `metrics`) e **exige JWT autoritário** (mesmo token do login).

Após entrar no painel administrativo `/admin`, o próprio dashboard invoca o `/api/setup` na abas pertinentes, de forma automática e segura (idempotente).
Também é possível fazê-lo manualmente via curl, após obter o token em `POST /api/auth/login`:

```bash
curl -X POST https://seu-dominio.vercel.app/api/setup \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## Uso

### Painel Administrativo do Cliente
Acesse: `https://seu-dominio.vercel.app/admin`
- Entre com a senha definida em `ADMIN_PASSWORD`
- Crie, edite e exclua Posts (Artigos de Blog) e Eventos (Agenda OAB/Sindicatos)
- Gerencie as URLs do YouTube Shorts que formam os Stories Circulares do portal
- Visualize métricas e informações gerais.

### Portal Público (Institucional)
Acesse a raiz: `https://seu-dominio.vercel.app/`
- Renderização limpa da apresentação geral do Escritório
- Carrossel dinâmico de Web Stories (provenientes da tabela `shorts`)
- Demais menus roteando nativamente para `/equipe.html` e `/clientes.html`.
- O blog completo com Modal Viewer de alta performance está roteado em `/blog.html`.

---

## Segurança e Performance
- O painel `/admin` exige senha e resolve JWT tokens no cache (sem dependência de persistência para cookies).
- Todas as rotas de escrita na API (POST/PUT/DELETE em /posts, /events, /shorts, /setup) exigem o token no Bearer Header HTTP.
- Todos os endpoints com queries implementam **Bind Parameters** (ex: `sql\`SELECT * FROM posts WHERE id=${id}\``) via API nativa suportada pelo `@vercel/postgres`, garantindo proteção absoluta contra injeção de SQL.
- Tokens JWT expiram tipicamente numa sessão local limitante em 8/12 horas.
- Variável opcional `ALLOWED_ORIGIN` restringe o cabeçalho pre-flight de CORS apenas ao domínio verificado.
