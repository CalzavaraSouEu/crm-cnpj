# CRM - Auto-Cadastro por CNPJ

CRM comercial que busca automaticamente dados de empresas via CNPJ usando APIs públicas (BrasilAPI + fallback CNPJ.ws).

## Stack

- **Next.js 16** (App Router) — full-stack React
- **TypeScript** — segurança de tipos
- **Tailwind CSS + shadcn/ui** — UI profissional
- **React Hook Form + Zod** — formulários com validação robusta
- **Prisma + SQLite** — banco zero-config (migra fácil para PostgreSQL)

## Funcionalidades

- Busca automática de dados por CNPJ (BrasilAPI com fallback)
- Validação de dígitos verificadores do CNPJ
- Máscara de input (`XX.XXX.XXX/XXXX-XX`)
- Auto-preenchimento de todos os campos do formulário
- Listagem com busca server-side e paginação
- Cache in-memory de consultas CNPJ (1h TTL)
- Error boundaries em todas as rotas
- Toast notifications (sucesso/erro)

## Como rodar

```bash
# Instalar dependências
npm install

# Criar banco de dados
npx prisma db push

# Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` e vá em **Nova Empresa** para testar.

## Estrutura

```
src/
├── app/
│   ├── api/
│   │   ├── cnpj/[cnpj]/route.ts   # Proxy CNPJ (BrasilAPI → fallback)
│   │   └── empresas/route.ts       # CRUD empresas (GET paginado, POST)
│   ├── empresas/
│   │   ├── page.tsx                # Listagem
│   │   ├── error.tsx               # Error boundary
│   │   └── nova/
│   │       ├── page.tsx            # Formulário de cadastro
│   │       └── error.tsx           # Error boundary
│   ├── layout.tsx                  # Layout raiz
│   └── page.tsx                    # Redirect → /empresas
├── components/
│   ├── ui/                         # shadcn/ui
│   ├── cnpj-input.tsx              # Input CNPJ com máscara + auto-busca
│   ├── empresa-form.tsx            # Formulário completo
│   └── empresas-table.tsx          # Tabela com busca + paginação
├── lib/
│   ├── cnpj.ts                     # Validação/formatação CNPJ
│   ├── db.ts                       # Prisma singleton
│   ├── schemas.ts                  # Schemas Zod compartilhados
│   └── utils.ts                    # Utilitários (cn)
└── prisma/
    └── schema.prisma               # Model Empresa (19 campos + indexes)
```

## CNPJs para teste

- `19131243000197` — Google Brasil
- `00000000000191` — Banco do Brasil

## Licença

MIT
