# Pizza Customization Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the 4-step pizza customization wizard (prompt 04) and replace the fake cart counter with a real itemized cart that the wizard, the menu cards, and the address page summary all share.

**Architecture:** Two new small data/logic files (`src/menuData.ts` for the existing menu catalog, `src/cart.ts` for cart types + pricing) plus one new UI file (`src/PizzaWizard.tsx`). `src/App.tsx` keeps its existing single-file-per-page-area pattern but switches its cart state from `cartCount`/`addedIds` to a real `CartLine[]`, and wires the wizard in as a full-screen overlay.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8, Tailwind CSS v4 (inline styles + utility classes, matching existing code style). No test runner is configured in this project (`package.json` has no `test` script) — verification is `tsc --noEmit` for type safety plus manual browser checks, per `docs/superpowers/specs/2026-09-14-pizza-wizard-design.md`.

**Spec:** `docs/superpowers/specs/2026-09-14-pizza-wizard-design.md`

---

## Before you start

- Dev server: `PORT=3000 npx pnpm run dev` (run in background). Sanity check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/` (expect `200`).
- Type check after each task: `npx pnpm exec tsc --noEmit`.
- All file paths below are relative to the repo root: `D:\Documentos\Universidad\6to Semestre\Computación Gráfica\Taller 1\Página principal pizzería`.
- `src/App.tsx` currently has all pages in one 1360-line file. Tasks 1 and 4 reference exact original blocks of that file (captured before this plan was written) — if the file has since changed, re-read the relevant section before editing rather than blindly applying the old/new text.

---

### Task 1: Extract menu catalog into `src/menuData.ts`

**Why:** `PizzaWizard.tsx` (Task 5) needs `MENU_ITEMS` and `MenuItem` to look up pizzas for the "mitad y mitad" second-half picker. Importing them directly from `App.tsx` would create a circular import (`App.tsx` → `PizzaWizard.tsx` → `App.tsx`). Moving the pure data out to its own module avoids that and is a small, mechanical, low-risk split.

**Files:**
- Create: `src/menuData.ts`
- Modify: `src/App.tsx:1-163`

- [ ] **Step 1: Create `src/menuData.ts`**

```ts
export type Category = "Pizzas" | "Acompañamientos" | "Bebidas" | "Postres";

export interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  tag?: string;
  category: Category;
  img: string;
  popular?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  // Pizzas
  {
    id: 1,
    name: "Pepperoni Clásica",
    desc: "Pepperoni premium importado, mozzarella fundida, salsa de tomate artesanal con orégano",
    price: 249,
    tag: "La más pedida",
    category: "Pizzas",
    popular: true,
    img: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Margarita Suprema",
    desc: "Mozzarella fresca, tomate Roma, albahaca fresca, aceite de oliva extra virgen",
    price: 219,
    tag: "Favorita del chef",
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Cuatro Quesos",
    desc: "Mozzarella, gouda ahumado, parmesano rallado y queso azul sobre base blanca cremosa",
    price: 269,
    tag: "Nuevo",
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "BBQ Chicken",
    desc: "Pollo asado en tiras, cebolla morada caramelizada, jalapeño, salsa BBQ ahumada casera",
    price: 259,
    tag: "Oferta 2×1",
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Vegetariana Deluxe",
    desc: "Pimientos asados, champiñones portobello, espinacas, aceitunas negras y queso de cabra",
    price: 239,
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Prosciutto & Rúcula",
    desc: "Prosciutto di Parma, rúcula fresca, queso parmesano en láminas, reducción balsámica",
    price: 289,
    tag: "Premium",
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=600&h=400&fit=crop&auto=format",
  },
  // Acompañamientos
  {
    id: 7,
    name: "Pan de Ajo",
    desc: "Baguette artesanal tostado con mantequilla de ajo asado, perejil fresco y queso parmesano",
    price: 89,
    category: "Acompañamientos",
    img: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 8,
    name: "Alitas Buffalo",
    desc: "8 alitas crujientes bañadas en salsa buffalo picante, con aderezo blue cheese",
    price: 149,
    tag: "Picante",
    category: "Acompañamientos",
    img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 9,
    name: "Nuggets de Pollo",
    desc: "12 piezas de pollo empanizado con panko japonés, mostaza miel y salsa catsup",
    price: 119,
    category: "Acompañamientos",
    img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 10,
    name: "Palitos de Mozzarella",
    desc: "6 palitos de mozzarella empanizados y fritos, con salsa marinara casera para botanear",
    price: 99,
    category: "Acompañamientos",
    img: "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=600&h=400&fit=crop&auto=format",
  },
  // Bebidas
  {
    id: 11,
    name: "Limonada Natural",
    desc: "Limonada fresca exprimida al momento con menta, azúcar de caña y hielos triturados",
    price: 59,
    category: "Bebidas",
    img: "https://images.unsplash.com/photo-1559352473-bb502c92086b?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 12,
    name: "Refresco 600ml",
    desc: "Coca-Cola, Pepsi, Sprite o Fanta. Botella individual bien fría para acompañar tu pizza",
    price: 49,
    category: "Bebidas",
    img: "https://images.unsplash.com/photo-1583487136420-f2089d1bfc78?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 13,
    name: "Agua Mineral",
    desc: "Agua mineral sin gas 600ml, opción ligera para acompañar cualquier platillo",
    price: 35,
    category: "Bebidas",
    img: "https://images.unsplash.com/photo-1711154319702-70f9e8c3a90f?w=600&h=400&fit=crop&auto=format",
  },
  // Postres
  {
    id: 14,
    name: "Tiramisú Clásico",
    desc: "Capas de bizcocho de café, mascarpone cremoso y cacao amargo, receta italiana original",
    price: 109,
    tag: "Artesanal",
    category: "Postres",
    img: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 15,
    name: "Brownie con Helado",
    desc: "Brownie de chocolate semi-amargo tibio con una bola de helado de vainilla premium",
    price: 89,
    category: "Postres",
    img: "https://images.unsplash.com/photo-1639744211487-b27e3551b07c?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 16,
    name: "Cheesecake de Fresa",
    desc: "Base de galleta, crema cheese suave, cobertura de fresas frescas con coulis artesanal",
    price: 99,
    category: "Postres",
    img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop&auto=format",
  },
];
```

- [ ] **Step 2: Remove the moved data from `src/App.tsx` and import it instead**

At the top of `src/App.tsx`, find this block (currently lines 1-20, ending right before the `MENU_ITEMS` array, and the array itself runs to the line just before `const CATEGORIES`):

```tsx
import { useState } from "react";
import type React from "react";

