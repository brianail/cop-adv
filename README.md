# COP Blog — Deploy no Vercel

## Estrutura
```
/
├── blog.html           ← página pública do blog
├── admin/index.html    ← painel do cliente (protegido por senha)
├── api/
│   ├── posts.js        ← GET /api/posts · POST /api/posts
│   ├── posts/[id].js   ← GET · PUT · DELETE /api/posts/:id
│   ├── upload.js       ← POST /api/upload
│   ├── setup.js        ← POST /api/setup (cria tabela — usar 1 vez)
│   └── auth/login.js   ← POST /api/auth/login
├── lib/
│   ├── db.js           ← conexão Vercel Postgres
│   └── auth.js         ← middleware JWT
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

### 7. Inicialize o banco
O endpoint `POST /api/setup` cria/atualiza tabelas e colunas e **exige JWT** (mesmo token do login).

Após entrar no painel `/admin`, o próprio dashboard chama `/api/setup` automaticamente (idempotente). Também é possível via curl, após obter o token em `POST /api/auth/login`:

```bash
curl -X POST https://seu-dominio.vercel.app/api/setup \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

---

## Uso

### Painel do cliente
Acesse: `https://seu-dominio.vercel.app/admin`
- Entre com a senha definida em `ADMIN_PASSWORD`
- Crie, edite e exclua posts

### Blog público
Acesse: `https://seu-dominio.vercel.app/blog.html`
- Posts carregados dinamicamente da API

---

## Segurança
- O painel `/admin` exige senha (comparação resistente a *timing attacks*)
- Todas as rotas de escrita (posts, upload, newsletter admin, setup) exigem token JWT válido
- A listagem de inscritos da newsletter (`GET /api/newsletter`) exige JWT — não use mais senha na query string
- Tokens expiram em 8 horas
- O banco só aceita conexões do servidor Vercel
- Variável opcional `ALLOWED_ORIGIN` restringe o cabeçalho CORS ao domínio do site
