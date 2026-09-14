# Wizard de personalización de pizza + carrito real (Prompt 04)

## Contexto

Implementa el prompt 04 de Figma Make (ver CLAUDE.md): wizard de personalización de pizza en 4 pasos, con barra de progreso, panel lateral fijo con vista previa y precio en tiempo real, y botones Atrás/Siguiente.

El carrito actual (`src/App.tsx`) es solo un contador (`cartCount`) y un `Set<number>` de IDs agregados — no guarda cantidad, tamaño, masa ni ingredientes. Este trabajo también reemplaza ese modelo por un carrito real con ítems, para que el wizard tenga dónde escribir y para que el resumen de pedido en `AddressPage` (hoy con ítems hardcoded) muestre datos reales.

Es la primera de tres piezas pendientes; el orden acordado es 04 → 06 (checkout) → 05 (login). Checkout (06) consumirá el modelo de carrito definido aquí.

## Alcance

**Incluye:**
- Modelo de datos de carrito con ítems reales (cantidad, personalización de pizza).
- Wizard de personalización de pizza en 4 pasos.
- Botones "Agregar" (rápido) y "Personalizar" en las cards de pizza.
- Conexión del carrito real al badge del header y al resumen de `AddressPage`.

**No incluye (explícitamente fuera de alcance):**
- Drawer o página de carrito dedicada (el usuario ve/edita el pedido en el checkout, prompt 06, no aquí).
- Checkout / pago (prompt 06, siguiente sub-proyecto).
- Login/registro (prompt 05).
- Refactor de `App.tsx` en múltiples archivos por pantalla existente (Home/Menú/Address se quedan donde están; solo se exportan los tipos/datos que el wizard necesita importar).
- Persistencia real (todo sigue siendo estado de cliente, simulado).

## Modelo de datos (`src/cart.ts`, nuevo archivo)

```ts
export type PizzaSize = "Chica" | "Mediana" | "Grande" | "Familiar";
export type DoughType = "Tradicional" | "Delgada" | "Gruesa" | "Rellena de queso";

export interface PizzaCustomization {
  baseItemId: number;
  secondHalfItemId?: number; // presente solo si es mitad y mitad
  size: PizzaSize;
  dough: DoughType;
  extraToppingIds: string[]; // ids de EXTRA_TOPPINGS
}

export interface CartLine {
  id: string;             // id único de línea (crypto.randomUUID() o contador incremental)
  menuItemId: number;     // pizza base, o el ítem simple (acompañamiento/bebida/postre)
  name: string;           // nombre ya resuelto para mostrar
  img: string;
  unitPrice: number;      // precio final por unidad, ya con recargos aplicados
  quantity: number;
  customization?: PizzaCustomization; // ausente en ítems simples
}
```

### Reglas de precio

- **Tamaño** (delta sobre precio base, referencia = Mediana): Chica −$30, Mediana $0, Grande +$40, Familiar +$80.
- **Masa** (delta): Tradicional $0, Delgada $0, Gruesa +$15, Rellena de queso +$35.
- **Mitad y mitad**: precio base de la pizza = `max(precio de menú de mitad 1, precio de menú de mitad 2)`. Sin mitad y mitad, precio base = precio de menú de la pizza elegida.
- **Ingredientes extra**: lista plana (sin categorías), $20 cada uno, catálogo fijo:
  `EXTRA_TOPPINGS = ["Champiñones", "Piña", "Jalapeño", "Tocino", "Aceituna negra", "Cebolla morada", "Extra queso", "Pimiento"]`
- **Precio unitario final** = precio base + delta tamaño + delta masa + (n.º de extras × $20).
- **Total de línea** = precio unitario × cantidad.

`cart.ts` exporta: los tipos de arriba, `SIZE_DELTAS`, `DOUGH_DELTAS`, `EXTRA_TOPPINGS` (con su precio), y una función pura `computeUnitPrice(basePrice: number, size: PizzaSize, dough: DoughType, extraToppingIds: string[]): number`.

## Cambios en `src/App.tsx`

- Exportar `MENU_ITEMS`, `MenuItem`, `Category` (quitar el `const`/`interface` sin `export` y agregarlo) para que `PizzaWizard.tsx` los pueda importar sin duplicar datos.
- Reemplazar `const [cartCount, setCartCount] = useState(0)` y `const [addedIds, setAddedIds] = useState<Set<number>>(...)` por `const [cart, setCart] = useState<CartLine[]>([])`.
- `cartCount` para el header pasa a derivarse: `cart.reduce((n, l) => n + l.quantity, 0)`.
- Nueva función `addSimpleItem(menuItemId: number)`: si ya existe una línea con ese `menuItemId` y sin `customization`, incrementa su `quantity`; si no, agrega una línea nueva con `quantity: 1` y `unitPrice` = precio de menú.
- Nueva función `addCustomPizza(line: CartLine)`: siempre agrega una línea nueva (no se fusiona con líneas existentes, cada personalización es distinta aunque coincidan casualmente los valores — simplifica la lógica y evita falsos merges).
- `addedIds`-equivalente para el check visual "Agregado" en `MenuCard`: se deriva de `cart.some(l => l.menuItemId === item.id && !l.customization)` (mismo comportamiento visible que hoy, ahora basado en el carrito real).
- `AddressPage` recibe `cart: CartLine[]` como prop en vez de generar sus `cartItems` hardcoded; el resumen muestra `line.name`, un subtítulo con tamaño/masa cuando `customization` está presente (ej. "Grande · Masa gruesa · +2 extras"), `unitPrice × quantity`, y el subtotal real (`sum` de todas las líneas).
- Estado nuevo `customizingItemId: number | null` en `App`: cuando no es `null`, se renderiza `<PizzaWizard>` como overlay de pantalla completa (`fixed inset-0`) por encima de la vista actual (Home o Menú), tapándola visualmente sin necesidad de desmontarla. Cerrar el wizard (✕, o completar "Agregar al carrito") vuelve a `customizingItemId = null` sin cambiar `view`.