// ─── Data ───────────────────────────────────────────────────────────────────

type Category = "Pizzas" | "Acompañamientos" | "Bebidas" | "Postres";
type View = "home" | "menu" | "address";

interface MenuItem {
  id: number;
  name: string;
  desc: string;
  price: number;
  tag?: string;
  category: Category;
  img: string;
  popular?: boolean;
}

const MENU_ITEMS: MenuItem[] = [
  // Pizzas
  {
    id: 1,
    ...
```

... continuing down to the closing of the array (the line `];` right before `const CATEGORIES: Category[] = ...`).

Replace the whole span — from `type Category = ...` down through the closing `];` of `MENU_ITEMS` — with:

```tsx
import { useState } from "react";
import type React from "react";
import { MENU_ITEMS, type MenuItem, type Category } from "./menuData";

// ─── Data ───────────────────────────────────────────────────────────────────

type View = "home" | "menu" | "address";
```

Leave the line right after it untouched: `const CATEGORIES: Category[] = ["Pizzas", "Acompañamientos", "Bebidas", "Postres"];`.

- [ ] **Step 3: Verify**

Run: `npx pnpm exec tsc --noEmit`
Expected: no errors (in particular, no "cannot find name 'MenuItem'" / "'Category'" / "'MENU_ITEMS'" anywhere else in the file — they're still used by `MenuCard`, `MenuPage`, `HomeRecommendations`, etc., and the import above covers all three).

- [ ] **Step 4: Commit**

```bash
git add src/menuData.ts src/App.tsx
git commit -m "$(cat <<'EOF'
Extract menu catalog into src/menuData.ts

Pulls MENU_ITEMS/MenuItem/Category out of App.tsx so the upcoming
PizzaWizard component can import them without a circular dependency
on App.tsx.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BYFkdHBDesCCiWBYwHeuEF
EOF
)"
```

---

### Task 2: Create `src/cart.ts` (cart types + pricing)

**Files:**
- Create: `src/cart.ts`

- [ ] **Step 1: Write `src/cart.ts`**

```ts
export type PizzaSize = "Chica" | "Mediana" | "Grande" | "Familiar";
export type DoughType = "Tradicional" | "Delgada" | "Gruesa" | "Rellena de queso";

export interface PizzaCustomization {
  baseItemId: number;
  secondHalfItemId?: number;
  size: PizzaSize;
  dough: DoughType;
  extraToppingIds: string[];
}

export interface CartLine {
  id: string;
  menuItemId: number;
  name: string;
  img: string;
  unitPrice: number;
  quantity: number;
  customization?: PizzaCustomization;
}

export const SIZE_DELTAS: Record<PizzaSize, number> = {
  Chica: -30,
  Mediana: 0,
  Grande: 40,
  Familiar: 80,
};

export const DOUGH_DELTAS: Record<DoughType, number> = {
  Tradicional: 0,
  Delgada: 0,
  Gruesa: 15,
  "Rellena de queso": 35,
};

export interface ExtraTopping {
  id: string;
  name: string;
  price: number;
}

export const EXTRA_TOPPINGS: ExtraTopping[] = [
  { id: "champinones", name: "Champiñones", price: 20 },
  { id: "pina", name: "Piña", price: 20 },
  { id: "jalapeno", name: "Jalapeño", price: 20 },
  { id: "tocino", name: "Tocino", price: 20 },
  { id: "aceituna-negra", name: "Aceituna negra", price: 20 },
  { id: "cebolla-morada", name: "Cebolla morada", price: 20 },
  { id: "extra-queso", name: "Extra queso", price: 20 },
  { id: "pimiento", name: "Pimiento", price: 20 },
];

export function computeUnitPrice(
  basePrice: number,
  size: PizzaSize,
  dough: DoughType,
  extraToppingIds: string[],
): number {
  const toppingsTotal = extraToppingIds.reduce((sum, id) => {
    const topping = EXTRA_TOPPINGS.find((t) => t.id === id);
    return sum + (topping ? topping.price : 0);
  }, 0);
  return basePrice + SIZE_DELTAS[size] + DOUGH_DELTAS[dough] + toppingsTotal;
}

export function describeCustomization(customization?: PizzaCustomization): string | undefined {
  if (!customization) return undefined;
  const parts = [customization.size, `Masa ${customization.dough}`];
  if (customization.extraToppingIds.length > 0) {
    parts.push(`+${customization.extraToppingIds.length} extra${customization.extraToppingIds.length > 1 ? "s" : ""}`);
  }
  return parts.join(" · ");
}
```

- [ ] **Step 2: Verify**

Run: `npx pnpm exec tsc --noEmit`
Expected: no errors. `cart.ts` isn't imported anywhere yet, so this just confirms the file itself is well-typed in isolation.

- [ ] **Step 3: Commit**

```bash
git add src/cart.ts
git commit -m "$(cat <<'EOF'
Add cart data model and pricing rules

