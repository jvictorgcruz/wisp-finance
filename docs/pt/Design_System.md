# 🎨 Wisp Finance - Design System & Guia de Interface

Este documento define a linguagem visual e os padrões de interface do **Wisp Finance**. Ele serve como guia para desenvolvedores e IAs garantirem a consistência estética "Premium" e a funcionalidade técnica exigida pelo projeto.

---

## 1. Norte Criativo: "Minimalismo de Alta Precisão"

O design do Wisp centra-se na **Clareza Financeira**. 
- **Objetivo:** Reduzir a carga cognitiva. O usuário deve sentir que o aplicativo é uma ferramenta de precisão, não um brinquedo decorado.
- **Velocidade:** O registro de uma transação deve ser a ação mais rápida e fluida do app.
- **Estética:** "Clean & Premium" — uso de espaços em branco generosos, tipografia nítida e micro-interações que tragam feedback tátil.

---

## 2. Fundamentos Visuais (Tokens)

### 2.1 Paleta de Cores (Tailwind v4)
A interface utiliza uma base predominantemente clara com suporte nativo a dark mode via variáveis CSS no `@theme`.

- **Primary (Action):** Indigo `#4F46E5` (Vibrant Indigo). Usado para ações principais e estados ativos.
- **Surface/Background:**
  - Light: `#F8FAFC` (Slate 50)
  - Dark: `#0F172A` (Slate 900)
- **Cores Semânticas:**
  - **Success (Income):** Emerald `#10B981`
  - **Danger (Expense):** Rose `#F43F5E`
  - **Warning:** Amber `#F59E0B`
- **Neutros:** Textos em Slate (`#1E293B` para primário) e bordas sutis em Slate 200/800.

### 2.2 Tipografia
- **Fonte:** `Inter` (Sans-serif) para legibilidade técnica.
- **Escala de Pesos:**
  - **Valores Monetários:** Semi-Bold ou Bold para destaque imediato.
  - **Labels:** Medium, 12px (caps opcional para micro-categorias).
  - **Corpo:** Regular, 14px ou 16px.

### 2.3 Formas e Superfícies
- **Border Radius:** `12px` (standard) para cards e botões. `8px` para inputs.
- **Elevação:** Evitar sombras pesadas. Usar `ring-1` ou sombras "soft" (`shadow-sm`) para separar camadas.
- **Micro-animações:** Transições de `150ms` (ease-in-out) para hover e focus.

---

## 3. Especificações Técnicas (Stack Implementation)

### 3.1 Tailwind CSS v4 & CSS Variables
Toda a estilização deve ser feita via classes utilitárias. Customizações de tema devem ser registradas no `app.css`:

```css
@theme {
  --color-brand: #4F46E5;
  --radius-xl: 12px;
  /* Variáveis semânticas dinâmicas */
}
```

### 3.2 Componentização (Atomic Design)
Os componentes devem ser construídos em React + TypeScript com tipagem estrita para Props.
- **Base Components:** Localizados em `resources/js/Components/Common` (Button, TextField, Select).
- **Layouts:** `AuthenticatedLayout.tsx` (Sidebar/Header) e `GuestLayout.tsx` (Auth).

---

## 4. Componentes Críticos de UX

### 4.1 A Calculadora de Valor (Modal)
Acionada ao tocar em qualquer campo de entrada de valor monetário.
- **Teclado numérico:** Otimizado para entrada rápida (botões grandes).
- **Operadores:** `+ - * /` visíveis na lateral.
- **Feedback:** O valor final é injetado no formulário via Inertia `useForm`.

### 4.2 Lógica de Exibição de Transações
- **Receitas:** Cor Success com prefixo `+`.
- **Despesas:** Cor Danger com prefixo `-`.
- **Contas/Categorias:** Exibição em árvore (máximo 2 níveis) com indicadores visuais de hierarquia.

### 4.3 Formulário Dinâmico de Lançamento
O campo "Tipo" (Despesa, Receita, Transferência) altera os campos visíveis:
- **Transferência:** Exibe "Origem" e "Destino". Oculta "Categoria".
- **Cartão de Crédito:** Exibe seleção de "Cartão" e "Parcelas".

---

## 5. Regras para IAs e Desenvolvedores

1.  **Idioma da UI:** Todos os textos visíveis ao usuário devem ser em **Português do Brasil**.
2.  **Acessibilidade:** Todo input deve ter `id` único e `label` associado. Use `aria-labels` em ícones interativos.
3.  **Estado de Carregamento:** Botões de `submit` devem exibir um spinner ou estado de `disabled` enquanto a request do Inertia estiver em `processing`.
4.  **Erros de Validação:** Exibir mensagens de erro logo abaixo do campo afetado usando a prop `errors` do Inertia.

---

> [!TIP]
> Use componentes que reajam ao estado `hover` com sutileza (ex: `hover:bg-slate-100/50`) para dar vida à interface.

