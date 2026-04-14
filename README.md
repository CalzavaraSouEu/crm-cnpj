# CRM CNPJ — Template de Gestão de Empresas

CRM comercial full-stack com auto-cadastro de empresas via CNPJ. Busca automática de dados cadastrais e quadro societário usando APIs públicas (BrasilAPI + fallback CNPJ.ws). Pronto para ser clonado e adaptado a outros projetos.

## Stack Tecnológica

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Next.js (App Router, Turbopack) | 16.2 |
| Linguagem | TypeScript | 5.x |
| UI | Tailwind CSS + shadcn/ui (base-ui) | 4.x |
| Formulários | React Hook Form + Zod | 7.x / 4.x |
| ORM | Prisma | 6.x |
| Banco de dados | SQLite (dev) — migrável para PostgreSQL | — |
| Ícones | Lucide React | 1.x |
| Notificações | Sonner (toast) | 2.x |

## Funcionalidades

### Cadastro de Empresas
- Busca automática de dados por CNPJ (BrasilAPI com fallback CNPJ.ws)
- Validação de dígitos verificadores do CNPJ
- Máscara de input (`XX.XXX.XXX/XXXX-XX`)
- Auto-preenchimento de todos os campos: razão social, nome fantasia, situação cadastral, data de abertura, natureza jurídica, capital social, porte, CNAE, endereço completo, contato
- Cache in-memory de consultas CNPJ (1h TTL)

### Quadro Societário (Sócios)
- Extração automática do quadro societário das APIs de CNPJ
- Tabela editável com `useFieldArray` (adicionar, editar e remover sócios)
- Campos: Nome, CPF/CNPJ, Qualificação, Data de Entrada
- Persistência relacional (1:N com Empresa, cascade delete)
- Contagem de sócios exibida na listagem

### CRUD Completo
- **Criar**: formulário com auto-preenchimento via CNPJ
- **Listar**: tabela com busca server-side, paginação e contagem de sócios
- **Editar**: formulário pré-preenchido com dados existentes (incluindo sócios)
- **Excluir**: dialog de confirmação com exclusão em cascata

### UX/UI
- Layout responsivo (80% da viewport, breakpoints sm/lg)
- Tabela de sócios com scroll horizontal em mobile
- Dropdown de ações por registro (Editar / Excluir)
- Dialog de confirmação para exclusão
- Toast notifications (sucesso/erro)
- Error boundaries em todas as rotas
- Navegação pelo header (logo clicável)

## Como Rodar

```bash
# 1. Clonar o repositório
git clone https://github.com/CalzavaraSouEu/crm-cnpj.git
cd crm-cnpj

# 2. Instalar dependências
npm install

# 3. Criar banco de dados (SQLite local)
npx prisma db push

# 4. Rodar em desenvolvimento
npm run dev
```

Acesse `http://localhost:3000`. A página inicial redireciona para a listagem de empresas.

## Como Usar como Template

### 1. Clonar e renomear

```bash
git clone https://github.com/CalzavaraSouEu/crm-cnpj.git meu-projeto
cd meu-projeto
rm -rf .git
git init
```

### 2. Trocar o banco de dados (opcional)

Para usar PostgreSQL em produção, edite `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Crie um `.env` com a connection string:

```env
DATABASE_URL="postgresql://user:pass@host:5432/dbname"
```

E rode:

```bash
npx prisma db push
```

### 3. Adicionar novos models

Siga o padrão existente:

1. **Prisma**: adicione o model em `prisma/schema.prisma` com relações
2. **Schemas**: crie schemas Zod em `src/lib/schemas.ts` (form + API)
3. **API**: crie rotas em `src/app/api/[recurso]/route.ts` (GET/POST) e `src/app/api/[recurso]/[id]/route.ts` (GET/PUT/DELETE)
4. **Páginas**: crie em `src/app/[recurso]/page.tsx` (listagem), `nova/page.tsx` (criar), `[id]/editar/page.tsx` (editar)
5. **Componentes**: crie form e table em `src/components/`

### 4. Adicionar componentes shadcn/ui

```bash
npx shadcn@latest add [componente]
```

Componentes já instalados: `button`, `input`, `label`, `card`, `table`, `badge`, `separator`, `sonner`, `alert-dialog`, `dropdown-menu`.

## Estrutura do Projeto

```
prisma/
└── schema.prisma                    # Models: Empresa (22 campos), Socio (6 campos)