Types and pure pricing helpers (computeUnitPrice, describeCustomization)
for the real cart that App.tsx and PizzaWizard will use, per
docs/superpowers/specs/2026-09-14-pizza-wizard-design.md.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BYFkdHBDesCCiWBYwHeuEF
EOF
)"
```

---

### Task 3: Replace `cartCount`/`addedIds` with a real `cart: CartLine[]` in `App.tsx`

**Files:**
- Modify: `src/App.tsx` (imports, `HomePage`, `Hero` usage, `CtaBanner` usage, `HomeRecommendations`, `MenuPage` signature, `App` root)

- [ ] **Step 1: Add the cart import**

At the top of `src/App.tsx`, right after the `menuData` import added in Task 1, add:

```tsx
import type { CartLine } from "./cart";
```

- [ ] **Step 2: Split `HomePage`'s `onAdd` into `onAddSimple` / `onOrderNow`**

Find:

```tsx
function HomePage({ onAdd, addedIds }: { onAdd: (id?: number) => void; addedIds: Set<number> }) {
  return (
    <>
      <Hero onOrder={() => onAdd()} />
      <HomeRecommendations onAdd={onAdd} addedIds={addedIds} />
      <WhyUs />
      <CtaBanner onOrder={() => onAdd()} />
      <Footer />
    </>
  );
}
```

Replace with:

```tsx
function HomePage({
  onAddSimple,
  onOrderNow,
  addedIds,
}: {
  onAddSimple: (id: number) => void;
  onOrderNow: () => void;
  addedIds: Set<number>;
}) {
  return (
    <>
      <Hero onOrder={onOrderNow} />
      <HomeRecommendations onAdd={onAddSimple} addedIds={addedIds} />
      <WhyUs />
      <CtaBanner onOrder={onOrderNow} />
      <Footer />
    </>
  );
}
```

(`onOrder` used to silently bump a global counter with no real item attached — that's not representable in a real itemized cart, and as a "Pedir ahora" call-to-action it makes more sense to send the visitor into the ordering flow. `onOrderNow` will be wired to navigate to the menu view in Step 5.)

- [ ] **Step 3: Update the `App` root state and handlers**

Find:

```tsx
export default function App() {
  const [cartCount, setCartCount] = useState(0);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  const [view, setView] = useState<View>("home");

  function handleAdd(id?: number) {
    setCartCount((c) => c + 1);
    if (id !== undefined) setAddedIds((prev) => new Set(prev).add(id));
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0d0005" }}>
      <Header cartCount={cartCount} activeView={view} onNav={setView} />
      {view === "home" ? (
        <HomePage onAdd={handleAdd} addedIds={addedIds} />
      ) : view === "menu" ? (
        <MenuPage onAdd={handleAdd} addedIds={addedIds} cartCount={cartCount} />
      ) : (
        <AddressPage onContinue={() => alert("¡Pedido confirmado! Gracias por tu orden.")} cartCount={cartCount} />
      )}
    </div>
  );
}
```

Replace with:

```tsx
export default function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [view, setView] = useState<View>("home");

  const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
  const addedIds = new Set(cart.filter((l) => !l.customization).map((l) => l.menuItemId));

  function addSimpleItem(id: number) {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === id && !l.customization);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      const item = MENU_ITEMS.find((i) => i.id === id)!;
      return [
        ...prev,
        { id: crypto.randomUUID(), menuItemId: item.id, name: item.name, img: item.img, unitPrice: item.price, quantity: 1 },
      ];
    });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0d0005" }}>
      <Header cartCount={cartCount} activeView={view} onNav={setView} />
      {view === "home" ? (
        <HomePage onAddSimple={addSimpleItem} onOrderNow={() => setView("menu")} addedIds={addedIds} />
      ) : view === "menu" ? (
        <MenuPage onAdd={addSimpleItem} addedIds={addedIds} cartCount={cartCount} />
      ) : (
        <AddressPage cart={cart} onContinue={() => alert("¡Pedido confirmado! Gracias por tu orden.")} cartCount={cartCount} />
      )}
    </div>
  );
}
```

Note: `AddressPage` doesn't accept a `cart` prop yet — that's Task 7. This will cause a type error until then; that's expected and will be resolved by the end of this task's own step 4 below (Task 3 stops short of Task 7's scope, so temporarily pass `cart={cart}` and widen `AddressPage`'s prop type minimally right now, just enough to compile — see Step 4).

- [ ] **Step 4: Give `AddressPage` a `cart` prop (typed but unused for now)**

Find:

```tsx
function AddressPage({ onContinue, cartCount }: { onContinue: () => void; cartCount: number }) {
```

Replace with:

```tsx
function AddressPage({ cart, onContinue, cartCount }: { cart: CartLine[]; onContinue: () => void; cartCount: number }) {
```

Leave the rest of `AddressPage`'s body untouched for now (it still uses its own hardcoded `cartItems` — Task 7 replaces that). This step only exists so the file compiles after Task 3; do not skip Task 7 later.

- [ ] **Step 5: Verify**

Run: `npx pnpm exec tsc --noEmit`
Expected: no errors (`tsconfig.json` has neither `noUnusedParameters` nor `noUnusedLocals` enabled, so the temporarily-unused `cart` parameter in `AddressPage` won't be flagged).

Then start the dev server and confirm it still renders:

```bash
PORT=3000 npx pnpm run dev &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

Expected: `200`. Manually open the app in a browser: clicking "Agregar" on any menu card (Home or Menú) should still bump the header cart badge; clicking "Pedir ahora" on the Home hero or "Ordenar con descuento" in the CTA banner should now navigate to the Menú page instead of silently bumping the badge.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
Replace cart counter with a real itemized cart

cartCount/addedIds become derived values from a CartLine[] state.
Home's "Pedir ahora" / "Ordenar con descuento" CTAs now navigate to
the menu instead of incrementing a counter with no attached item,
since that's not representable once the cart holds real line items.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BYFkdHBDesCCiWBYwHeuEF
EOF
)"
```

---

### Task 4: Add the "Personalizar" button to pizza cards

**Files:**
- Modify: `src/App.tsx` (`MenuCard`, `HomeRecommendations`, `MenuPage`, `HomePage`, `App` root)

- [ ] **Step 1: Update `MenuCard` to accept `onPersonalize` and render a second button for pizzas**

Find:

```tsx
function MenuCard({ item, onAdd, added }: { item: MenuItem; onAdd: () => void; added: boolean }) {
```

Replace with:

```tsx
function MenuCard({
  item,
  onAdd,
  onPersonalize,
  added,
}: {
  item: MenuItem;
  onAdd: () => void;
  onPersonalize: () => void;
  added: boolean;
}) {
```

Find (the price + CTA row, inside the same component):

```tsx
        {/* Price + CTA — always visible */}
        <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <span className="text-2xl font-black" style={{ color: "#FF3347", fontFamily: "var(--font-display)" }}>
              ${item.price}
            </span>
            <span className="text-white/35 text-xs ml-1 font-medium">MXN</span>
          </div>
          <button
            onClick={onAdd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-sm text-white transition-all duration-150 active:scale-95"
            style={{
              backgroundColor: added ? "#1B3FAB" : "#D0021B",
              fontFamily: "var(--font-display)",
              boxShadow: added ? "0 2px 10px rgba(27,63,171,0.35)" : "0 2px 10px rgba(208,2,27,0.35)",
            }}
          >
            {added ? <><span>✓</span><span>Agregado</span></> : <><PlusIcon /><span>Agregar</span></>}
          </button>
        </div>
```

Replace with:

```tsx
        {/* Price + CTA — always visible */}
        <div className="flex items-center justify-between mt-3 pt-3 gap-2 flex-wrap" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
          <div>
            <span className="text-2xl font-black" style={{ color: "#FF3347", fontFamily: "var(--font-display)" }}>
              ${item.price}
            </span>
            <span className="text-white/35 text-xs ml-1 font-medium">MXN</span>
          </div>
          <div className="flex items-center gap-2">
            {item.category === "Pizzas" && (
              <button
                onClick={onPersonalize}
                className="px-3 py-2 rounded-lg font-black text-sm transition-all duration-150 active:scale-95"
                style={{ backgroundColor: "transparent", border: "1.5px solid #1B3FAB", color: "#93C5FD", fontFamily: "var(--font-display)" }}
              >
                Personalizar
              </button>
            )}
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-sm text-white transition-all duration-150 active:scale-95"
              style={{
                backgroundColor: added ? "#1B3FAB" : "#D0021B",
                fontFamily: "var(--font-display)",
                boxShadow: added ? "0 2px 10px rgba(27,63,171,0.35)" : "0 2px 10px rgba(208,2,27,0.35)",
              }}
            >
              {added ? <><span>✓</span><span>Agregado</span></> : <><PlusIcon /><span>Agregar</span></>}
            </button>
          </div>
        </div>
```

- [ ] **Step 2: Thread `onPersonalize` through `HomeRecommendations`**

Find:

```tsx
function HomeRecommendations({ onAdd, addedIds }: { onAdd: (id: number) => void; addedIds: Set<number> }) {
  const featured = MENU_ITEMS.filter((i) => i.category === "Pizzas").slice(0, 4);
  return (
    <section className="w-full py-20" style={{ backgroundColor: "#0d0005" }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: "#D0021B", fontFamily: "var(--font-display)" }}>Nuestras estrellas</p>
            <h2 className="text-5xl font-black text-white leading-none" style={{ fontFamily: "var(--font-display)" }}>Recomendaciones</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={() => onAdd(item.id)} added={addedIds.has(item.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

Replace with:

```tsx
function HomeRecommendations({
  onAdd,
  onPersonalize,
  addedIds,
}: {
  onAdd: (id: number) => void;
  onPersonalize: (id: number) => void;
  addedIds: Set<number>;
}) {
  const featured = MENU_ITEMS.filter((i) => i.category === "Pizzas").slice(0, 4);
  return (
    <section className="w-full py-20" style={{ backgroundColor: "#0d0005" }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: "#D0021B", fontFamily: "var(--font-display)" }}>Nuestras estrellas</p>
            <h2 className="text-5xl font-black text-white leading-none" style={{ fontFamily: "var(--font-display)" }}>Recomendaciones</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((item) => (
            <MenuCard key={item.id} item={item} onAdd={() => onAdd(item.id)} onPersonalize={() => onPersonalize(item.id)} added={addedIds.has(item.id)} />
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Thread `onPersonalize` through `MenuPage`**

Find:

```tsx
function MenuPage({ onAdd, addedIds, cartCount }: { onAdd: (id: number) => void; addedIds: Set<number>; cartCount: number }) {
```

Replace with:

```tsx
function MenuPage({
  onAdd,
  onPersonalize,
  addedIds,
  cartCount,
}: {
  onAdd: (id: number) => void;
  onPersonalize: (id: number) => void;
  addedIds: Set<number>;
  cartCount: number;
}) {
```

Find (inside the products grid):

```tsx
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={() => onAdd(item.id)} added={addedIds.has(item.id)} />
            ))}
          </div>
```

Replace with:

```tsx
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={() => onAdd(item.id)} onPersonalize={() => onPersonalize(item.id)} added={addedIds.has(item.id)} />
            ))}
          </div>
```

- [ ] **Step 4: Thread `onPersonalize` through `HomePage`**

Find (the version from Task 3, Step 2):

```tsx
function HomePage({
  onAddSimple,
  onOrderNow,
  addedIds,
}: {
  onAddSimple: (id: number) => void;
  onOrderNow: () => void;
  addedIds: Set<number>;
}) {
  return (
    <>
      <Hero onOrder={onOrderNow} />
      <HomeRecommendations onAdd={onAddSimple} addedIds={addedIds} />
      <WhyUs />
      <CtaBanner onOrder={onOrderNow} />
      <Footer />
    </>
  );
}
```

Replace with:

```tsx
function HomePage({
  onAddSimple,
  onOrderNow,
  onPersonalize,
  addedIds,
}: {
  onAddSimple: (id: number) => void;
  onOrderNow: () => void;
  onPersonalize: (id: number) => void;
  addedIds: Set<number>;
}) {
  return (
    <>
      <Hero onOrder={onOrderNow} />
      <HomeRecommendations onAdd={onAddSimple} onPersonalize={onPersonalize} addedIds={addedIds} />
      <WhyUs />
      <CtaBanner onOrder={onOrderNow} />
      <Footer />
    </>
  );
}
```

- [ ] **Step 5: Add `customizingItemId` state to `App` and pass `onPersonalize` down**

Find (the version from Task 3, Step 3):

```tsx
export default function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [view, setView] = useState<View>("home");

  const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
  const addedIds = new Set(cart.filter((l) => !l.customization).map((l) => l.menuItemId));

  function addSimpleItem(id: number) {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === id && !l.customization);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      const item = MENU_ITEMS.find((i) => i.id === id)!;
      return [
        ...prev,
        { id: crypto.randomUUID(), menuItemId: item.id, name: item.name, img: item.img, unitPrice: item.price, quantity: 1 },
      ];
    });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0d0005" }}>
      <Header cartCount={cartCount} activeView={view} onNav={setView} />
      {view === "home" ? (
        <HomePage onAddSimple={addSimpleItem} onOrderNow={() => setView("menu")} addedIds={addedIds} />
      ) : view === "menu" ? (
        <MenuPage onAdd={addSimpleItem} addedIds={addedIds} cartCount={cartCount} />
      ) : (
        <AddressPage cart={cart} onContinue={() => alert("¡Pedido confirmado! Gracias por tu orden.")} cartCount={cartCount} />
      )}
    </div>
  );
}
```

Replace with:

```tsx
export default function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [view, setView] = useState<View>("home");
  const [customizingItemId, setCustomizingItemId] = useState<number | null>(null);

  const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
  const addedIds = new Set(cart.filter((l) => !l.customization).map((l) => l.menuItemId));

  function addSimpleItem(id: number) {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === id && !l.customization);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      const item = MENU_ITEMS.find((i) => i.id === id)!;
      return [
        ...prev,
        { id: crypto.randomUUID(), menuItemId: item.id, name: item.name, img: item.img, unitPrice: item.price, quantity: 1 },
      ];
    });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0d0005" }}>
      <Header cartCount={cartCount} activeView={view} onNav={setView} />
      {view === "home" ? (
        <HomePage onAddSimple={addSimpleItem} onOrderNow={() => setView("menu")} onPersonalize={setCustomizingItemId} addedIds={addedIds} />
      ) : view === "menu" ? (
        <MenuPage onAdd={addSimpleItem} onPersonalize={setCustomizingItemId} addedIds={addedIds} cartCount={cartCount} />
      ) : (
        <AddressPage cart={cart} onContinue={() => alert("¡Pedido confirmado! Gracias por tu orden.")} cartCount={cartCount} />
      )}
    </div>
  );
}
```

(The wizard itself isn't rendered yet — that's Task 6. Clicking "Personalizar" right now sets state with no visible effect, which is expected and temporary.)

- [ ] **Step 6: Verify**

Run: `npx pnpm exec tsc --noEmit`
Expected: no errors.

Manually check in the browser: pizza cards (Home recommendations and Menú) now show a blue-outlined "Personalizar" button next to "Agregar"; other categories (Acompañamientos, Bebidas, Postres) show only "Agregar". Clicking "Personalizar" does nothing visible yet (expected).

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
Add Personalizar button to pizza cards

Threads an onPersonalize(id) callback through HomeRecommendations,
MenuPage and HomePage, and adds customizingItemId state to App.
The wizard that consumes this is added in the next commit.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BYFkdHBDesCCiWBYwHeuEF
EOF
)"
```

