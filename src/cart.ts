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
