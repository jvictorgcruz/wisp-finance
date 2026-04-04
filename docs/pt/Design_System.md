# 🎨 Wisp Finance - Design System & Guia Editorial

Este documento define a linguagem visual **Personal Finance Editorial** do **Wisp Finance**. Ele foca no "Minimalismo de Precisão", transformando a gestão financeira em uma experiência de clareza e autoridade estética.

---

## 1. Norte Criativo: "Minimalismo de Precisão"

Diferente de aplicativos genéricos, adotamos uma estética **Editorial de Alta Gama** (High-End).
- **Respirabilidade:** Espaçamento generoso é um elemento ativo de design. Se parecer "vazio demais", provavelmente está correto.
- **Autoridade Visual:** Hierarquia baseada em camadas tonais e tipografias assertivas.
- **Nesting de Superfícies:** A profundidade é sentida através de contrastes sutis, não de bordas físicas.

---

## 2. Fundamentos Visuais (Tokens)

### 2.1 A Regra do "No-Line" (Sem Linhas)
**Está terminantemente proibido o uso de bordas sólidas de 1px para separar seções.** A estrutura da interface deve ser definida exclusivamente por mudanças sutis no valor tonal do fundo ou alinhamento rigoroso.

### 2.2 Cores e Camadas Tonais
A paleta é baseada na serenidade dos tons acinzentados com acentos de autoridade.

- **Primary (Authority):** `#24389C` (Índigo Profundo).
- **Cores Semânticas:**
  - **Income (Growth):** `#006D37` (Esmeralda Profundo).
  - **Expense (Clarity):** `#8B0203` (Vermelho Sofisticado).
- **Hierarquia de Superfícies (Light Mode):**
  - **Surface (Base):** `#F8F9FA` (Ponto de partida).
  - **Surface Container Low:** Conteúdo secundário.
  - **Surface Container Lowest (#FFFFFF):** Peak focus (cards de saldo, botões principais).
  - **Surface Container Highest:** Conteúdo agrupado de menor destaque.

### 2.3 Tipografia Editorial
Utilizamos a **Inter** como elemento gráfico fundamental.

- **Saldos e Headlines:** `display-md` ou `headline-lg`.
  - *Premium Touch:* Reduzir `letter-spacing` em **-2%** para títulos grandes.
- **Labels e Metadados:** `label-md` ou `label-sm`.
  - *Editorial Style:* Usar **All Caps** com `letter-spacing` aumentado em **+5%**.
- **Corpo:** `body-md` para transações, focado em legibilidade máxima.

### 2.4 Elevação e Sombras
A elevação deve ser quase imperceptível (Sombras Ambientes).
- **Especificação:** Blur de `24px` a `40px`, opacidade de `4%` a `6%`.
- **Blur & Glass:** Para headers fixos, use `surface` com 80% de opacidade e `backdrop-filter: blur(12px)`.

---

## 3. Guia de Implementação (Tailwind v4)

As variáveis de tema devem ser configuradas no `app.css` sob o bloco `@theme`:

```css
@theme {
  --color-primary: #24389C;
  --color-income: #006D37;
  --color-expense: #8B0203;

  --color-surface: #F8F9FA;
  --color-surface-lowest: #FFFFFF;

  --radius-editorial: 12px; /* 0.75rem habitual */

  --letter-spacing-editorial-tight: -0.02em;
  --letter-spacing-editorial-wide: 0.05em;
}
```

---

## 4. Componentes e UX

### 4.1 Botões (Buttons)
- **Primary:** Container em `primary`, texto em `surface-lowest`. Arredondamento fixo de `12px`. Padding horizontal generoso.
- **Tertiary:** Apenas texto em `primary`, sem container.

### 4.2 Cards e Listas
- **Divisores:** Proibidos. Use o espaçamento da escala (ex: `gap-4`) para separar itens.
- **Layout:** Use `surface-container-highest` para agrupar informações relacionadas.

### 4.3 Iconografia
- **Biblioteca:** **Lucide React**.
- **Estilo:** Sempre em modo *Outlined* (traço fino) usando a cor `on_surface_variant`. Evite ícones excessivamente coloridos.

---

## 5. Do's and Don'ts

**✓ O que fazer (Do's):**
- Use o espaço em branco para guiar o olhar.
- Alinhamentos perfeitos compensam a ausência de linhas.
- Mantenha o arredondamento de `12px` consistente.

**✕ O que evitar (Don'ts):**
- Nunca use sombras "drop shadow" agressivas.
- Não quebre a regra do No-Line (sem bordas 1px).
- Evite cores "primárias" genéricas (vermelho puro, verde puro). Use a paleta editorial.

---

> [!TIP]
> A sofisticação nasce da precisão dos detalhes. Se um elemento não tem utilidade ou peso estético real, remova-o.
