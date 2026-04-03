# 🗄️ Dicionario_de_Dados.md — App Finanças (Ledger Core)
> **Objetivo deste documento:** Definir a estrutura relacional completa do banco de dados (MySQL/MariaDB). A modelagem garante integridade matemática via Ledger imutável (Regime de Competência) e fornece tabelas projetadas para renderização ágil de interfaces (Regime de Caixa). Este documento é canônico: em caso de conflito com outros documentos, este prevalece para questões de schema.

---

## Visão Geral das Tabelas

| Tabela | Camada | Descrição |
|---|---|---|
| `users` | Auth | Identidade e acesso |
| `ledgers` | Tenant | Unidade de isolamento de dados (tenant) |
| `ledger_user` | Tenant (pivot) | Relação N:N entre usuários e ledgers |
| `accounts` | Domínio Contábil | Plano de contas unificado (contas + categorias) |
| `credit_card_details` | Domínio Contábil | Metadados específicos de cartão de crédito |
| `credit_card_invoices` | Domínio Contábil | Faturas mensais do cartão (entidade própria) |
| `transactions` | Domínio Contábil | Fato Gerador — cabeçalho do evento financeiro |
| `journal_entries` | Domínio Contábil (**IMUTÁVEL**) | Linhas de partidas dobradas (Ledger) |
| `expected_cash_flows` | Read Model (UX) | Projeções de caixa: parcelas, faturas a vencer |

---

## 1. Autenticação e Multi-Tenancy

### `users`
Tabela padrão do ecossistema Laravel. Representa a identidade de autenticação.

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `id` | BigInt (Unsigned) | PK, Auto-increment |
| `name` | Varchar(255) | Nome do usuário |
| `email` | Varchar(255) | Unique. E-mail de acesso |
| `email_verified_at` | Timestamp | Nullable |
| `password` | Varchar(255) | Hash bcrypt da senha |
| `remember_token` | Varchar(100) | Nullable. Sessão contínua |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

---

### `ledgers`
O **tenant lógico** do sistema. Todo dado financeiro pertence a um ledger, não diretamente a um usuário. Isso viabiliza o compartilhamento futuro entre múltiplos usuários (ex: casal, família) sem alteração de schema.

No MVP, cada usuário terá exatamente 1 ledger criado automaticamente no onboarding.

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `id` | BigInt (Unsigned) | PK, Auto-increment |
| `name` | Varchar(255) | Ex: "Finanças da Família Silva" |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

---

### `ledger_user` (Pivot)
Relação N:N entre `users` e `ledgers`. Armazena o papel do usuário dentro do ledger.

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `ledger_id` | BigInt (Unsigned) | FK -> `ledgers(id)`. ON DELETE CASCADE |
| `user_id` | BigInt (Unsigned) | FK -> `users(id)`. ON DELETE CASCADE |
| `role` | Enum | `OWNER`, `MEMBER`. O criador do ledger é `OWNER` |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

> **PK Composta:** (`ledger_id`, `user_id`)

---

## 2. O Domínio Contábil (Motor de Regras)

### `accounts`
O **Plano de Contas unificado**. Atua como árvore recursiva, englobando:
- **Contas financeiras:** Conta Corrente, Poupança, Cartão de Crédito (Passivo)
- **Categorias do usuário:** Alimentação, Transporte, Salário

**Regra de hierarquia (enforçada em código):** Máximo de 2 níveis (pai + filho). Uma conta filho não pode ter filhos.

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `id` | BigInt (Unsigned) | PK, Auto-increment |
| `ledger_id` | BigInt (Unsigned) | FK -> `ledgers(id)`. ON DELETE CASCADE |
| `parent_id` | BigInt (Unsigned) | FK -> `accounts(id)`. Nullable. Nível 1 = nó raiz; Nível 2 = filho |
| `name` | Varchar(255) | Ex: "Conta Corrente Itaú", "iFood" |
| `type` | Enum | `ASSET`, `LIABILITY`, `EQUITY`, `REVENUE`, `EXPENSE` |
| `status` | Enum | `ACTIVE`, `INACTIVE`. Inativada caso haja histórico. |
| `is_system` | Boolean | Default `false`. Se `true`, bloqueia deleção (contas do plano base criadas no onboarding) |
| `ui_metadata` | JSON | Nullable. Ex: `{"icon": "🍔", "color": "#FF5733"}` |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |
| `deleted_at` | Timestamp | Nullable. **Soft Delete** — Permitido apenas se **não houver** lançamentos. |

**Contas raiz criadas automaticamente no onboarding (plano base, is_system = true):**

