# 📄 Arquitetura_e_Escopo_Tecnico.md
> **Objetivo deste documento:** Servir como o Product Requirements Document (PRD) e o guia definitivo de engenharia de software para o desenvolvimento full-stack do sistema financeiro. Este documento consolida **todas as decisões técnicas e de negócio já tomadas** e serve de contexto canônico para qualquer LLM ou desenvolvedor que precise entender ou implementar o projeto.

---

## 1. Stack Tecnológico (Decisões Finalizadas)

| Camada | Tecnologia | Justificativa |
|---|---|---|
| **Backend** | Laravel 12 (PHP 8.3) | Framework MVC robusto, ecossistema maduro para eventos e ORM |
| **Frontend Web** | React 19 + TypeScript | Componentes tipados, ecossistema rico |
| **Ponte Web** | Inertia.js | Elimina API REST para o frontend web; dados chegam via props do Controller
| **Banco de Dados** | MySQL / MariaDB | Suporte amplo, fácil containerização |
| **Autenticação** | Laravel Session | Sessão nativa (Breeze/Fortify); Sanctum previsto para API Mobile (Futuro) |
| **Containerização** | Docker (Laravel Sail) | Deploy reproduzível: `docker-compose up` sobe toda a stack |
| **CSS / UI** | Tailwind CSS | Utilidades atômicas alinhadas ao ecossistema Laravel/Inertia |

### 1.1. Serviços no Docker Compose

O `docker-compose.yml` (via Laravel Sail customizado) deve subir os seguintes serviços:

- `app` — Laravel (PHP-FPM)
- `mysql` — Banco de dados MySQL/MariaDB
- `redis` — Driver de cache

---

## 2. Arquitetura do Sistema

### 2.1. Modelo: Monolito Modular Híbrido

O sistema centraliza as regras de negócio no backend Laravel, entregando interfaces distintas:
- **Web:** Via Inertia.js (sem API REST — dados trafegam como props)
- **API Mobile (Futuro):** Via `routes/api.php` com JSON puro (Eloquent API Resources + Sanctum tokens)

### 2.2. Multi-Tenancy: Ledgers

O isolamento de dados **não é feito diretamente pelo `user_id`**, mas sim por um **Ledger** (tenant lógico). Isso permite, em versões futuras, o compartilhamento de um ledger entre múltiplos usuários (ex: casal, família).

- `users` ↔ `ledgers` é uma relação **N:N** via tabela pivot `ledger_user`.
- Toda entidade de domínio (`accounts`, `transactions`, etc.) pertence a um `ledger_id`.
- As transações também registram `created_by_user_id` para auditoria.
- No MVP, cada usuário terá exatamente **1 ledger** criado automaticamente no onboarding. A UI de gerenciamento de múltiplos ledgers é backlog.

### 2.3. Isolamento de Domínio: Action Pattern

Controllers devem ser **anêmicos** — apenas recebem a request validada e delegam para uma `Action`. Toda a inteligência contábil reside nas Actions:

```
HTTP Request
    └─> Form Request (validação)
        └─> Controller (anêmico)
            └─> Action (ex: RecordExpenseAction)
                └─> DB::transaction()
                    ├─> Cria Transaction
                    ├─> Cria JournalEntries (∑Débitos = ∑Créditos)
                    └─> Cria ExpectedCashFlows (se aplicável)
```

As rotas web (`routes/web.php`) e as rotas mobile (`routes/api.php`) chamam as **mesmas Actions**, garantindo paridade de comportamento entre os dois canais.

### 2.4. Ledger Imutável (Append-Only)

A tabela `journal_entries` **nunca recebe UPDATE nem DELETE**. Toda correção é feita via operação de **Reverse and Replace**:

1. Abre `DB::transaction()`
2. Gera entradas de compensação (inverte Débito ↔ Crédito da transação original)
3. Marca a transação original com `status = REVERSED` e `reversed_by_id`
4. Insere a nova transação corrigida
5. Commit atômico — se qualquer passo falhar, rollback total

### 2.5. CQRS Pragmático

- **Command:** Validado via *Form Requests* antes de tocar no domínio. Executado pela `Action` dentro de `DB::transaction()`.
- **Query:** Eloquent ORM com *Eager Loading* para evitar N+1 queries. Saldo das contas é calculado **em tempo real** via `SUM` sobre `journal_entries` (sem cache de saldo — decisão de MVP, pode ser otimizado com snapshot se necessário).

---

## 3. Regras de Negócio Centrais

### 3.1. Tipos de Lançamento (MVP)