---

### Task 5: Build `src/PizzaWizard.tsx`

**Files:**
- Create: `src/PizzaWizard.tsx`

- [ ] **Step 1: Write the full component**

```tsx
import { useState } from "react";
import { MENU_ITEMS, type MenuItem } from "./menuData";
import {
  type PizzaSize,
  type DoughType,
  type CartLine,
  SIZE_DELTAS,
  DOUGH_DELTAS,
  EXTRA_TOPPINGS,
  computeUnitPrice,
} from "./cart";

const SIZES: PizzaSize[] = ["Chica", "Mediana", "Grande", "Familiar"];
const DOUGHS: DoughType[] = ["Tradicional", "Delgada", "Gruesa", "Rellena de queso"];
const STEP_LABELS = ["Mitad y mitad", "Tamaño y masa", "Ingredientes", "Resumen"] as const;

function formatDelta(n: number): string {
  if (n === 0) return "Sin costo extra";
  return n > 0 ? `+$${n}` : `-$${Math.abs(n)}`;
}

interface PizzaWizardProps {
  pizza: MenuItem;
  onClose: () => void;
  onAdd: (line: CartLine) => void;
}

export default function PizzaWizard({ pizza, onClose, onAdd }: PizzaWizardProps) {
  const [step, setStep] = useState(1);
  const [isHalfHalf, setIsHalfHalf] = useState(false);
  const [secondHalfId, setSecondHalfId] = useState<number | null>(null);
  const [size, setSize] = useState<PizzaSize>("Mediana");
  const [dough, setDough] = useState<DoughType>("Tradicional");
  const [extraToppingIds, setExtraToppingIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);

  const otherPizzas = MENU_ITEMS.filter((i) => i.category === "Pizzas" && i.id !== pizza.id);
  const secondHalf = isHalfHalf && secondHalfId ? MENU_ITEMS.find((i) => i.id === secondHalfId) ?? null : null;
  const basePrice = secondHalf ? Math.max(pizza.price, secondHalf.price) : pizza.price;
  const unitPrice = computeUnitPrice(basePrice, size, dough, extraToppingIds);
  const totalPrice = unitPrice * quantity;
  const displayName = secondHalf ? `${pizza.name} / ${secondHalf.name}` : pizza.name;
  const canAdvanceFromStep1 = !isHalfHalf || secondHalfId !== null;

  function toggleTopping(id: string) {
    setExtraToppingIds((prev) => (prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]));
  }

  function handleNext() {
    if (step === 1 && !canAdvanceFromStep1) return;
    if (step < 4) setStep((s) => s + 1);
  }

  function handleBack() {
    if (step === 1) {
      onClose();
      return;
    }
    setStep((s) => s - 1);
  }

  function handleAddToCart() {
    onAdd({
      id: crypto.randomUUID(),
      menuItemId: pizza.id,
      name: displayName,
      img: pizza.img,
      unitPrice,
      quantity,
      customization: {
        baseItemId: pizza.id,
        secondHalfItemId: secondHalfId ?? undefined,
        size,
        dough,
        extraToppingIds,
      },
    });
  }

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{ backgroundColor: "#0d0005" }}>
      {/* Progress bar */}
      <div style={{ backgroundColor: "#130002", borderBottom: "1px solid rgba(208,2,27,0.2)" }} className="sticky top-0 z-10 w-full">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            {STEP_LABELS.map((label, i) => {
              const s = i + 1;
              const done = s < step;
              const active = s === step;
              return (
                <div key={label} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                      style={{
                        fontFamily: "var(--font-display)",
                        backgroundColor: done ? "#059669" : active ? "#D0021B" : "rgba(255,255,255,0.1)",
                        color: done || active ? "#fff" : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {done ? "✓" : s}
                    </div>
                    <span
                      className="text-sm font-bold hidden sm:inline"
                      style={{ fontFamily: "var(--font-display)", color: active ? "#fff" : done ? "#6EE7B7" : "rgba(255,255,255,0.3)" }}
                    >
                      {label}
                    </span>
                  </div>
                  {s < STEP_LABELS.length && <div className="w-6 h-px" style={{ backgroundColor: "rgba(255,255,255,0.1)" }} />}
                </div>
              );
            })}
          </div>
          <button onClick={onClose} className="p-2 text-white/60 hover:text-white transition-colors" aria-label="Cerrar">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: step content */}
        <div className="lg:col-span-2 rounded-2xl p-7 flex flex-col gap-6" style={{ backgroundColor: "#180004", border: "1.5px solid rgba(208,2,27,0.18)" }}>
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>¿Mitad y mitad?</h2>
                <p className="text-white/45 text-sm font-medium">Combina dos sabores en una sola pizza, o continúa con {pizza.name} completa.</p>
              </div>

              <button
                onClick={() => setIsHalfHalf((v) => !v)}
                className="flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200"
                style={{ backgroundColor: isHalfHalf ? "rgba(208,2,27,0.15)" : "rgba(255,255,255,0.05)", border: `1.5px solid ${isHalfHalf ? "#D0021B" : "rgba(255,255,255,0.12)"}` }}
              >
                <span className="text-sm font-bold text-white">¿Quieres mitad y mitad?</span>
                <div className="w-11 h-6 rounded-full relative transition-all" style={{ backgroundColor: isHalfHalf ? "#D0021B" : "rgba(255,255,255,0.2)" }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: isHalfHalf ? "22px" : "2px" }} />
                </div>
              </button>

              {isHalfHalf && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-bold text-white/70">Elige la segunda mitad:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherPizzas.map((p) => {
                      const selected = secondHalfId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSecondHalfId(p.id)}
                          className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                          style={{ backgroundColor: selected ? "rgba(208,2,27,0.15)" : "rgba(255,255,255,0.04)", border: `1.5px solid ${selected ? "#D0021B" : "rgba(255,255,255,0.08)"}` }}
                        >
                          <img src={p.img} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-white truncate">{p.name}</p>
                            <p className="text-xs font-bold" style={{ color: "#FF3347" }}>${p.price}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {!secondHalfId && <p className="text-xs font-semibold" style={{ color: "#FCA5A5" }}>Selecciona un sabor para continuar.</p>}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-7">
              <div>
                <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Tamaño y masa</h2>
                <p className="text-white/45 text-sm font-medium">Elige el tamaño y el tipo de masa de tu pizza.</p>
              </div>

              <div>
                <p className="text-sm font-bold text-white/70 mb-3">Tamaño</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SIZES.map((s) => {
                    const selected = size === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className="flex flex-col items-center gap-1 px-3 py-4 rounded-xl transition-all duration-200"
                        style={{ backgroundColor: selected ? "#D0021B" : "rgba(255,255,255,0.05)", border: `1.5px solid ${selected ? "#D0021B" : "rgba(255,255,255,0.12)"}` }}
                      >
                        <span className="text-sm font-black text-white">{s}</span>
                        <span className="text-xs font-bold" style={{ color: selected ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>{formatDelta(SIZE_DELTAS[s])}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-white/70 mb-3">Masa</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DOUGHS.map((d) => {
                    const selected = dough === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setDough(d)}
                        className="flex flex-col items-center gap-1 px-3 py-4 rounded-xl transition-all duration-200 text-center"
                        style={{ backgroundColor: selected ? "#D0021B" : "rgba(255,255,255,0.05)", border: `1.5px solid ${selected ? "#D0021B" : "rgba(255,255,255,0.12)"}` }}
                      >
                        <span className="text-sm font-black text-white">{d}</span>
                        <span className="text-xs font-bold" style={{ color: selected ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>{formatDelta(DOUGH_DELTAS[d])}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Ingredientes extra</h2>
                <p className="text-white/45 text-sm font-medium">Agrega los que quieras, cada uno tiene un costo fijo.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EXTRA_TOPPINGS.map((t) => {
                  const selected = extraToppingIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTopping(t.id)}
                      className="flex flex-col items-center gap-1 px-3 py-4 rounded-xl transition-all duration-200 text-center"
                      style={{ backgroundColor: selected ? "#D0021B" : "rgba(255,255,255,0.05)", border: `1.5px solid ${selected ? "#D0021B" : "rgba(255,255,255,0.12)"}` }}
                    >
                      <span className="text-sm font-black text-white">{t.name}</span>
                      <span className="text-xs font-bold" style={{ color: selected ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.4)" }}>+${t.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>Resumen y cantidad</h2>
                <p className="text-white/45 text-sm font-medium">Revisa tu pizza antes de agregarla al carrito.</p>
              </div>

              <div className="flex flex-col gap-2 p-5 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <div className="flex justify-between text-sm font-medium text-white/60"><span>Precio base</span><span>${basePrice}</span></div>
                <div className="flex justify-between text-sm font-medium text-white/60"><span>Tamaño ({size})</span><span>{formatDelta(SIZE_DELTAS[size])}</span></div>
                <div className="flex justify-between text-sm font-medium text-white/60"><span>Masa ({dough})</span><span>{formatDelta(DOUGH_DELTAS[dough])}</span></div>
                {extraToppingIds.length > 0 && (
                  <div className="flex justify-between text-sm font-medium text-white/60">
                    <span>{extraToppingIds.length} ingrediente{extraToppingIds.length > 1 ? "s" : ""} extra</span>
                    <span>+${extraToppingIds.length * 20}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-white mt-2 pt-2" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                  <span style={{ fontFamily: "var(--font-display)" }}>Precio unitario</span>
                  <span style={{ color: "#FF3347", fontFamily: "var(--font-display)" }}>${unitPrice}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ backgroundColor: "rgba(255,255,255,0.04)" }}>
                <span className="text-sm font-bold text-white">Cantidad</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-lg"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    −
                  </button>
                  <span className="text-lg font-black text-white w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-black text-lg"
                    style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nav buttons */}
          <div className="flex items-center justify-between gap-4 mt-auto pt-2">
            <button
              onClick={handleBack}
              className="px-6 py-3 rounded-xl font-bold text-sm text-white/70 hover:text-white transition-all"
              style={{ backgroundColor: "rgba(255,255,255,0.07)", fontFamily: "var(--font-display)" }}
            >
              {step === 1 ? "Cancelar" : "← Atrás"}
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !canAdvanceFromStep1}
                className="px-8 py-3 rounded-xl font-black text-sm text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                style={{ backgroundColor: "#D0021B", fontFamily: "var(--font-display)" }}
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="px-8 py-3 rounded-xl font-black text-sm text-white transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: "#D0021B", fontFamily: "var(--font-display)" }}
              >
                Agregar al carrito →
              </button>
            )}
          </div>
        </div>

        {/* Right: fixed preview panel */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#180004", border: "1.5px solid rgba(208,2,27,0.18)" }}>
            <div className="relative flex" style={{ height: "180px" }}>
              <img
                src={pizza.img}
                alt={pizza.name}
                className="h-full object-cover"
                style={{ width: secondHalf ? "50%" : "100%" }}
              />
              {secondHalf && <img src={secondHalf.img} alt={secondHalf.name} className="h-full object-cover" style={{ width: "50%" }} />}
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #180004 0%, transparent 55%)" }} />
            </div>
            <div className="p-5 flex flex-col gap-3">
              <h3 className="text-lg font-black text-white leading-snug" style={{ fontFamily: "var(--font-display)" }}>{displayName}</h3>
              <div className="flex flex-col gap-1.5 text-sm text-white/55 font-medium">
                <span>Tamaño: <span className="text-white font-bold">{size}</span></span>
                <span>Masa: <span className="text-white font-bold">{dough}</span></span>
                <span>
                  Extras: <span className="text-white font-bold">
                    {extraToppingIds.length === 0
                      ? "Ninguno"
                      : extraToppingIds.map((id) => EXTRA_TOPPINGS.find((t) => t.id === id)?.name).join(", ")}
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex justify-between text-sm text-white/50 font-medium"><span>Unitario</span><span>${unitPrice}</span></div>
                <div className="flex justify-between text-base font-black text-white">
                  <span style={{ fontFamily: "var(--font-display)" }}>Total ({quantity})</span>
                  <span style={{ color: "#FF3347", fontFamily: "var(--font-display)" }}>${totalPrice}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify**

Run: `npx pnpm exec tsc --noEmit`
Expected: no errors. `PizzaWizard.tsx` is not imported anywhere yet, so this only validates the file in isolation.

- [ ] **Step 3: Commit**

```bash
git add src/PizzaWizard.tsx
git commit -m "$(cat <<'EOF'
Add PizzaWizard component (prompt 04)

