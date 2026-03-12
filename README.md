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
| `JWT_SECRET` | String aleatória longa (ex: use https://randomkeygen.com) |

### 6. Faça redeploy
- **Deployments → ⋯ → Redeploy**

### 7. Inicialize o banco (fazer apenas uma vez)
Com o projeto no ar, faça uma requisição autenticada para criar a tabela:
```bash
curl -X POST https://seu-dominio.vercel.app/api/setup \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```
Ou acesse o painel admin → faça login → o setup roda automaticamente na primeira publicação.

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
- O painel `/admin` exige senha
- Todas as rotas de escrita (POST/PUT/DELETE) exigem token JWT válido
- Tokens expiram em 8 horas
- O banco só aceita conexões do servidor Vercel