| Tipo | Nome UI | Entradas do usuário | O que o motor gera |
|---|---|---|---|
| **Despesa Simples** | "Despesa" | Valor, conta de pagamento (débito/pix), categoria | DEBIT Expense + CREDIT Asset |
| **Despesa Cartão à Vista** | "Despesa (cartão)" | Valor, cartão, categoria | DEBIT Expense + CREDIT Liability (cartão) + 1 ExpectedCashFlow |
| **Despesa Cartão Parcelado** | "Despesa (parcelado)" | Valor total, nº parcelas, cartão, categoria | DEBIT Expense (total) + CREDIT Liability (total) + N ExpectedCashFlows |
| **Receita** | "Receita" | Valor, conta de destino, categoria de receita | DEBIT Asset + CREDIT Revenue |
| **Transferência** | "Transferência" | Valor, conta origem, conta destino | DEBIT Asset (destino) + CREDIT Asset (origem) |
| **Pagamento de Fatura** | "Pagar fatura" | Valor, conta de débito, fatura (cartão) | DEBIT Liability (cartão) + CREDIT Asset (conta) + marca ExpectedCashFlows como PAID |

> **Nota:** O usuário nunca vê "DEBIT / CREDIT". Ele vê apenas os campos semânticos da tabela acima.

### 3.2. Cartão de Crédito Parcelado — Fluxo Detalhado

**Exemplo:** Compra de R$ 300,00 em 3x no Cartão Nubank, realizada em 10/07/2025. Cartão com fechamento dia 15 e vencimento dia 5.

**Passo 1 — Ledger (Regime de Competência, imutável):**
```
transaction { date: 2025-07-10, description: "Compra XYZ 3x" }
  journal_entry { account: Alimentação (EXPENSE), type: DEBIT,  amount: 30000 }
  journal_entry { account: Nubank (LIABILITY),    type: CREDIT, amount: 30000 }
```

**Passo 2 — Projeção de Caixa (Regime de Caixa, mutável):**
```
expected_cash_flow { installment: 1/3, due_date: 2025-08-05, amount: 10000, invoice: Fatura Ago/25 }
expected_cash_flow { installment: 2/3, due_date: 2025-09-05, amount: 10000, invoice: Fatura Set/25 }
expected_cash_flow { installment: 3/3, due_date: 2025-10-05, amount: 10000, invoice: Fatura Out/25 }
```

> A data da 1ª parcela é calculada automaticamente: como a compra (dia 10) é antes do fechamento (dia 15), ela entra na fatura que **fecha** em 15/07 e **vence** em 05/08.

**Passo 3 — Pagamento da Fatura Agosto:**
```
transaction { date: 2025-08-05, description: "Pagamento Fatura Nubank Ago/25" }
  journal_entry { account: Nubank (LIABILITY),      type: DEBIT,  amount: 10000 }
  journal_entry { account: C.Corrente (ASSET),      type: CREDIT, amount: 10000 }
  → expected_cash_flow (1/3) marcado como PAID
  → credit_card_invoice (Ago/25) marcado como PAID
```

### 3.3. Cálculo de Saldo

O saldo de qualquer conta é calculado **em tempo real** via SUM dos `journal_entries`:

- **Conta ASSET:** `saldo = SUM(DEBIT) - SUM(CREDIT)`
- **Conta LIABILITY:** `saldo_devedor = SUM(CREDIT) - SUM(DEBIT)`
- **Conta REVENUE:** `total = SUM(CREDIT) - SUM(DEBIT)`
- **Conta EXPENSE:** `total = SUM(DEBIT) - SUM(CREDIT)`

Apenas entradas de transactions com `status = ACTIVE` são consideradas.

### 3.4. Hierarquia de Contas e Categorias

A tabela `accounts` serve tanto para **contas financeiras** (Conta Corrente, Cartão) quanto para **categorias** (Alimentação, Transporte). A distinção é feita pelo campo `type` (ASSET, LIABILITY, EXPENSE, REVENUE, EQUITY).