4-step full-screen wizard: mitad y mitad, tamaño y masa, ingredientes,
resumen — with a fixed side panel showing a live price preview.
Wired into App.tsx in the next commit.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BYFkdHBDesCCiWBYwHeuEF
EOF
)"
```

---

### Task 6: Wire `PizzaWizard` into `App.tsx`

**Files:**
- Modify: `src/App.tsx` (imports, `App` root)

- [ ] **Step 1: Import `PizzaWizard`**

Add near the top of `src/App.tsx`, after the `cart` import from Task 3:

```tsx
import PizzaWizard from "./PizzaWizard";
```

- [ ] **Step 2: Add an `addCustomPizza` handler and render the wizard**

Find (the version from Task 4, Step 5):

```tsx
export default function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [view, setView] = useState<View>("home");
  const [customizingItemId, setCustomizingItemId] = useState<number | null>(null);

  const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
  const addedIds = new Set(cart.filter((l) => !l.customization).map((l) => l.menuItemId));

  function addSimpleItem(id: number) {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === id && !l.customization);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      const item = MENU_ITEMS.find((i) => i.id === id)!;
      return [
        ...prev,
        { id: crypto.randomUUID(), menuItemId: item.id, name: item.name, img: item.img, unitPrice: item.price, quantity: 1 },
      ];
    });
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0d0005" }}>
      <Header cartCount={cartCount} activeView={view} onNav={setView} />
      {view === "home" ? (
        <HomePage onAddSimple={addSimpleItem} onOrderNow={() => setView("menu")} onPersonalize={setCustomizingItemId} addedIds={addedIds} />
      ) : view === "menu" ? (
        <MenuPage onAdd={addSimpleItem} onPersonalize={setCustomizingItemId} addedIds={addedIds} cartCount={cartCount} />
      ) : (
        <AddressPage cart={cart} onContinue={() => alert("¡Pedido confirmado! Gracias por tu orden.")} cartCount={cartCount} />
      )}
    </div>
  );
}
```

Replace with:

```tsx
export default function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [view, setView] = useState<View>("home");
  const [customizingItemId, setCustomizingItemId] = useState<number | null>(null);

  const cartCount = cart.reduce((n, l) => n + l.quantity, 0);
  const addedIds = new Set(cart.filter((l) => !l.customization).map((l) => l.menuItemId));

  function addSimpleItem(id: number) {
    setCart((prev) => {
      const existing = prev.find((l) => l.menuItemId === id && !l.customization);
      if (existing) {
        return prev.map((l) => (l.id === existing.id ? { ...l, quantity: l.quantity + 1 } : l));
      }
      const item = MENU_ITEMS.find((i) => i.id === id)!;
      return [
        ...prev,
        { id: crypto.randomUUID(), menuItemId: item.id, name: item.name, img: item.img, unitPrice: item.price, quantity: 1 },
      ];
    });
  }

  function addCustomPizza(line: CartLine) {
    setCart((prev) => [...prev, line]);
  }

  const customizingPizza = customizingItemId !== null ? MENU_ITEMS.find((i) => i.id === customizingItemId) ?? null : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0d0005" }}>
      <Header cartCount={cartCount} activeView={view} onNav={setView} />
      {view === "home" ? (
        <HomePage onAddSimple={addSimpleItem} onOrderNow={() => setView("menu")} onPersonalize={setCustomizingItemId} addedIds={addedIds} />
      ) : view === "menu" ? (
        <MenuPage onAdd={addSimpleItem} onPersonalize={setCustomizingItemId} addedIds={addedIds} cartCount={cartCount} />
      ) : (
        <AddressPage cart={cart} onContinue={() => alert("¡Pedido confirmado! Gracias por tu orden.")} cartCount={cartCount} />
      )}
      {customizingPizza && (
        <PizzaWizard
          pizza={customizingPizza}
          onClose={() => setCustomizingItemId(null)}
          onAdd={(line) => {
            addCustomPizza(line);
            setCustomizingItemId(null);
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify**

Run: `npx pnpm exec tsc --noEmit`
Expected: no errors.

Start the dev server and manually walk through the flow in a browser:

```bash
PORT=3000 npx pnpm run dev &
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:3000/
```

1. Click "Personalizar" on any pizza (Home or Menú) → the wizard opens full-screen.
2. Toggle "¿Quieres mitad y mitad?" → a second-pizza picker appears; "Siguiente" is disabled until a second pizza is picked; picking one enables it.
3. Step 2: click through sizes/doughs → the price in the right-hand panel updates immediately.
4. Step 3: toggle a couple of extras → price updates again.
5. Step 4: change quantity with +/− → total updates; click "Agregar al carrito →" → wizard closes and the header cart badge increases by the chosen quantity.
6. Click "Personalizar" again, then "Cancelar" on step 1, then (on step 2+) "← Atrás" repeatedly back to step 1 and "Cancelar" — wizard should close without adding anything to the cart in either case.

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
Wire PizzaWizard into App

Personalizar now opens the wizard as a full-screen overlay; finishing
it adds a real CartLine (with size/dough/toppings/half-and-half) to
the cart.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BYFkdHBDesCCiWBYwHeuEF
EOF
)"
```

---

### Task 7: Show the real cart in `AddressPage`

**Files:**
- Modify: `src/App.tsx` (`AddressPage`)

- [ ] **Step 1: Import `describeCustomization`**

Update the `cart` import added in Task 3 from:

```tsx
import type { CartLine } from "./cart";
```

to:

```tsx
import { describeCustomization, type CartLine } from "./cart";
```

- [ ] **Step 2: Replace the hardcoded `cartItems`/`subtotal` with real cart data**

Find (inside `AddressPage`, right after the validation/submit handlers):

```tsx
  const hasErrors = Object.keys(validate(form)).length > 0;
  const cartItems = [
    { name: "Pepperoni Clásica", size: "Mediana", price: 249 },
    { name: "Pan de Ajo", size: "Porción", price: 89 },
  ];
  const subtotal = cartItems.reduce((s, i) => s + i.price, 0);
```

Replace with:

```tsx
  const hasErrors = Object.keys(validate(form)).length > 0;
  const subtotal = cart.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
```

- [ ] **Step 3: Render real cart lines in the summary card**

Find:

```tsx
            <div className="flex flex-col gap-3 mb-4">
              {cartItems.map((item) => (
                <div key={item.name} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">{item.name}</p>
                    <p className="text-xs text-white/40 font-medium">{item.size}</p>
                  </div>
                  <span className="text-sm font-black shrink-0" style={{ color: "#FF3347", fontFamily: "var(--font-display)" }}>${item.price}</span>
                </div>
              ))}
            </div>
```

Replace with:

```tsx
            <div className="flex flex-col gap-3 mb-4">
              {cart.length === 0 ? (
                <p className="text-white/40 text-sm font-medium">Tu carrito está vacío.</p>
              ) : (
                cart.map((line) => (
                  <div key={line.id} className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-white">
                        {line.quantity > 1 ? `${line.quantity}× ` : ""}
                        {line.name}
                      </p>
                      <p className="text-xs text-white/40 font-medium">{describeCustomization(line.customization) ?? "—"}</p>
                    </div>
                    <span className="text-sm font-black shrink-0" style={{ color: "#FF3347", fontFamily: "var(--font-display)" }}>
                      ${line.unitPrice * line.quantity}
                    </span>
                  </div>
                ))
              )}
            </div>
```

- [ ] **Step 4: Verify**

Run: `npx pnpm exec tsc --noEmit`
Expected: no errors.

Manual browser check:
1. From Menú, add a simple item (e.g. "Agregar" on Pan de Ajo) and a personalized pizza via the wizard (pick a non-default size/dough/extra so it's easy to tell apart from the menu price).
2. Click "Pedir en línea" to reach the address page.
3. Confirm the "Resumen del pedido" card shows both real lines with the correct name, quantity prefix (if >1), customization subtitle (e.g. "Grande · Masa gruesa · +1 extra"), and per-line price (`unitPrice × quantity`).
4. Confirm the subtotal matches the sum of what's displayed.
5. Go back to Menú, add one more item, return to Address — the summary should reflect the addition (state is preserved across navigation since it lives in `App`).
6. With an empty cart (fresh page load, no items added), the address page should show "Tu carrito está vacío." instead of a stale/hardcoded item.

- [ ] **Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "$(cat <<'EOF'
Show the real cart in the address page summary

AddressPage's "Resumen del pedido" now renders actual CartLine items
(including customization details) instead of two hardcoded rows.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01BYFkdHBDesCCiWBYwHeuEF
EOF
)"
```

---

### Task 8: Final regression pass and push to main

**Files:** none (verification + push only)

- [ ] **Step 1: Type check**

Run: `npx pnpm exec tsc --noEmit`
Expected: no errors.

- [ ] **Step 2: Production build**

Run: `npx pnpm run build`
Expected: build succeeds and produces `dist/` with no errors.

- [ ] **Step 3: Full manual walkthrough**

With the dev server running (`PORT=3000 npx pnpm run dev`), in a browser:

1. Home → "Pedir ahora" and "Ordenar con descuento" both navigate to Menú (not a silent counter bump).
2. Home recommendations and Menú: "Agregar" on a non-pizza item increments the badge by 1 each click, reusing the same cart line (check via the address page: quantity prefix like "3× Pan de Ajo", not three separate rows).
3. "Personalizar" on a pizza → full wizard flow start to finish, including half-and-half, at least one size other than Mediana, at least one dough other than Tradicional, at least one extra topping, and quantity > 1 → verify the live price panel matches the final line price shown later in Address.
4. Cancel a wizard mid-way (both from step 1 and from a later step via repeated "← Atrás") → confirm nothing is added to the cart.
5. Address page: mode toggle between "Entrega a domicilio" and "Recoger en tienda" still works; delivery form validation (required fields, inline errors) still works as before (untouched by this plan — regression check only).
6. Resize the browser to a narrow/mobile width and confirm the wizard's step content and side panel stack vertically without overflow.

Expected: no console errors in the browser dev tools during any of the above.

- [ ] **Step 4: Push to main**

Per project workflow, review happens on the Vercel deploy, not locally — push directly to `main`:

```bash
git push origin main
```

Expected: push succeeds; Vercel picks up the new commits and deploys automatically.
