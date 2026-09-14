import { describeCustomization, formatPrice, type CartLine } from "./cart";

interface CartDrawerProps {
  cart: CartLine[];
  onClose: () => void;
  onIncrement: (lineId: string) => void;
  onDecrement: (lineId: string) => void;
  onRemove: (lineId: string) => void;
  onCheckout: () => void;
  onBrowseMenu: () => void;
}

export default function CartDrawer({ cart, onClose, onIncrement, onDecrement, onRemove, onCheckout, onBrowseMenu }: CartDrawerProps) {
  const subtotal = cart.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  return (
    <div className="fixed inset-0 z-[70]" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="absolute top-0 right-0 h-full w-full max-w-md flex flex-col"
        style={{ backgroundColor: "#FFFFFF", boxShadow: "-8px 0 40px rgba(0,0,0,0.15)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
          <h2 className="text-xl font-black text-neutral-900" style={{ fontFamily: "var(--font-display)" }}>Tu carrito</h2>
          <button onClick={onClose} className="p-1 text-black/40 hover:text-black transition-colors" aria-label="Cerrar">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Items */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
            <span className="text-5xl opacity-40">🛒</span>
            <p className="text-neutral-900/50 font-semibold">Tu carrito está vacío.</p>
            <button
              onClick={onBrowseMenu}
              className="px-5 py-2.5 rounded-lg text-sm font-bold text-white"
              style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)" }}
            >
              Ver el menú
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-4">
            {cart.map((line) => {
              const customizationLabel = describeCustomization(line.customization);
              return (
                <div key={line.id} className="flex gap-3">
                  <img src={line.img} alt={line.name} className="w-16 h-16 rounded-xl object-cover shrink-0" style={{ border: "1px solid rgba(0,0,0,0.08)" }} />
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-neutral-900 leading-snug">{line.name}</p>
                      <button onClick={() => onRemove(line.id)} className="shrink-0 text-black/30 hover:text-black/60 transition-colors" aria-label="Quitar">
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                    {customizationLabel && <p className="text-xs text-neutral-900/45 font-medium">{customizationLabel}</p>}
                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onDecrement(line.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm"
                          style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "#1a1310" }}
                          aria-label="Restar"
                        >
                          −
                        </button>
                        <span className="text-sm font-black text-neutral-900 w-4 text-center">{line.quantity}</span>
                        <button
                          onClick={() => onIncrement(line.id)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center font-black text-sm"
                          style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "#1a1310" }}
                          aria-label="Sumar"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-black" style={{ color: "#E31837", fontFamily: "var(--font-display)" }}>
                        ${formatPrice(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer */}
        {cart.length > 0 && (
          <div className="px-6 py-5 flex flex-col gap-4" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
            <div className="flex justify-between text-base font-black text-neutral-900">
              <span style={{ fontFamily: "var(--font-display)" }}>Subtotal</span>
              <span style={{ color: "#E31837", fontFamily: "var(--font-display)" }}>${formatPrice(subtotal)} COP</span>
            </div>
            <button
              onClick={onCheckout}
              className="w-full py-4 rounded-xl font-black text-lg text-white transition-all hover:brightness-110 active:scale-[0.98]"
              style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)", boxShadow: "0 4px 24px rgba(227,24,55,0.4)" }}
            >
              Continuar pedido →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