**Regras de hierarquia (enforçadas em código na Action):**
- Profundidade máxima: **2 níveis** (pai + filho).
- Um nó raiz (sem `parent_id`) não pode ser filho de nenhuma outra conta. O plano base do sistema já preenche a raiz com contas genéricas reais.
- Uma conta-filho não pode ter filhos — a tentativa dispara uma `ValidationException`.
- Contas financeiras de primeiro nivel (Ativo, Passivo, Patrimônio) são marcadas como `is_system = true` e não podem ser excluídas ou editadas. Categorias de receita e despesa são criadas automaticamente no onboarding mas pertencem ao usuário — são marcadas como `is_system = false` e podem ser editadas, desativadas ou excluídas.
- Deleção Segura e Inativação:
  - **Contas sem histórico**: Podem ser excluídas definitivamente (Soft Delete via `deleted_at`).
  - **Contas com histórico e saldo zerado**: São marcadas como `status = INACTIVE` (Inativação).
  - **Contas com histórico e saldo pendente ou subcontas**: A operação é bloqueada para garantir a integridade do ledger.
 
 **Exemplo de árvore:**
 ```
 Alimentação (EXPENSE, raiz criada no onboarding, is_system=false)
   ├─ iFood (filho)
   └─ Mercado (filho)
 
 Transporte (EXPENSE, raiz criada no onboarding, is_system=false)
   ├─ Uber (filho)
   └─ Combustível (filho)
 
 Conta Corrente (ASSET, raiz sistema, is_system=true)
   └─ Itaú (filho)
 ```

---

## 4. Escopo do MVP (Obrigatório para a Banca)

### 4.1. Backend (API + Domínio)

1. **Autenticação** — Registro, login, logout via Laravel Session (nativa).
2. **Onboarding de Ledger** — Criação automática de ledger + plano de contas padrão via Seeder ao registrar usuário.
3. **CRUD de Contas/Categorias** — Com validação de profundidade máxima de 2 níveis.
4. **CRUD de Cartões** — Gerenciamento de contas LIABILITY com metadados de cartão (`credit_card_details`).
5. **Motor de Lançamento** — Actions para os 6 tipos de transação definidos na seção 3.1.
6. **Máquina de Estados de Fatura** — Criação automática de `credit_card_invoices` e cálculo de `due_date` das parcelas.
7. **Mecanismo de Estorno/Edição** — Reverse and Replace atômico via `DB::transaction()`.
8. **Extrato por Conta** — Running balance linha a linha via Eloquent.
9. **Dashboard de Fluxo de Caixa** — Entradas vs Saídas do mês, saldo atual por conta, gastos por categoria.
10. **Dashboard de Competência (Avançado)** — Balanço Patrimonial (Ativo vs Passivo) e DRE simplificado.

### 4.2. Frontend Web (React + TypeScript + Inertia)

1. **Telas de Autenticação** — Login / Registro.
2. **Onboarding** — Coleta preferências básicas, exibe contas criadas automaticamente.
3. **Dashboard** — Cards de saldo por conta, gráfico Entradas vs Saídas (mês), gráfico de pizza por categoria.
4. **Formulário de Lançamento** — Campo "tipo" define os campos exibidos dinamicamente; sem jargão contábil.
5. **Tela de Faturas** — Listagem de faturas por cartão, agrupadas por mês; botão "Pagar fatura".
6. **Extrato** — Data table reativa com filtros por conta, período e tipo (via query strings do Inertia).
7. **Gestão de Contas/Categorias** — CRUD com feedback visual de hierarquia.

---

## 5. Escopo Condicional (Se o cronograma permitir)

### 5.1. API Mobile-Ready

Aproveitando as Actions já criadas para o web, expor `routes/api.php` retornando `Eloquent API Resources` (JSON) com autenticação via token Sanctum. Prova que o motor está pronto para consumo por app mobile sem duplicar lógica de negócio.

### 5.2. App Mobile

A decisão de implementar ou não um app mobile será tomada ao longo do desenvolvimento. A arquitetura já suporta isso nativamente via API.

---

## 6. Backlog (Futuramente)

1. **Orçamentos e Metas (Budgeting)** — Limites por categoria com consolidação mensal.
2. **Compartilhamento de Ledger** — UI para convidar membros (infra de N:N já prevista no modelo).
3. **Dashboard Avançado** — Balanço Patrimonial e DRE (modo avançado, acessível via menu).
4. **Interface GnuCash-style** — Data Grid reativo para lançamento manual de débitos/créditos (para power users).
5. **Arquitetura Offline-First (Mobile Sync)** — SQLite local no app mobile com sincronização via outbox pattern.
6. **Snapshot de Saldo** — Cache em Redis ou tabela `account_balance_snapshots` para otimizar o cálculo de saldo em contas com muitos lançamentos históricos.
7. **Importação de Extrato (OFX/CSV)** — Parser de extratos bancários para lançamento em lote.
8. **Inertia SSR** — Implementação de renderização no lado do servidor para melhor SEO e performance inicial (pós-MVP).
