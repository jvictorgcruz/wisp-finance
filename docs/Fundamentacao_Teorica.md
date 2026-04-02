# 📄 Fundamentacao_Teorica.md
> **Objetivo deste documento:** Servir como base para a Introdução, Justificativa, Revisão Bibliográfica e Análise de Mercado da monografia. Ele define o problema de negócio, mapeia os concorrentes e defende a tese do projeto.

---

## 1. O Problema Fundamental: A Dicotomia de Design Financeiro

O mercado de aplicativos de finanças pessoais (B2C) enfrenta um dilema crônico de design e engenharia: a escolha forçada entre usabilidade superficial e precisão estrutural. Para o usuário final, a gestão financeira precisa ser um hábito de baixa fricção. No entanto, o dinheiro no mundo real obedece a regras contábeis estritas de conservação de valor.

O problema central que este projeto ataca é o fato de que as ferramentas atuais falham em reconciliar esses dois mundos:
- O usuário que busca **praticidade** acaba com dados corrompidos a longo prazo.
- O usuário que busca **dados precisos** desiste devido à alta barreira de entrada e sobrecarga cognitiva.

---

## 2. Análise de Mercado e Concorrentes

O ecossistema atual está polarizado em dois extremos que não se comunicam, deixando um gap no centro onde este projeto se posiciona.

### 2.1. O Extremo da Usabilidade (O Falso Positivo)

- **Players:** Mobills, Organizze, YNAB, Nubank Insights.
- **Modelo Mental:** Baseiam-se puramente no Regime de Caixa (Entradas vs. Saídas) com uma estrutura de *single-entry* (lista de transações categorizadas).
- **Falhas Estruturais:**
  - **Ilusão Patrimonial:** Não possuem um conceito real de Balanço Patrimonial (Ativos e Passivos). Se o usuário financia um carro, o aplicativo não consegue representar o carro como ativo e o financiamento como passivo — forçam o lançamento da parcela como uma "despesa" isolada, ocultando a dívida total real.
  - **Quebra em Transferências:** Mover dinheiro de uma Conta Corrente para uma Corretora de Valores frequentemente entra como uma "despesa" nos gráficos, corrompendo a análise de gastos do mês, pois o sistema não compreende mutações patrimoniais que não alteram o resultado líquido.
  - **Parcelamento Falso:** Modelam o parcelamento criando "despesas futuras" nos meses seguintes, o que fere o princípio contábil do Regime de Competência e mascara a dívida atual no balanço.

### 2.2. O Extremo do Rigor Contábil (A Barreira Cognitiva)

- **Players:** GnuCash, Beancount, Firefly III.
- **Modelo Mental:** Utilizam o motor de Partidas Dobradas (Double-Entry Ledger) focado no Regime de Competência e na Equação Contábil Fundamental.
- **Falhas Estruturais:**
  - **Exposição do Motor:** O Firefly III, sendo o player web mais moderno desta ponta, possui um motor impecável, mas falha gravemente na interface para o público B2C. Ele expõe o *ledger* ao usuário final, exigindo que até mesmo a compra de um café seja lançada explicitando a conta de origem, a conta de destino, débitos e créditos.
  - **Público Nichado:** O linguajar e a interface são voltados para *power users*, contadores ou *sysadmins* (foco em self-hosted), gerando um atrito incompatível com o uso diário em smartphones pela população em geral.
  - **Ausência de Tropicalização:** Nenhuma dessas ferramentas modela corretamente o **cartão de crédito parcelado** no padrão brasileiro, que é um dos instrumentos financeiros mais usados no país.

---

## 3. A Inovação Proposta: A Tese Acadêmica

O projeto inova ao introduzir uma **Camada de Abstração (Anti-Corruption Layer)** entre a interface de usuário e o banco de dados. Utilizando o princípio de **Progressive Disclosure** (Revelação Progressiva) de UX, o aplicativo permite que o usuário interaja com o sistema através de formulários simplificados e intuitivos — informando apenas o valor, a conta de origem e a categoria, sem jargões contábeis.

Nos bastidores, o sistema atua como um **tradutor autômato**, convertendo essa entrada simples em *journal entries* (partidas dobradas) matematicamente perfeitas. A inovação é manter a matemática inquebrável sem transferir a responsabilidade dessa matemática para o usuário.

**Os três pilares da tese:**
1. **Dupla Face de Regime:** O mesmo dado é armazenado uma vez (Competência / Ledger) e projetado de duas formas (Caixa para o dashboard do usuário; Competência para o balanço avançado).
2. **Progressive Disclosure:** A UI expõe apenas o que o usuário precisa ver. A complexidade contábil fica na camada de serviço (`Actions`), invisível ao usuário final.
3. **Tropicalização:** Modelagem nativa do parcelamento brasileiro, sem gambiarras de "despesas futuras".

---

## 4. O Diferencial de Domínio: O Contexto Brasileiro

A complexidade que torna este sistema único é a tropicalização para o cenário financeiro do Brasil, especificamente o tratamento do **Cartão de Crédito Parcelado**.

### 4.1. O Erro dos Concorrentes

Apps brasileiros tentam simular parcelas criando "despesas futuras" nos meses seguintes. Isso fere o princípio contábil do Regime de Competência e mascara a dívida atual: o usuário não sabe que já deve R$ 900,00, só vê R$ 300,00 neste mês.

### 4.2. A Solução via Ledger + Fatura como Entidade

O sistema reconhece a **despesa total no ato da compra** (Fato Gerador / Regime de Competência):

```
DÉBITO:  Despesa > Alimentação        R$ 300,00
CRÉDITO: Passivo > Cartão Nubank      R$ 300,00
```

Em paralelo, o motor gera automaticamente os registros de projeção de caixa (`expected_cash_flows`), um para cada parcela, cada um vinculado à **Fatura** (`credit_card_invoices`) do mês correspondente.

O pagamento mensal da fatura é modelado exclusivamente como mutação patrimonial (sem impacto no resultado):

```
DÉBITO:  Passivo > Cartão Nubank      R$ 300,00
CRÉDITO: Ativo > Conta Corrente       R$ 300,00
```

Isso permite que o usuário veja o quanto deve a longo prazo no balanço avançado, enquanto o *dashboard* traduz organicamente as parcelas que precisam ser pagas no mês corrente.

### 4.3. Ciclo da Fatura

Cada cartão de crédito possui `dia_fechamento` e `dia_vencimento`. O sistema determina automaticamente a qual fatura (`OPEN`, `CLOSED`, `PAID`) cada parcela pertence com base na data de competência da compra e no `dia_fechamento` do cartão.

---

## 5. Posicionamento de Mercado

| Critério | Mobills / YNAB | GnuCash / Firefly | **Este Projeto** |
|---|---|---|---|
| Facilidade de uso (B2C) | ✅ Alta | ❌ Baixa | ✅ Alta |
| Integridade contábil | ❌ Fraca | ✅ Forte | ✅ Forte |
| Parcelamento BR correto | ❌ Não | ❌ Não | ✅ Sim |
| Balanço Patrimonial real | ❌ Não | ✅ Sim | ✅ Sim |
| Interface moderna / mobile | ✅ Sim | ❌ Não | ✅ Sim |
| Self-hosted / Open Source | ❌ Não | ✅ Sim | ✅ Via Docker |