| name | type |
|---|---|
| Conta Corrente | ASSET |
| Carteira | ASSET |
| Cartão de Crédito | LIABILITY |
| Salário | REVENUE |
| Alimentação | EXPENSE |
| Transporte | EXPENSE |

---

### `credit_card_details`
Extensão 1:1 de `accounts` para contas do tipo `LIABILITY` que representam cartões de crédito. Armazena metadados necessários para o cálculo automático de faturas e parcelas.

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `id` | BigInt (Unsigned) | PK, Auto-increment |
| `account_id` | BigInt (Unsigned) | FK -> `accounts(id)`. **Unique** (relação 1:1) |
| `credit_limit` | BigInt | Limite total em **centavos**. Nullable (opcional no MVP) |
| `closing_day` | TinyInt (1–31) | Dia do mês em que a fatura fecha |
| `due_day` | TinyInt (1–31) | Dia do mês em que a fatura vence |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

> **Nota:** O cálculo de qual fatura uma compra pertence usa `closing_day`. Se `data_compra.dia <= closing_day`, vai para a fatura do mês atual; caso contrário, para a do próximo mês. O `due_date` da fatura é calculado a partir de `due_day` do mês de vencimento.

---

### `credit_card_invoices`
Representa a **fatura mensal** de um cartão de crédito como uma entidade própria. Isso permite rastrear o status da fatura (aberta, fechada, paga), vincular o pagamento e agregar os `expected_cash_flows` que a compõem.

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `id` | BigInt (Unsigned) | PK, Auto-increment |
| `ledger_id` | BigInt (Unsigned) | FK -> `ledgers(id)` |
| `account_id` | BigInt (Unsigned) | FK -> `accounts(id)`. A conta LIABILITY do cartão |
| `reference_month` | Date | Primeiro dia do mês de referência (ex: `2025-08-01` para "Fatura Ago/25"). **Unique** por (`account_id`, `reference_month`) |
| `closing_date` | Date | Data de fechamento calculada automaticamente |
| `due_date` | Date | Data de vencimento calculada automaticamente |
| `status` | Enum | `OPEN` (aceitando lançamentos), `CLOSED` (fechada, aguardando pagamento), `PAID` (quitada) |
| `paid_transaction_id` | BigInt (Unsigned) | FK -> `transactions(id)`. Nullable. Aponta para a transação de pagamento da fatura |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

---

### `transactions`
O **Fato Gerador** — cabeçalho do evento financeiro. Agrupa as linhas de lançamento contábil (`journal_entries`) e as projeções de caixa (`expected_cash_flows`).

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `id` | BigInt (Unsigned) | PK, Auto-increment |
| `ledger_id` | BigInt (Unsigned) | FK -> `ledgers(id)` |
| `created_by_user_id` | BigInt (Unsigned) | FK -> `users(id)`. Auditoria: quem registrou |
| `description` | Varchar(255) | Descrição dada pelo usuário (ex: "Compra Mercado") |
| `date` | Date | Data de Competência (quando o fato ocorreu) |
| `type` | Enum | `EXPENSE`, `INCOME`, `TRANSFER`, `CREDIT_CARD_PAYMENT`. Facilita queries e UI |
| `status` | Enum | `ACTIVE`, `REVERSED` |
| `reversed_by_id` | BigInt (Unsigned) | FK -> `transactions(id)`. Nullable. Aponta para a transação de estorno que anulou este registro |
| `reverses_id` | BigInt (Unsigned) | FK -> `transactions(id)`. Nullable. Aponta para a transação original que esta anula |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

---

### `journal_entries`
**[TABELA IMUTÁVEL — APPEND-ONLY]** O Livro-Razão (Ledger). As linhas de partidas dobradas.

**Invariante fundamental:** Para cada `transaction_id`, `SUM(amount WHERE type = DEBIT) = SUM(amount WHERE type = CREDIT)`. Esta regra é enforçada pela Action antes do `INSERT`.

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `id` | BigInt (Unsigned) | PK, Auto-increment |
| `transaction_id` | BigInt (Unsigned) | FK -> `transactions(id)`. ON DELETE CASCADE |
| `account_id` | BigInt (Unsigned) | FK -> `accounts(id)`. A conta que sofreu a mutação |
| `type` | Enum | `DEBIT`, `CREDIT` |
| `amount` | BigInt (Unsigned) | Valor absoluto em **centavos** (ex: R$ 10,50 = `1050`). Nunca negativo |
| `created_at` | Timestamp | Data física da inserção |

> **⚠️ Nota Arquitetural:** Esta tabela **propositalmente não possui** `updated_at` nem `deleted_at`. O histórico financeiro nunca é alterado ou apagado diretamente — apenas compensado por novas entradas (Reverse and Replace).

