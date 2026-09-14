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
  formatPrice,
} from "./cart";

const SIZES: PizzaSize[] = ["Chica", "Mediana", "Grande", "Familiar"];
const DOUGHS: DoughType[] = ["Tradicional", "Delgada", "Gruesa", "Rellena de queso"];
const STEP_LABELS = ["Mitad y mitad", "Tamaño y masa", "Ingredientes", "Resumen"] as const;

function formatDelta(n: number): string {
  if (n === 0) return "Sin costo extra";
  return n > 0 ? `+$${formatPrice(n)}` : `-$${formatPrice(Math.abs(n))}`;
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
  const toppingsTotal = extraToppingIds.reduce((sum, id) => sum + (EXTRA_TOPPINGS.find((t) => t.id === id)?.price ?? 0), 0);

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
    <div className="fixed inset-0 z-[60] overflow-y-auto" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Progress bar */}
      <div style={{ backgroundColor: "#FFFFFF", borderBottom: "1px solid rgba(0,0,0,0.08)" }} className="sticky top-0 z-10 w-full">
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
                        backgroundColor: done ? "#059669" : active ? "#E31837" : "rgba(0,0,0,0.08)",
                        color: done || active ? "#fff" : "rgba(0,0,0,0.35)",
                      }}
                    >
                      {done ? "✓" : s}
                    </div>
                    <span
                      className="text-sm font-bold hidden sm:inline"
                      style={{ fontFamily: "var(--font-display)", color: active ? "#E31837" : done ? "#059669" : "rgba(0,0,0,0.35)" }}
                    >
                      {label}
                    </span>
                  </div>
                  {s < STEP_LABELS.length && <div className="w-6 h-px" style={{ backgroundColor: "rgba(0,0,0,0.1)" }} />}
                </div>
              );
            })}
          </div>
          <button onClick={onClose} className="p-2 text-black/50 hover:text-black transition-colors" aria-label="Cerrar">
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left: step content */}
        <div className="lg:col-span-2 rounded-2xl p-7 flex flex-col gap-6" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
          {step === 1 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>¿Mitad y mitad?</h2>
                <p className="text-neutral-900/55 text-sm font-medium">Combina dos sabores en una sola pizza, o continúa con {pizza.name} completa.</p>
              </div>

              <button
                onClick={() => setIsHalfHalf((v) => !v)}
                className="flex items-center justify-between px-5 py-4 rounded-xl transition-all duration-200"
                style={{ backgroundColor: isHalfHalf ? "rgba(227,24,55,0.1)" : "rgba(0,0,0,0.03)", border: `1.5px solid ${isHalfHalf ? "#E31837" : "rgba(0,0,0,0.1)"}` }}
              >
                <span className="text-sm font-bold text-neutral-900">¿Quieres mitad y mitad?</span>
                <div className="w-11 h-6 rounded-full relative transition-all" style={{ backgroundColor: isHalfHalf ? "#E31837" : "rgba(0,0,0,0.15)" }}>
                  <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: isHalfHalf ? "22px" : "2px" }} />
                </div>
              </button>

              {isHalfHalf && (
                <div className="flex flex-col gap-3">
                  <p className="text-sm font-bold text-neutral-900/70">Elige la segunda mitad:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {otherPizzas.map((p) => {
                      const selected = secondHalfId === p.id;
                      return (
                        <button
                          key={p.id}
                          onClick={() => setSecondHalfId(p.id)}
                          className="flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200"
                          style={{ backgroundColor: selected ? "rgba(227,24,55,0.1)" : "rgba(0,0,0,0.02)", border: `1.5px solid ${selected ? "#E31837" : "rgba(0,0,0,0.08)"}` }}
                        >
                          <img src={p.img} alt={p.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-neutral-900 truncate">{p.name}</p>
                            <p className="text-xs font-bold" style={{ color: "#E31837" }}>${formatPrice(p.price)}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  {!secondHalfId && <p className="text-xs font-semibold" style={{ color: "#E31837" }}>Selecciona un sabor para continuar.</p>}
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-7">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>Tamaño y masa</h2>
                <p className="text-neutral-900/55 text-sm font-medium">Elige el tamaño y el tipo de masa de tu pizza.</p>
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-900/70 mb-3">Tamaño</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {SIZES.map((s) => {
                    const selected = size === s;
                    return (
                      <button
                        key={s}
                        onClick={() => setSize(s)}
                        className="flex flex-col items-center gap-1 px-3 py-4 rounded-xl transition-all duration-200"
                        style={{ backgroundColor: selected ? "#E31837" : "rgba(0,0,0,0.03)", border: `1.5px solid ${selected ? "#E31837" : "rgba(0,0,0,0.1)"}` }}
                      >
                        <span className="text-sm font-black" style={{ color: selected ? "#fff" : "#1a1310" }}>{s}</span>
                        <span className="text-xs font-bold" style={{ color: selected ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.4)" }}>{formatDelta(SIZE_DELTAS[s])}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-neutral-900/70 mb-3">Masa</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {DOUGHS.map((d) => {
                    const selected = dough === d;
                    return (
                      <button
                        key={d}
                        onClick={() => setDough(d)}
                        className="flex flex-col items-center gap-1 px-3 py-4 rounded-xl transition-all duration-200 text-center"
                        style={{ backgroundColor: selected ? "#E31837" : "rgba(0,0,0,0.03)", border: `1.5px solid ${selected ? "#E31837" : "rgba(0,0,0,0.1)"}` }}
                      >
                        <span className="text-sm font-black" style={{ color: selected ? "#fff" : "#1a1310" }}>{d}</span>
                        <span className="text-xs font-bold" style={{ color: selected ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.4)" }}>{formatDelta(DOUGH_DELTAS[d])}</span>
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
                <h2 className="text-2xl font-black text-neutral-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>Ingredientes extra</h2>
                <p className="text-neutral-900/55 text-sm font-medium">Agrega los que quieras, cada uno tiene un costo fijo.</p>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {EXTRA_TOPPINGS.map((t) => {
                  const selected = extraToppingIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTopping(t.id)}
                      className="flex flex-col items-center gap-1 px-3 py-4 rounded-xl transition-all duration-200 text-center"
                      style={{ backgroundColor: selected ? "#E31837" : "rgba(0,0,0,0.03)", border: `1.5px solid ${selected ? "#E31837" : "rgba(0,0,0,0.1)"}` }}
                    >
                      <span className="text-sm font-black" style={{ color: selected ? "#fff" : "#1a1310" }}>{t.name}</span>
                      <span className="text-xs font-bold" style={{ color: selected ? "rgba(255,255,255,0.85)" : "rgba(0,0,0,0.4)" }}>+${formatPrice(t.price)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-6">
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>Resumen y cantidad</h2>
                <p className="text-neutral-900/55 text-sm font-medium">Revisa tu pizza antes de agregarla al carrito.</p>
              </div>

              <div className="flex flex-col gap-2 p-5 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                <div className="flex justify-between text-sm font-medium text-neutral-900/60"><span>Precio base</span><span>${formatPrice(basePrice)}</span></div>
                <div className="flex justify-between text-sm font-medium text-neutral-900/60"><span>Tamaño ({size})</span><span>{formatDelta(SIZE_DELTAS[size])}</span></div>
                <div className="flex justify-between text-sm font-medium text-neutral-900/60"><span>Masa ({dough})</span><span>{formatDelta(DOUGH_DELTAS[dough])}</span></div>
                {extraToppingIds.length > 0 && (
                  <div className="flex justify-between text-sm font-medium text-neutral-900/60">
                    <span>{extraToppingIds.length} ingrediente{extraToppingIds.length > 1 ? "s" : ""} extra</span>
                    <span>+${formatPrice(toppingsTotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-neutral-900 mt-2 pt-2" style={{ borderTop: "1px solid rgba(0,0,0,0.1)" }}>
                  <span style={{ fontFamily: "var(--font-display)" }}>Precio unitario</span>
                  <span style={{ color: "#E31837", fontFamily: "var(--font-display)" }}>${formatPrice(unitPrice)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                <span className="text-sm font-bold text-neutral-900">Cantidad</span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-900 font-black text-lg"
                    style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
                  >
                    −
                  </button>
                  <span className="text-lg font-black text-neutral-900 w-6 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(20, q + 1))}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-neutral-900 font-black text-lg"
                    style={{ backgroundColor: "rgba(0,0,0,0.08)" }}
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
              className="px-6 py-3 rounded-xl font-bold text-sm text-neutral-900/70 hover:text-neutral-900 transition-all"
              style={{ backgroundColor: "rgba(0,0,0,0.05)", fontFamily: "var(--font-display)" }}
            >
              {step === 1 ? "Cancelar" : "← Atrás"}
            </button>
            {step < 4 ? (
              <button
                onClick={handleNext}
                disabled={step === 1 && !canAdvanceFromStep1}
                className="px-8 py-3 rounded-xl font-black text-sm text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
                style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)" }}
              >
                Siguiente →
              </button>
            ) : (
              <button
                onClick={handleAddToCart}
                className="px-8 py-3 rounded-xl font-black text-sm text-white transition-all hover:brightness-110 active:scale-95"
                style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)" }}
              >
                Agregar al carrito →
              </button>
            )}
          </div>
        </div>

        {/* Right: fixed preview panel */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-28">
          <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <div className="relative flex" style={{ height: "180px" }}>
              <img
                src={pizza.img}
                alt={pizza.name}
                className="h-full object-cover"
                style={{ width: secondHalf ? "50%" : "100%" }}
              />
              {secondHalf && <img src={secondHalf.img} alt={secondHalf.name} className="h-full object-cover" style={{ width: "50%" }} />}
            </div>
            <div className="p-5 flex flex-col gap-3">
              <h3 className="text-lg font-black text-neutral-900 leading-snug" style={{ fontFamily: "var(--font-display)" }}>{displayName}</h3>
              <div className="flex flex-col gap-1.5 text-sm text-neutral-900/60 font-medium">
                <span>Tamaño: <span className="text-neutral-900 font-bold">{size}</span></span>
                <span>Masa: <span className="text-neutral-900 font-bold">{dough}</span></span>
                <span>
                  Extras: <span className="text-neutral-900 font-bold">
                    {extraToppingIds.length === 0
                      ? "Ninguno"
                      : extraToppingIds.map((id) => EXTRA_TOPPINGS.find((t) => t.id === id)?.name).join(", ")}
                  </span>
                </span>
              </div>
              <div className="flex flex-col gap-1 pt-3" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
                <div className="flex justify-between text-sm text-neutral-900/55 font-medium"><span>Unitario</span><span>${formatPrice(unitPrice)}</span></div>
                <div className="flex justify-between text-base font-black text-neutral-900">
                  <span style={{ fontFamily: "var(--font-display)" }}>Total ({quantity})</span>
                  <span style={{ color: "#E31837", fontFamily: "var(--font-display)" }}>${formatPrice(totalPrice)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