src/
├── app/
│   ├── layout.tsx                   # Layout raiz (header com nav, Toaster)
│   ├── page.tsx                     # Redirect → /empresas
│   ├── api/
│   │   ├── cnpj/[cnpj]/route.ts     # GET — Proxy CNPJ (BrasilAPI → CNPJ.ws)
│   │   └── empresas/
│   │       ├── route.ts             # GET (paginado + _count) / POST (nested create)
│   │       └── [id]/route.ts        # GET / PUT (transaction) / DELETE (cascade)
│   └── empresas/
│       ├── page.tsx                 # Listagem de empresas
│       ├── error.tsx                # Error boundary
│       ├── nova/
│       │   ├── page.tsx             # Formulário de cadastro
│       │   └── error.tsx            # Error boundary
│       └── [id]/
│           └── editar/page.tsx      # Formulário de edição
│
├── components/
│   ├── ui/                          # shadcn/ui (base-ui)
│   ├── cnpj-input.tsx               # Input CNPJ com máscara + auto-busca
│   ├── empresa-form.tsx             # Formulário (criar + editar, com useFieldArray)
│   └── empresas-table.tsx           # Tabela com busca, paginação, ações e dialog
│
└── lib/
    ├── cnpj.ts                      # Validação e formatação de CNPJ
    ├── db.ts                        # Prisma client singleton
    ├── schemas.ts                   # Schemas Zod (form + API, empresa + sócio)
    └── utils.ts                     # Utilitários (cn)
```

## Models do Banco

### Empresa
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int (PK, auto) | Identificador |
| cnpj | String (unique) | CNPJ sem formatação |
| razaoSocial | String | Razão social |
| nomeFantasia | String? | Nome fantasia |
| situacaoCadastral | String? | Ativa, Inapta, etc. |
| dataAbertura | String? | Data de início de atividade |
| naturezaJuridica | String? | Ex: Sociedade Empresária Limitada |
| capitalSocial | Float? | Capital social em reais |
| porte | String? | Micro Empresa, EPP, Demais |
| cnaePrincipal | String? | Código CNAE |
| cnaeDescricao | String? | Descrição da atividade |
| logradouro, numero, complemento, bairro, municipio, uf, cep | String? | Endereço |
| email, telefone | String? | Contato |
| socios | Socio[] | Relação 1:N |

### Socio
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | Int (PK, auto) | Identificador |
| nome | String | Nome do sócio |
| cpfCnpj | String? | CPF ou CNPJ do sócio |
| qualificacao | String? | Ex: Sócio-Administrador |
| dataEntrada | String? | Data de entrada na sociedade |
| faixaEtaria | String? | Faixa etária (BrasilAPI) |
| empresaId | Int (FK) | Referência à Empresa (cascade delete) |

## APIs Externas

| API | Endpoint | Uso |
|-----|----------|-----|
| BrasilAPI | `brasilapi.com.br/api/cnpj/v1/{cnpj}` | Fonte primária (dados + QSA) |
| CNPJ.ws | `publica.cnpj.ws/cnpj/{cnpj}` | Fallback (dados + sócios) |

Ambas são gratuitas e públicas. O proxy server-side evita CORS e permite cache.

## CNPJs para Teste

| CNPJ | Empresa |
|------|---------|
| `19131243000197` | Google Brasil Internet Ltda |
| `00000000000191` | Banco do Brasil S.A. |
| `06318654000144` | Intergerais Comércio |
| `55567017000117` | Supracare |

## Scripts Disponíveis

```bash
npm run dev        # Desenvolvimento (Turbopack)
npm run build      # Build de produção
npm run start      # Servidor de produção
npm run lint       # ESLint
npx prisma studio  # Interface visual do banco
npx prisma db push # Sincronizar schema com o banco
```

## Licença

MIT