---

## 3. Camada de UX e Projeção (Read Model)

### `expected_cash_flows`
Tabela derivada (projeção). Criada junto à inserção no Ledger. Representa **quando o dinheiro efetivamente vai entrar ou sair** do caixa do usuário (Regime de Caixa).

**Casos de uso:**
- Parcelas de cartão de crédito → uma linha por parcela
- Faturas a vencer → agrupadas via `credit_card_invoice_id`
- Dashboard "Entradas vs Saídas" do mês corrente

| Coluna | Tipo | Restrições / Notas |
|:---|:---|:---|
| `id` | BigInt (Unsigned) | PK, Auto-increment |
| `ledger_id` | BigInt (Unsigned) | FK -> `ledgers(id)` |
| `transaction_id` | BigInt (Unsigned) | FK -> `transactions(id)`. Origem do evento |
| `account_id` | BigInt (Unsigned) | FK -> `accounts(id)`. Conta de liquidação (o cartão ou conta a receber) |
| `credit_card_invoice_id` | BigInt (Unsigned) | FK -> `credit_card_invoices(id)`. Nullable. Preenchido apenas para despesas de cartão |
| `installment_number` | Integer | Nullable. Índice da parcela (ex: `1` de 3) |
| `total_installments` | Integer | Nullable. Total de parcelas (ex: 1 de `3`) |
| `due_date` | Date | Data de vencimento (Regime de Caixa) |
| `amount` | BigInt (Unsigned) | Valor da parcela em **centavos** |
| `status` | Enum | `PENDING`, `PAID`, `CANCELED` |
| `paid_at` | Timestamp | Nullable. Data em que a liquidação ocorreu |
| `created_at` | Timestamp | |
| `updated_at` | Timestamp | |

---

## 4. Resumo de Relacionamentos (ER)

```
users (N) ──── ledger_user ──── (N) ledgers
                                         │
              ┌──────────────────────────┤
              │                          │
           accounts (N)           transactions (N)
              │  └─ (1:1) credit_card_details
              │  └─ (1:N) credit_card_invoices
              │
              └────── journal_entries (N)
              └────── expected_cash_flows (N)

transactions (1) ──── (N) journal_entries
transactions (1) ──── (N) expected_cash_flows
transactions (1:1) ── transactions [reversed_by / reverses]
credit_card_invoices (1) ── (N) expected_cash_flows
```

### Cardinalidade Detalhada

| Relação | Cardinalidade | Notas |
|---|---|---|
| `users` ↔ `ledgers` | N:N via `ledger_user` | Um usuário pode ter múltiplos ledgers; um ledger pode ter múltiplos usuários |
| `ledgers` → `accounts` | 1:N | Plano de contas completo por ledger |
| `accounts` → `accounts` | 1:N (auto) | Hierarquia pai-filho; máximo 2 níveis em código |
| `accounts` → `credit_card_details` | 1:1 | Apenas contas LIABILITY de cartão |
| `accounts` → `credit_card_invoices` | 1:N | Uma conta-cartão tem muitas faturas mensais |
| `ledgers` → `transactions` | 1:N | Todos os eventos financeiros do ledger |
| `transactions` → `journal_entries` | 1:N | Mínimo 2 linhas por transaction (Débito + Crédito) |
| `transactions` → `expected_cash_flows` | 1:N | Apenas compras a prazo/cartão geram projeções |
| `transactions` ↔ `transactions` | 1:1 (auto) | Par estorno/original via `reversed_by_id` / `reverses_id` |
| `credit_card_invoices` → `expected_cash_flows` | 1:N | Uma fatura agrupa N parcelas de diferentes compras |

---

## 5. Convenções Globais

| Convenção | Regra |
|---|---|
| **Moeda** | Todos os valores monetários são armazenados em **centavos** (BigInt), nunca como float ou decimal. Ex: R$ 10,50 = `1050` |
| **Datas** | `date` (DATE) para datas de competência/vencimento; `Timestamp` para datas de inserção/atualização |
| **Soft Delete** | Apenas `accounts` usa Soft Delete (só permitida sem histórico) e `status`. Demais tabelas são imutáveis ou controladas por `status` |
| **Imutabilidade** | `journal_entries` é append-only. Nunca recebe UPDATE ou DELETE direto |
| **Chaves Estrangeiras** | Todas as FKs devem ter índices. `ON DELETE CASCADE` apenas onde a deleção do pai torna o filho sem sentido (ex: `journal_entries` → `transactions`) |
| **Tenant** | Toda query de domínio deve incluir `WHERE ledger_id = ?`. Usar Global Scope do Eloquent para enforçar isso automaticamente |