## `src/PizzaWizard.tsx` (nuevo archivo)

Componente `PizzaWizard({ pizza: MenuItem, onClose: () => void, onAdd: (line: CartLine) => void })`.

Estado interno: `step: 1 | 2 | 3 | 4`, `isHalfHalf: boolean`, `secondHalfId: number | null`, `size: PizzaSize`, `dough: DoughType`, `extraToppingIds: string[]`, `quantity: number`.

Valores por defecto al abrir: `size = "Mediana"`, `dough = "Tradicional"`, `isHalfHalf = false`, `extraToppingIds = []`, `quantity = 1`.

**Layout común a los 4 pasos:**
- Overlay `fixed inset-0 z-[60]` a pantalla completa (mismo fondo oscuro `#0d0005` del resto del sitio).
- Barra de progreso arriba con las 4 etiquetas ("Mitad y mitad", "Tamaño y masa", "Ingredientes", "Resumen"), paso actual resaltado en rojo (`#D0021B`), pasos completados en verde (mismo patrón que el breadcrumb de `AddressPage`).
- Botón ✕ de cierre en la esquina superior derecha → `onClose()`.
- Grid de 2 columnas en desktop (1 en mobile): columna izquierda = contenido del paso actual; columna derecha = panel fijo de vista previa (imagen de la pizza —o de ambas mitades si es mitad y mitad—, nombre, tamaño/masa elegidos, lista de extras, precio unitario y total en vivo vía `computeUnitPrice` y `quantity`).
- Pie con botones "Atrás" (paso 1 → `onClose()`) y "Siguiente" (paso 4 → "Agregar al carrito", que llama `onAdd(...)` con la línea construida y luego `onClose()`).

**Paso 1 — Mitad y mitad:** muestra la pizza elegida como mitad completa; toggle "¿Quieres mitad y mitad?"; si está activo, selector (grid de cards pequeñas, igual estilo que `MenuCard` pero compacto) con las demás pizzas de `MENU_ITEMS.filter(i => i.category === "Pizzas" && i.id !== pizza.id)` para elegir `secondHalfId`.

**Paso 2 — Tamaño y masa:** dos grupos de botones tipo "chip" (4 tamaños, 4 masas), cada chip muestra el delta de precio (ej. "Grande +$40").

**Paso 3 — Ingredientes:** grid de checkboxes/chips con los 8 `EXTRA_TOPPINGS`, cada uno mostrando "+$20", toggle simple sin límite de selección.

**Paso 4 — Resumen:** desglose de precio (base, tamaño, masa, extras, total unitario), selector de cantidad +/− (mínimo 1, tope 20), total final = unitario × cantidad, botón grande "Agregar al carrito →".

## `src/MenuCard` (dentro de `App.tsx`, se edita en el lugar)

Para `item.category === "Pizzas"`: dos botones en la fila inferior — "Agregar" (llama `addSimpleItem`, mismo estilo actual) y "Personalizar" (estilo secundario, azul de acento `#1B3FAB`, abre el wizard). Para las demás categorías: se mantiene el único botón "Agregar" tal cual existe hoy.

## Testing / verificación

No hay suite de tests automatizada en el proyecto (`package.json` no define `test`). Verificación manual en el navegador vía `npx pnpm run dev` (puerto 3000):
1. Desde Menú y desde Home, "Agregar" en una pizza suma 1 al badge del carrito sin abrir el wizard.
2. "Personalizar" abre el wizard a pantalla completa; navegar los 4 pasos con Atrás/Siguiente; el precio del panel lateral cambia en vivo al tocar tamaño, masa, extras y mitad y mitad.
3. "Agregar al carrito" en el paso 4 cierra el wizard, suma `quantity` al badge del header.
4. Ir a "Pedir en línea" (Address): el resumen de pedido muestra las líneas reales agregadas (simples y personalizadas) con su subtotal correcto; agregar más ítems desde Menú y volver a Address refleja el cambio.
5. Ítems simples repetidos (mismo "Agregar" dos veces) incrementan cantidad en una sola línea, no crean dos líneas.

## Decisiones explícitas (para evitar ambigüedad)

- Cerrar el wizard a medio llenar no pide confirmación (es una demo, no hay pérdida real de datos persistidos).
- Cada pizza personalizada agregada crea una línea de carrito nueva e independiente, aunque sus opciones coincidan con una línea previa.
- El botón "Carrito" del header sigue sin abrir un panel — es solo un contador — hasta el prompt 06 (checkout).
