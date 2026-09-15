import { useState, useEffect } from "react";
import { MENU_ITEMS, type MenuItem, type Category } from "./menuData";
import { describeCustomization, formatPrice, type CartLine } from "./cart";
import PizzaWizard from "./PizzaWizard";
import LoginModal from "./LoginModal";
import CartDrawer from "./CartDrawer";
import { logoDataUri as logo } from "./assets/logo";
import heroImg from "./assets/hero.jpg";
import { FieldError, Label, inputStyle, selectStyle } from "./formHelpers";

// ─── Data ───────────────────────────────────────────────────────────────────

type View = "home" | "menu" | "address";

const CATEGORIES: Category[] = ["Pizzas", "Acompañamientos", "Bebidas", "Postres"];

const CATEGORY_ICONS: Record<Category, string> = {
  Pizzas: "🍕",
  Acompañamientos: "🍟",
  Bebidas: "🥤",
  Postres: "🍰",
};

const TAG_COLORS: Record<string, string> = {
  "La más pedida": "#E31837",
  "Favorita del chef": "#7C3AED",
  Nuevo: "#059669",
  "Oferta 2×1": "#006491",
  Premium: "#92400E",
  Picante: "#EA580C",
  Artesanal: "#0F766E",
};

// ─── Icons ───────────────────────────────────────────────────────────────────

function CartIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24" stroke="#FBBF24" strokeWidth="1">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

// ─── Header ─────────────────────────────────────────────────────────────────

const NAV_LINKS: { label: string; view?: View }[] = [
  { label: "Pedir en línea", view: "address" },
  { label: "Menú", view: "menu" },
  { label: "Tiendas" },
  { label: "Promos" },
];

function AddedToCartToast({ onViewCart, onDismiss }: { onViewCart: () => void; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <div
      className="fixed bottom-6 right-6 left-6 sm:left-auto z-[65] w-full sm:max-w-sm rounded-2xl p-5 flex flex-col gap-3"
      style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 30px rgba(0,0,0,0.18)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">✅</span>
        <p className="flex-1 font-bold text-neutral-900 pt-0.5" style={{ fontFamily: "var(--font-display)" }}>Se ha agregado al carrito</p>
        <button onClick={onDismiss} className="text-black/30 hover:text-black/60 transition-colors shrink-0" aria-label="Cerrar">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onViewCart}
          className="flex-1 py-2.5 rounded-lg font-bold text-sm text-white transition-all hover:brightness-110"
          style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)" }}
        >
          Ver el carrito
        </button>
        <button
          onClick={onDismiss}
          className="flex-1 py-2.5 rounded-lg font-bold text-sm text-neutral-900/70 hover:text-neutral-900 transition-all"
          style={{ backgroundColor: "rgba(0,0,0,0.05)", fontFamily: "var(--font-display)" }}
        >
          Seguir explorando
        </button>
      </div>
    </div>
  );
}

function NotConfiguredPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.5)" }} onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col items-center gap-4 text-center"
        style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-5xl">😄</span>
        <p className="text-neutral-900 font-bold text-lg leading-relaxed">
          En esta versión de MockUp no hemos configurado este apartado profe
        </p>
        <button
          onClick={onClose}
          className="mt-2 px-6 py-2.5 rounded-lg font-bold text-sm text-white"
          style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)" }}
        >
          Entendido
        </button>
      </div>
    </div>
  );
}

function Header({
  cartCount,
  activeView,
  onNav,
  isLoggedIn,
  onAccountClick,
  onCartClick,
}: {
  cartCount: number;
  activeView: View;
  onNav: (v: View) => void;
  isLoggedIn: boolean;
  onAccountClick: () => void;
  onCartClick: () => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notConfiguredOpen, setNotConfiguredOpen] = useState(false);

  function handleNavClick(view?: View) {
    if (view) onNav(view);
    else setNotConfiguredOpen(true);
  }

  return (
    <header style={{ backgroundColor: "#FFFFFF", borderBottom: "2px solid #E31837" }} className="sticky top-0 z-50 w-full">
      {/* Main row */}
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-5 gap-6">
        <button onClick={() => onNav("home")} className="flex items-center gap-3 shrink-0">
          <img src={logo} alt="Domino's Pizza" className="w-12 h-12 object-contain" />
          <span className="text-neutral-900 font-black text-3xl tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Domino's <span style={{ color: "#E31837" }}>Pizza</span>
          </span>
        </button>

        <nav className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ label, view }) => {
            const isActive = view && activeView === view;
            return (
              <button
                key={label}
                onClick={() => handleNavClick(view)}
                className="px-4 py-2 rounded-md text-sm font-bold transition-all duration-150"
                style={{
                  fontFamily: "var(--font-display)",
                  color: isActive ? "#E31837" : "rgba(0,0,0,0.6)",
                  backgroundColor: isActive ? "rgba(227,24,55,0.1)" : "transparent",
                  borderBottom: isActive ? "2px solid #E31837" : "2px solid transparent",
                }}
              >
                {label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={onAccountClick}
            className="hidden md:flex items-center justify-center w-10 h-10 rounded-full transition-all duration-150"
            style={{
              color: isLoggedIn ? "#059669" : "rgba(0,0,0,0.6)",
              backgroundColor: isLoggedIn ? "rgba(5,150,105,0.1)" : "transparent",
            }}
            aria-label={isLoggedIn ? "Cerrar sesión" : "Iniciar sesión"}
          >
            <UserIcon />
          </button>
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-white text-sm transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)" }}
          >
            <CartIcon />
            <span>Carrito</span>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center text-white" style={{ backgroundColor: "#006491" }}>
                {cartCount}
              </span>
            )}
          </button>
          <button className="md:hidden p-2 text-black/70" onClick={() => setMobileOpen((v) => !v)}>
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {mobileOpen ? <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /> : <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />}
            </svg>
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-black/10 px-6 pb-4 flex flex-col gap-1" style={{ backgroundColor: "#FFFFFF" }}>
          {NAV_LINKS.map(({ label, view }) => (
            <button key={label} onClick={() => { handleNavClick(view); setMobileOpen(false); }} className="py-2.5 text-sm font-bold text-black/80 hover:text-black border-b border-black/5 last:border-0 text-left" style={{ fontFamily: "var(--font-display)" }}>
              {label}
            </button>
          ))}
        </div>
      )}

      {notConfiguredOpen && <NotConfiguredPopup onClose={() => setNotConfiguredOpen(false)} />}
    </header>
  );
}

// ─── Home Page ───────────────────────────────────────────────────────────────

function Hero({ onOrder }: { onOrder: () => void }) {
  return (
    <section className="relative w-full overflow-hidden" style={{ minHeight: "88vh" }}>
      <img src={heroImg} alt="Pizza recién horneada" className="absolute inset-0 w-full h-full object-cover object-center" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(10,0,0,0.93) 0%, rgba(10,0,0,0.72) 52%, rgba(10,0,0,0.32) 100%)" }} />
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 flex items-center h-full" style={{ minHeight: "88vh" }}>
        <div className="max-w-2xl py-20">
          <h1 className="text-6xl md:text-7xl font-black leading-none tracking-tight mb-8 text-white" style={{ fontFamily: "var(--font-display)" }}>
            No puedes decir<br />Domino's sin decir<br /><span style={{ color: "#E31837" }}>mmm</span>.
          </h1>
          <div className="flex flex-wrap gap-4 items-center">
            <button onClick={onOrder} className="px-8 py-4 rounded-xl font-black text-lg text-white transition-all hover:brightness-110 active:scale-95 shadow-lg" style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)", boxShadow: "0 4px 24px rgba(227,24,55,0.5)" }}>
              Pedir ahora →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

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
    <section className="w-full py-20" style={{ backgroundColor: "#FFFFFF" }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <div className="flex items-end justify-between mb-10 flex-wrap gap-4">
          <div>
            <p className="text-xs font-black tracking-widest uppercase mb-2" style={{ color: "#E31837", fontFamily: "var(--font-display)" }}>Nuestras estrellas</p>
            <h2 className="text-5xl font-black text-neutral-900 leading-none" style={{ fontFamily: "var(--font-display)" }}>Recomendaciones</h2>
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

function WhyUs() {
  const items = [
    { icon: "🚀", title: "Entrega ultrarrápida", desc: "Garantizamos tu pizza en 30 minutos o la próxima es gratis." },
    { icon: "🌿", title: "Ingredientes frescos", desc: "Masa artesanal 24h de fermentación. Nada de congelados." },
    { icon: "🔥", title: "Horno de leña", desc: "Cocción auténtica a 450°C para una base perfectamente crujiente." },
    { icon: "🎁", title: "Programa de puntos", desc: "Acumula puntos con cada pedido y canjéalos por pizzas gratis." },
  ];
  return (
    <section className="w-full py-20" style={{ backgroundColor: "#F7F4F3" }}>
      <div className="max-w-screen-xl mx-auto px-6">
        <h2 className="text-4xl font-black text-neutral-900 mb-12 text-center" style={{ fontFamily: "var(--font-display)" }}>
          ¿Por qué <span style={{ color: "#E31837" }}>Domino's Pizza</span>?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div key={item.title} className="flex flex-col gap-3 p-6 rounded-2xl" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{item.icon}</span>
                <h3 className="text-lg font-black text-neutral-900" style={{ fontFamily: "var(--font-display)" }}>{item.title}</h3>
              </div>
              <p className="text-neutral-900/55 text-sm font-medium leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaBanner({ onOrder }: { onOrder: () => void }) {
  return (
    <section className="w-full py-20 relative overflow-hidden" style={{ backgroundColor: "#E31837" }}>
      <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full opacity-10 bg-white" />
      <div className="absolute -left-12 -bottom-20 w-64 h-64 rounded-full opacity-10 bg-white" />
      <div className="relative z-10 max-w-screen-xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <h2 className="text-5xl font-black text-white leading-tight" style={{ fontFamily: "var(--font-display)" }}>
            Tu primera orden con<br /><span style={{ color: "#FFD4D9" }}>20% de descuento</span>
          </h2>
          <p className="text-white/75 font-semibold mt-3 text-lg">Usa el código <strong className="text-white">DOMINOS20</strong> al finalizar tu compra.</p>
        </div>
        <button onClick={onOrder} className="shrink-0 px-10 py-4 rounded-xl font-black text-lg text-white transition-all hover:brightness-110 active:scale-95" style={{ backgroundColor: "#006491", fontFamily: "var(--font-display)", boxShadow: "0 4px 24px rgba(0,100,145,0.5)" }}>
          Ordenar con descuento →
        </button>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="w-full py-12" style={{ backgroundColor: "#F7F4F3", borderTop: "1.5px solid rgba(227,24,55,0.2)" }}>
      <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <img src={logo} alt="Domino's Pizza" className="w-8 h-8 object-contain" />
            <span className="text-neutral-900 font-black text-xl" style={{ fontFamily: "var(--font-display)" }}>Domino's Pizza</span>
          </div>
          <p className="text-neutral-900/50 text-sm font-medium leading-relaxed">Masa artesanal, ingredientes frescos y pasión por la pizza desde 1960.</p>
        </div>
        {[
          { title: "Compañía", links: ["Sobre nosotros", "Trabaja con nosotros", "Prensa", "Sostenibilidad"] },
          { title: "Soporte", links: ["Centro de ayuda", "Rastrear pedido", "Devoluciones", "Contacto"] },
          { title: "Legal", links: ["Privacidad", "Términos de uso", "Cookies", "Accesibilidad"] },
        ].map((col) => (
          <div key={col.title}>
            <h4 className="text-neutral-900 font-black text-sm uppercase tracking-widest mb-4" style={{ fontFamily: "var(--font-display)" }}>{col.title}</h4>
            <ul className="flex flex-col gap-2">
              {col.links.map((link) => <li key={link}><a href="#" className="text-neutral-900/50 text-sm font-medium hover:text-neutral-900/80 transition-colors">{link}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-screen-xl mx-auto px-6 mt-10 pt-6 flex flex-wrap gap-4 items-center justify-between" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
        <p className="text-neutral-900/40 text-xs font-medium">© 2026 Domino's Pizza. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          {["Facebook", "Instagram", "TikTok", "Twitter"].map((s) => <a key={s} href="#" className="text-neutral-900/40 text-xs font-semibold hover:text-neutral-900/70 transition-colors">{s}</a>)}
        </div>
      </div>
    </footer>
  );
}

// ─── Menu Card ───────────────────────────────────────────────────────────────

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
  const tagColor = item.tag ? (TAG_COLORS[item.tag] ?? "#E31837") : "#E31837";

  return (
    <article
      className="group relative flex flex-col rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
      style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.08)" }}
    >
      {/* Tag */}
      {item.tag && (
        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-black tracking-wide uppercase text-white" style={{ backgroundColor: tagColor, fontFamily: "var(--font-display)" }}>
            {item.tag}
          </span>
        </div>
      )}

      {/* Image */}
      <div className="relative overflow-hidden bg-[#f2ecea]" style={{ height: "220px" }}>
        <img src={item.img} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5 gap-2.5">
        {item.popular && (
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => <StarIcon key={i} />)}
            <span className="text-neutral-900/45 text-xs ml-1 font-semibold">(128)</span>
          </div>
        )}

        <h3 className="text-lg font-black text-neutral-900 leading-snug" style={{ fontFamily: "var(--font-display)" }}>
          {item.name}
        </h3>
        <p className="text-neutral-900/55 text-sm font-medium leading-relaxed flex-1">{item.desc}</p>

        {/* Price + CTA — always visible */}
        <div className="flex items-center justify-between mt-3 pt-3 gap-2 flex-wrap" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
          <div>
            <span className="text-2xl font-black" style={{ color: "#E31837", fontFamily: "var(--font-display)" }}>
              ${formatPrice(item.price)}
            </span>
            <span className="text-neutral-900/35 text-xs ml-1 font-medium">COP</span>
          </div>
          <div className="flex items-center gap-2">
            {item.category === "Pizzas" && (
              <button
                onClick={onPersonalize}
                className="px-3 py-2 rounded-lg font-black text-sm transition-all duration-150 active:scale-95"
                style={{ backgroundColor: "transparent", border: "1.5px solid #006491", color: "#006491", fontFamily: "var(--font-display)" }}
              >
                Personalizar
              </button>
            )}
            <button
              onClick={onAdd}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg font-black text-sm text-white transition-all duration-150 active:scale-95"
              style={{
                backgroundColor: added ? "#006491" : "#E31837",
                fontFamily: "var(--font-display)",
                boxShadow: added ? "0 2px 10px rgba(0,100,145,0.35)" : "0 2px 10px rgba(227,24,55,0.35)",
              }}
            >
              {added ? <><span>✓</span><span>Agregado</span></> : <><PlusIcon /><span>Agregar</span></>}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

// ─── Menu Page ───────────────────────────────────────────────────────────────

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
  const [activeCategory, setActiveCategory] = useState<Category>("Pizzas");
  const [search, setSearch] = useState("");

  const filtered = MENU_ITEMS.filter(
    (item) =>
      item.category === activeCategory &&
      (search === "" || item.name.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const counts = Object.fromEntries(
    CATEGORIES.map((cat) => [cat, MENU_ITEMS.filter((i) => i.category === cat).length])
  ) as Record<Category, number>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Page hero / banner */}
      <div
        className="w-full relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #1a0005 0%, #2d000a 50%, #1a0005 100%)", borderBottom: "2px solid rgba(227,24,55,0.3)" }}
      >
        {/* Decorative circles */}
        <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10" style={{ background: "#E31837" }} />
        <div className="absolute -left-10 -bottom-16 w-48 h-48 rounded-full opacity-8" style={{ background: "#E31837" }} />

        <div className="relative z-10 max-w-screen-xl mx-auto px-6 py-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h1 className="text-5xl font-black text-white leading-none mb-2" style={{ fontFamily: "var(--font-display)" }}>
              Todo lo que <span style={{ color: "#E31837" }}>amamos</span>
            </h1>
            <p className="text-white/55 font-semibold text-lg max-w-md">
              Pizzas artesanales, acompañamientos, bebidas y postres. Ingredientes frescos en cada platillo.
            </p>
          </div>

          {/* Search */}
          <div className="relative md:w-80">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-900/45" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Buscar en el menú..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl text-neutral-900 text-sm font-semibold placeholder:text-neutral-900/40 outline-none transition-all shadow-lg"
              style={{ backgroundColor: "#FFFFFF", border: "1.5px solid transparent", fontFamily: "var(--font-body)" }}
              onFocus={(e) => (e.target.style.borderColor = "#E31837")}
              onBlur={(e) => (e.target.style.borderColor = "transparent")}
            />
          </div>
        </div>

        {/* Promo strip */}
        <div className="relative z-10 max-w-screen-xl mx-auto px-6 pb-6 flex flex-wrap gap-3">
          {[
            { label: "2×1 martes", icon: "🔥", color: "#E31837" },
            { label: "Envío gratis +$300", icon: "🚀", color: "#006491" },
            { label: "20% primera orden: DOMINOS20", icon: "🎁", color: "#059669" },
          ].map((promo) => (
            <div
              key={promo.label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-xs font-black"
              style={{ backgroundColor: `${promo.color}22`, border: `1px solid ${promo.color}55`, fontFamily: "var(--font-display)" }}
            >
              <span>{promo.icon}</span>
              <span>{promo.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter tabs — sticky */}
      <div className="sticky z-40 w-full" style={{ top: "var(--header-height, 96px)", backgroundColor: "#FFFFFF", borderBottom: "1.5px solid rgba(0,0,0,0.08)" }}>
        <div className="max-w-screen-xl mx-auto px-6">
          <div className="flex items-center gap-1 overflow-x-auto py-3" style={{ scrollbarWidth: "none" }}>
            {CATEGORIES.map((cat) => {
              const isActive = cat === activeCategory;
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all duration-200 shrink-0"
                  style={{
                    fontFamily: "var(--font-display)",
                    backgroundColor: isActive ? "#E31837" : "rgba(0,0,0,0.05)",
                    color: isActive ? "#fff" : "rgba(0,0,0,0.55)",
                    boxShadow: isActive ? "0 2px 12px rgba(227,24,55,0.4)" : "none",
                  }}
                >
                  <span className="text-base">{CATEGORY_ICONS[cat]}</span>
                  <span>{cat}</span>
                  <span
                    className="ml-0.5 px-1.5 py-0.5 rounded-full text-xs font-black"
                    style={{
                      backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)",
                      color: isActive ? "#fff" : "rgba(0,0,0,0.45)",
                    }}
                  >
                    {counts[cat]}
                  </span>
                </button>
              );
            })}

            {/* Cart summary chip */}
            {cartCount > 0 && (
              <div className="ml-auto shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white" style={{ backgroundColor: "#006491", fontFamily: "var(--font-display)" }}>
                <CartIcon />
                <span>{cartCount} en carrito</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products grid */}
      <div className="max-w-screen-xl mx-auto px-6 py-10">
        {/* Category heading */}
        <div className="mb-8">
          <h2 className="text-3xl font-black text-neutral-900" style={{ fontFamily: "var(--font-display)" }}>
            {activeCategory}
          </h2>
          <p className="text-neutral-900/40 text-sm font-semibold">
            {filtered.length} {filtered.length === 1 ? "producto" : "productos"}
            {search && ` para "${search}"`}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <span className="text-6xl opacity-40">🔍</span>
            <p className="text-neutral-900/40 font-semibold text-lg">No encontramos resultados para "{search}"</p>
            <button onClick={() => setSearch("")} className="px-5 py-2 rounded-lg text-sm font-bold text-white" style={{ backgroundColor: "#E31837", fontFamily: "var(--font-display)" }}>
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((item) => (
              <MenuCard key={item.id} item={item} onAdd={() => onAdd(item.id)} onPersonalize={() => onPersonalize(item.id)} added={addedIds.has(item.id)} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

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

// ─── Address / Pickup Page ────────────────────────────────────────────────────

type DeliveryMode = "delivery" | "pickup";

interface AddressForm {
  departamento: string;
  ciudad: string;
  barrio: string;
  tipoVia: string;
  nombreVia: string;
  numero: string;
  tipoInmueble: string;
  piso: string;
  referencias: string;
}

interface FormErrors {
  departamento?: string;
  ciudad?: string;
  barrio?: string;
  tipoVia?: string;
  nombreVia?: string;
  numero?: string;
  tipoInmueble?: string;
}

const COLOMBIA_DEPARTAMENTOS = [
  "Bogotá D.C.",
  "Amazonas",
  "Antioquia",
  "Arauca",
  "Atlántico",
  "Bolívar",
  "Boyacá",
  "Caldas",
  "Caquetá",
  "Casanare",
  "Cauca",
  "Cesar",
  "Chocó",
  "Córdoba",
  "Cundinamarca",
  "Guainía",
  "Guaviare",
  "Huila",
  "La Guajira",
  "Magdalena",
  "Meta",
  "Nariño",
  "Norte de Santander",
  "Putumayo",
  "Quindío",
  "Risaralda",
  "San Andrés y Providencia",
  "Santander",
  "Sucre",
  "Tolima",
  "Valle del Cauca",
  "Vaupés",
  "Vichada",
];

const STORES = [
  {
    id: 1,
    name: "Domino's Centro",
    address: "Av. Juárez 234, Centro Histórico",
    distance: "0.8 km",
    wait: "15–20 min",
    open: true,
    hours: "10:00 – 23:00",
    lat: 19.432,
    lng: -99.133,
  },
  {
    id: 2,
    name: "Domino's Polanco",
    address: "Presidente Masaryk 87, Polanco",
    distance: "2.3 km",
    wait: "10–15 min",
    open: true,
    hours: "11:00 – 23:30",
    lat: 19.433,
    lng: -99.19,
  },
  {
    id: 3,
    name: "Domino's Roma Norte",
    address: "Orizaba 101, Roma Norte",
    distance: "3.1 km",
    wait: "20–25 min",
    open: false,
    hours: "12:00 – 22:00",
    lat: 19.415,
    lng: -99.158,
  },
  {
    id: 4,
    name: "Domino's Condesa",
    address: "Tamaulipas 54, Hipódromo Condesa",
    distance: "3.6 km",
    wait: "15–20 min",
    open: true,
    hours: "11:00 – 23:00",
    lat: 19.41,
    lng: -99.173,
  },
];

// Fake satellite map built with CSS layers to evoke an aerial tile view
function SatelliteMapMock({ selectedStore, onSelect }: { selectedStore: number | null; onSelect: (id: number) => void }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height: "420px", backgroundColor: "#1a2a1a" }}>
      {/* Satellite-style background tiles */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 30% 60%, #1e3a1e 0%, #0e1e0e 40%, #0a180a 100%)",
      }} />

      {/* Street grid overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 800 420" preserveAspectRatio="none">
        {/* Diagonal avenue */}
        <path d="M0 210 L800 160" stroke="#c8a84b" strokeWidth="6" opacity="0.6" />
        <path d="M0 230 L800 180" stroke="#c8a84b" strokeWidth="3" opacity="0.3" />
        {/* Grid streets */}
        <line x1="0" y1="120" x2="800" y2="120" stroke="#8aaa6a" strokeWidth="2.5" opacity="0.5" />
        <line x1="0" y1="280" x2="800" y2="280" stroke="#8aaa6a" strokeWidth="2.5" opacity="0.5" />
        <line x1="0" y1="50" x2="800" y2="50" stroke="#6a8a5a" strokeWidth="1.5" opacity="0.35" />
        <line x1="0" y1="360" x2="800" y2="360" stroke="#6a8a5a" strokeWidth="1.5" opacity="0.35" />
        <line x1="140" y1="0" x2="140" y2="420" stroke="#8aaa6a" strokeWidth="2.5" opacity="0.5" />
        <line x1="360" y1="0" x2="360" y2="420" stroke="#8aaa6a" strokeWidth="2.5" opacity="0.5" />
        <line x1="580" y1="0" x2="580" y2="420" stroke="#8aaa6a" strokeWidth="2.5" opacity="0.5" />
        <line x1="60" y1="0" x2="60" y2="420" stroke="#6a8a5a" strokeWidth="1.5" opacity="0.35" />
        <line x1="250" y1="0" x2="250" y2="420" stroke="#6a8a5a" strokeWidth="1.5" opacity="0.35" />
        <line x1="470" y1="0" x2="470" y2="420" stroke="#6a8a5a" strokeWidth="1.5" opacity="0.35" />
        <line x1="690" y1="0" x2="690" y2="420" stroke="#6a8a5a" strokeWidth="1.5" opacity="0.35" />
        {/* City blocks */}
        <rect x="70" y="55" width="60" height="55" fill="#2a4a2a" rx="2" opacity="0.7" />
        <rect x="150" y="130" width="90" height="80" fill="#253823" rx="2" opacity="0.6" />
        <rect x="260" y="55" width="80" height="55" fill="#2a4030" rx="2" opacity="0.6" />
        <rect x="370" y="130" width="100" height="70" fill="#253823" rx="2" opacity="0.6" />
        <rect x="590" y="55" width="80" height="60" fill="#2a4a2a" rx="2" opacity="0.7" />
        <rect x="70" y="135" width="55" height="60" fill="#1e3520" rx="2" opacity="0.5" />
        <rect x="480" y="130" width="85" height="70" fill="#253823" rx="2" opacity="0.6" />
        <rect x="70" y="295" width="60" height="55" fill="#2a4a2a" rx="2" opacity="0.6" />
        <rect x="150" y="295" width="90" height="55" fill="#253823" rx="2" opacity="0.5" />
        <rect x="370" y="295" width="100" height="55" fill="#253823" rx="2" opacity="0.5" />
        <rect x="590" y="295" width="80" height="55" fill="#2a4a2a" rx="2" opacity="0.6" />
        {/* Park / green area */}
        <ellipse cx="480" cy="300" rx="65" ry="50" fill="#1a4a1a" opacity="0.7" />
        <ellipse cx="490" cy="295" rx="30" ry="22" fill="#2a6a2a" opacity="0.6" />
      </svg>

      {/* Subtle vignette */}
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)" }} />

      {/* Map attribution */}
      <div className="absolute bottom-2 right-3 text-xs text-white/20 font-mono">© Domino's Maps</div>

      {/* Store pins */}
      {[
        { id: 1, x: "18%", y: "50%" },
        { id: 2, x: "45%", y: "28%" },
        { id: 3, x: "64%", y: "62%" },
        { id: 4, x: "82%", y: "38%" },
      ].map((pin) => {
        const store = STORES.find((s) => s.id === pin.id)!;
        const isSelected = selectedStore === pin.id;
        return (
          <button
            key={pin.id}
            onClick={() => onSelect(pin.id)}
            className="absolute -translate-x-1/2 -translate-y-full transition-all duration-200"
            style={{ left: pin.x, top: pin.y }}
          >
            {/* Pin */}
            <div className="relative flex flex-col items-center">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-white text-xs font-black whitespace-nowrap transition-all duration-200"
                style={{
                  fontFamily: "var(--font-display)",
                  backgroundColor: isSelected ? "#E31837" : store.open ? "#006491" : "#555",
                  boxShadow: isSelected ? "0 2px 16px rgba(227,24,55,0.6)" : "0 2px 8px rgba(0,0,0,0.5)",
                  transform: isSelected ? "scale(1.12)" : "scale(1)",
                }}
              >
                <span>🍕</span>
                <span>{store.name.replace("Domino's ", "")}</span>
                {!store.open && <span className="opacity-60">(Cerrada)</span>}
              </div>
              {/* Needle */}
              <div
                className="w-0.5 h-3"
                style={{ backgroundColor: isSelected ? "#E31837" : store.open ? "#006491" : "#555" }}
              />
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: isSelected ? "#E31837" : store.open ? "#006491" : "#555", marginTop: "-2px" }}
              />
            </div>
          </button>
        );
      })}

      {/* Zoom controls */}
      <div className="absolute top-3 right-3 flex flex-col gap-1">
        {["+", "−"].map((z) => (
          <button key={z} className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-lg transition-all hover:brightness-110" style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)" }}>
            {z}
          </button>
        ))}
      </div>

      {/* Location button */}
      <button className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:brightness-110" style={{ backgroundColor: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.15)", fontFamily: "var(--font-display)" }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3" /><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83" /></svg>
        Mi ubicación
      </button>
    </div>
  );
}

function AddressPage({
  cart,
  onContinue,
  cartCount,
}: {
  cart: CartLine[];
  onContinue: () => void;
  cartCount: number;
}) {
  const [mode, setMode] = useState<DeliveryMode>("delivery");
  const [selectedStore, setSelectedStore] = useState<number | null>(1);
  const [form, setForm] = useState<AddressForm>({
    departamento: "",
    ciudad: "",
    barrio: "",
    tipoVia: "",
    nombreVia: "",
    numero: "",
    tipoInmueble: "",
    piso: "",
    referencias: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof AddressForm, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);

  function validate(f: AddressForm): FormErrors {
    const e: FormErrors = {};
    if (!f.departamento) e.departamento = "Selecciona tu departamento";
    if (!f.ciudad.trim()) e.ciudad = "Ingresa tu ciudad";
    if (!f.barrio.trim()) e.barrio = "Ingresa tu barrio";
    if (!f.tipoVia) e.tipoVia = "Selecciona el tipo de vía";
    if (!f.nombreVia.trim()) e.nombreVia = "Ingresa el nombre o número de la vía";
    if (!f.numero.trim()) e.numero = "El número exterior es obligatorio";
    if (!f.tipoInmueble) e.tipoInmueble = "Selecciona el tipo de inmueble";
    return e;
  }

  function handleChange(field: keyof AddressForm, value: string) {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (submitted || touched[field]) {
      setErrors(validate(updated));
    }
  }

  function handleBlur(field: keyof AddressForm) {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({ ...e, ...validate({ ...form }) }));
  }

  function handleSubmit() {
    setSubmitted(true);
    if (mode === "pickup") {
      if (selectedStore) onContinue();
      return;
    }
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      onContinue();
    } else {
      // scroll to first error
      const firstEl = document.querySelector("[data-error-field]");
      firstEl?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  const hasErrors = Object.keys(validate(form)).length > 0;
  const subtotal = cart.reduce((s, l) => s + l.unitPrice * l.quantity, 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FFFFFF" }}>
      {/* Breadcrumb / steps */}
      <div style={{ backgroundColor: "#F7F4F3", borderBottom: "1px solid rgba(227,24,55,0.2)" }} className="w-full">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center gap-2">
          {[
            { label: "Carrito", step: 1, done: true },
            { label: "Entrega", step: 2, active: true },
            { label: "Pago", step: 3 },
            { label: "Confirmación", step: 4 },
          ].map((s, i, arr) => (
            <div key={s.label} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                  style={{
                    fontFamily: "var(--font-display)",
                    backgroundColor: s.done ? "#059669" : s.active ? "#E31837" : "rgba(0,0,0,0.08)",
                    color: s.done || s.active ? "#fff" : "rgba(0,0,0,0.35)",
                  }}
                >
                  {s.done ? "✓" : s.step}
                </div>
                <span
                  className="text-sm font-bold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: s.active ? "#E31837" : s.done ? "#059669" : "rgba(0,0,0,0.35)",
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < arr.length - 1 && (
                <div className="w-8 h-px mx-1" style={{ backgroundColor: "rgba(0,0,0,0.1)" }} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ── Left: form area ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Mode toggle */}
          <div className="flex gap-0 rounded-2xl overflow-hidden p-1" style={{ backgroundColor: "rgba(0,0,0,0.03)", border: "1.5px solid rgba(0,0,0,0.08)" }}>
            {(["delivery", "pickup"] as DeliveryMode[]).map((m) => {
              const active = mode === m;
              return (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className="flex-1 flex items-center justify-center gap-2.5 py-3 rounded-xl font-black text-sm transition-all duration-200"
                  style={{
                    fontFamily: "var(--font-display)",
                    backgroundColor: active ? "#E31837" : "transparent",
                    color: active ? "#fff" : "rgba(0,0,0,0.45)",
                    boxShadow: active ? "0 2px 12px rgba(227,24,55,0.4)" : "none",
                  }}
                >
                  {m === "delivery" ? (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="1" y="3" width="15" height="13" /><polygon points="16 8 20 8 23 11 23 16 16 16 16 8" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></svg><span>Entrega a domicilio</span></>
                  ) : (
                    <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg><span>Recoger en tienda</span></>
                  )}
                </button>
              );
            })}
          </div>

          {mode === "delivery" ? (
            /* ── Delivery form ── */
            <div className="rounded-2xl p-7 flex flex-col gap-6" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
              <div>
                <h2 className="text-2xl font-black text-neutral-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>Dirección de entrega</h2>
                <p className="text-neutral-900/50 text-sm font-medium">Los campos marcados con <span style={{ color: "#E31837" }}>*</span> son obligatorios.</p>
              </div>

              {/* Row 0: Departamento + Ciudad */}
              <div className="grid grid-cols-2 gap-4">
                <div data-error-field={errors.departamento ? "departamento" : undefined}>
                  <Label required>Departamento</Label>
                  <div className="relative">
                    <select
                      value={form.departamento}
                      onChange={(e) => handleChange("departamento", e.target.value)}
                      onBlur={() => handleBlur("departamento")}
                      className="w-full px-4 py-3 rounded-xl text-sm appearance-none outline-none pr-10"
                      style={selectStyle(!!errors.departamento && (submitted || !!touched.departamento))}
                    >
                      <option value="" disabled>Seleccionar…</option>
                      {COLOMBIA_DEPARTAMENTOS.map((v) => (
                        <option key={v} value={v} style={{ backgroundColor: "#FFFFFF" }}>{v}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-900/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  <FieldError msg={(submitted || touched.departamento) ? errors.departamento : undefined} />
                </div>

                <div data-error-field={errors.ciudad ? "ciudad" : undefined}>
                  <Label required>Ciudad</Label>
                  <input
                    type="text"
                    placeholder="Ej. Medellín"
                    value={form.ciudad}
                    onChange={(e) => handleChange("ciudad", e.target.value)}
                    onBlur={() => handleBlur("ciudad")}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-neutral-900/35"
                    style={inputStyle(!!errors.ciudad && (submitted || !!touched.ciudad))}
                  />
                  <FieldError msg={(submitted || touched.ciudad) ? errors.ciudad : undefined} />
                </div>
              </div>

              {/* Row 0.5: Barrio */}
              <div data-error-field={errors.barrio ? "barrio" : undefined}>
                <Label required>Barrio</Label>
                <input
                  type="text"
                  placeholder="Ej. El Poblado"
                  value={form.barrio}
                  onChange={(e) => handleChange("barrio", e.target.value)}
                  onBlur={() => handleBlur("barrio")}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-neutral-900/35"
                  style={inputStyle(!!errors.barrio && (submitted || !!touched.barrio))}
                />
                <FieldError msg={(submitted || touched.barrio) ? errors.barrio : undefined} />
              </div>

              {/* Row 1: Tipo de vía + Nombre */}
              <div className="grid grid-cols-5 gap-4">
                <div className="col-span-2" data-error-field={errors.tipoVia ? "tipoVia" : undefined}>
                  <Label required>Tipo de vía</Label>
                  <div className="relative">
                    <select
                      value={form.tipoVia}
                      onChange={(e) => handleChange("tipoVia", e.target.value)}
                      onBlur={() => handleBlur("tipoVia")}
                      className="w-full px-4 py-3 rounded-xl text-sm appearance-none outline-none pr-10"
                      style={selectStyle(!!errors.tipoVia && (submitted || !!touched.tipoVia))}
                    >
                      <option value="" disabled>Seleccionar…</option>
                      {["Avenida", "Calle", "Carrera", "Diagonal", "Transversal", "Circular", "Autopista"].map((v) => (
                        <option key={v} value={v} style={{ backgroundColor: "#FFFFFF" }}>{v}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-900/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  <FieldError msg={(submitted || touched.tipoVia) ? errors.tipoVia : undefined} />
                </div>

                <div className="col-span-3" data-error-field={errors.nombreVia ? "nombreVia" : undefined}>
                  <Label required>Nombre</Label>
                  <input
                    type="text"
                    placeholder="Ej. 45 o Insurgentes Sur"
                    value={form.nombreVia}
                    onChange={(e) => handleChange("nombreVia", e.target.value)}
                    onBlur={() => handleBlur("nombreVia")}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-neutral-900/35"
                    style={inputStyle(!!errors.nombreVia && (submitted || !!touched.nombreVia))}
                  />
                  <FieldError msg={(submitted || touched.nombreVia) ? errors.nombreVia : undefined} />
                </div>
              </div>

              {/* Row 2: Número exterior + Tipo de inmueble */}
              <div className="grid grid-cols-2 gap-4">
                <div data-error-field={errors.numero ? "numero" : undefined}>
                  <Label required>Número exterior</Label>
                  <input
                    type="text"
                    placeholder="Ej. 458"
                    value={form.numero}
                    onChange={(e) => handleChange("numero", e.target.value)}
                    onBlur={() => handleBlur("numero")}
                    className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-neutral-900/35"
                    style={inputStyle(!!errors.numero && (submitted || !!touched.numero))}
                  />
                  <FieldError msg={(submitted || touched.numero) ? errors.numero : undefined} />
                </div>

                <div data-error-field={errors.tipoInmueble ? "tipoInmueble" : undefined}>
                  <Label required>Tipo de inmueble</Label>
                  <div className="relative">
                    <select
                      value={form.tipoInmueble}
                      onChange={(e) => handleChange("tipoInmueble", e.target.value)}
                      onBlur={() => handleBlur("tipoInmueble")}
                      className="w-full px-4 py-3 rounded-xl text-sm appearance-none outline-none pr-10"
                      style={selectStyle(!!errors.tipoInmueble && (submitted || !!touched.tipoInmueble))}
                    >
                      <option value="" disabled>Seleccionar…</option>
                      {["Casa", "Apartamento", "Oficina", "Local comercial", "Hotel", "Otro"].map((v) => (
                        <option key={v} value={v} style={{ backgroundColor: "#FFFFFF" }}>{v}</option>
                      ))}
                    </select>
                    <svg className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-900/40" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                  </div>
                  <FieldError msg={(submitted || touched.tipoInmueble) ? errors.tipoInmueble : undefined} />
                </div>
              </div>

              {/* Row 3: Piso / Apartamento (opcional) */}
              <div>
                <Label>Piso / Apartamento</Label>
                <input
                  type="text"
                  placeholder="Ej. Piso 3, Apto 12 (opcional)"
                  value={form.piso}
                  onChange={(e) => handleChange("piso", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-neutral-900/35"
                  style={inputStyle(false)}
                />
              </div>

              {/* Row 4: Referencias / Instrucciones adicionales */}
              <div>
                <Label>Instrucciones adicionales</Label>
                <textarea
                  placeholder="Ej. Portón azul, toca el timbre 3B, dejar con el vigilante…"
                  value={form.referencias}
                  onChange={(e) => handleChange("referencias", e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none placeholder:text-neutral-900/35 resize-none"
                  style={inputStyle(false)}
                />
                <p className="text-neutral-900/40 text-xs font-medium mt-1.5">
                  {form.referencias.length}/200 caracteres · Ayuda al repartidor a encontrarte
                </p>
              </div>

              {/* Validate inline summary */}
              {submitted && hasErrors && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(227,24,55,0.1)", border: "1.5px solid rgba(227,24,55,0.35)" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E31837" strokeWidth="2.5" className="shrink-0 mt-0.5"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                  <p className="text-sm font-semibold" style={{ color: "#E31837" }}>
                    Revisa los campos marcados en rojo antes de continuar.
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* ── Pickup mode ── */
            <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
              <div className="p-6 pb-4">
                <h2 className="text-2xl font-black text-neutral-900 mb-1" style={{ fontFamily: "var(--font-display)" }}>Tiendas cercanas</h2>
                <p className="text-neutral-900/45 text-sm font-medium">Selecciona la sucursal donde recogerás tu pedido.</p>
              </div>

              {/* Map */}
              <div className="px-6 pb-4">
                <SatelliteMapMock selectedStore={selectedStore} onSelect={setSelectedStore} />
              </div>

              {/* Store list */}
              <div className="px-6 pb-6 flex flex-col gap-3">
                {STORES.map((store) => {
                  const isSelected = selectedStore === store.id;
                  return (
                    <button
                      key={store.id}
                      onClick={() => store.open && setSelectedStore(store.id)}
                      disabled={!store.open}
                      className="flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-200"
                      style={{
                        backgroundColor: isSelected ? "rgba(227,24,55,0.08)" : "rgba(0,0,0,0.02)",
                        border: `1.5px solid ${isSelected ? "#E31837" : "rgba(0,0,0,0.08)"}`,
                        opacity: store.open ? 1 : 0.45,
                        cursor: store.open ? "pointer" : "not-allowed",
                      }}
                    >
                      {/* Radio */}
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5"
                        style={{ borderColor: isSelected ? "#E31837" : "rgba(0,0,0,0.2)" }}
                      >
                        {isSelected && <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#E31837" }} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-black text-neutral-900 text-base" style={{ fontFamily: "var(--font-display)" }}>{store.name}</span>
                          <span
                            className="px-2 py-0.5 rounded-full text-xs font-black"
                            style={{
                              backgroundColor: store.open ? "rgba(5,150,105,0.15)" : "rgba(0,0,0,0.06)",
                              color: store.open ? "#059669" : "rgba(0,0,0,0.35)",
                              fontFamily: "var(--font-display)",
                            }}
                          >
                            {store.open ? "Abierta" : "Cerrada"}
                          </span>
                        </div>
                        <p className="text-neutral-900/50 text-sm font-medium mt-0.5">{store.address}</p>
                        <div className="flex items-center gap-4 mt-2 flex-wrap">
                          <span className="flex items-center gap-1 text-xs font-bold text-neutral-900/45">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                            {store.distance}
                          </span>
                          <span className="flex items-center gap-1 text-xs font-bold" style={{ color: store.open ? "#B45309" : "rgba(0,0,0,0.3)" }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                            {store.open ? `Listo en ${store.wait}` : store.hours}
                          </span>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: "#E31837" }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: order summary + CTA ── */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-36">
          {/* Summary card */}
          <div className="rounded-2xl p-6" style={{ backgroundColor: "#FFFFFF", border: "1.5px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 16px rgba(0,0,0,0.05)" }}>
            <h3 className="text-lg font-black text-neutral-900 mb-4" style={{ fontFamily: "var(--font-display)" }}>Resumen del pedido</h3>
            <div className="flex flex-col gap-3 mb-4">
              {cart.length === 0 ? (
                <p className="text-neutral-900/40 text-sm font-medium">Tu carrito está vacío.</p>
              ) : (
                cart.map((line) => {
                  const customizationLabel = describeCustomization(line.customization);
                  return (
                    <div key={line.id} className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-bold text-neutral-900">
                          {line.quantity > 1 ? `${line.quantity}× ` : ""}
                          {line.name}
                        </p>
                        {customizationLabel && <p className="text-xs text-neutral-900/40 font-medium">{customizationLabel}</p>}
                      </div>
                      <span className="text-sm font-black shrink-0" style={{ color: "#E31837", fontFamily: "var(--font-display)" }}>
                        ${formatPrice(line.unitPrice * line.quantity)}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="flex flex-col gap-2 pt-4" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
              <div className="flex justify-between text-sm text-neutral-900/50 font-medium">
                <span>Subtotal</span><span>${formatPrice(subtotal)} COP</span>
              </div>
              <div className="flex justify-between text-sm font-medium" style={{ color: "#059669" }}>
                <span>Envío</span><span>Gratis</span>
              </div>
              <div className="flex justify-between text-base font-black text-neutral-900 mt-1">
                <span style={{ fontFamily: "var(--font-display)" }}>Total</span>
                <span style={{ color: "#E31837", fontFamily: "var(--font-display)" }}>${formatPrice(subtotal)} COP</span>
              </div>
            </div>
          </div>

          {/* Delivery estimate */}
          {mode === "delivery" && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl" style={{ backgroundColor: "rgba(0,100,145,0.08)", border: "1px solid rgba(0,100,145,0.25)" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#006491" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
              <div>
                <p className="text-xs font-black text-neutral-900/70" style={{ fontFamily: "var(--font-display)" }}>Tiempo estimado de entrega</p>
                <p className="text-sm font-black" style={{ color: "#006491" }}>25 – 35 minutos</p>
              </div>
            </div>
          )}

          {/* CTA — always visually active */}
          <button
            onClick={handleSubmit}
            className="w-full py-4 rounded-xl font-black text-lg text-white transition-all duration-150 hover:brightness-110 active:scale-[0.98]"
            style={{
              backgroundColor: "#E31837",
              fontFamily: "var(--font-display)",
              boxShadow: "0 4px 24px rgba(227,24,55,0.5)",
            }}
          >
            {mode === "delivery" ? "Continuar al pago →" : `Recoger en ${STORES.find((s) => s.id === selectedStore)?.name.replace("Domino's ", "") ?? "tienda"} →`}
          </button>

          <p className="text-center text-xs text-neutral-900/40 font-medium">
            Al continuar aceptas nuestros{" "}
            <a href="#" className="underline hover:text-neutral-900/50">Términos de servicio</a>
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── App root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [view, setView] = useState<View>("home");
  const [customizingItemId, setCustomizingItemId] = useState<number | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [loggedInEmail, setLoggedInEmail] = useState<string | null>(null);
  const [showAddedToast, setShowAddedToast] = useState(false);

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
    setShowAddedToast(true);
  }

  function addCustomPizza(line: CartLine) {
    setCart((prev) => [...prev, line]);
    setShowAddedToast(true);
  }

  function incrementLine(lineId: string) {
    setCart((prev) => prev.map((l) => (l.id === lineId ? { ...l, quantity: l.quantity + 1 } : l)));
  }

  function decrementLine(lineId: string) {
    setCart((prev) =>
      prev.flatMap((l) => {
        if (l.id !== lineId) return [l];
        return l.quantity > 1 ? [{ ...l, quantity: l.quantity - 1 }] : [];
      })
    );
  }

  function removeLine(lineId: string) {
    setCart((prev) => prev.filter((l) => l.id !== lineId));
  }

  const customizingPizza = customizingItemId !== null ? MENU_ITEMS.find((i) => i.id === customizingItemId) ?? null : null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#FFFFFF" }}>
      <Header
        cartCount={cartCount}
        activeView={view}
        onNav={setView}
        isLoggedIn={loggedInEmail !== null}
        onAccountClick={() => (loggedInEmail !== null ? setLoggedInEmail(null) : setIsLoginOpen(true))}
        onCartClick={() => setIsCartOpen(true)}
      />
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
      {isCartOpen && (
        <CartDrawer
          cart={cart}
          onClose={() => setIsCartOpen(false)}
          onIncrement={incrementLine}
          onDecrement={decrementLine}
          onRemove={removeLine}
          onCheckout={() => {
            setIsCartOpen(false);
            setView("address");
          }}
          onBrowseMenu={() => {
            setIsCartOpen(false);
            setView("menu");
          }}
        />
      )}
      {isLoginOpen && (
        <LoginModal
          onClose={() => setIsLoginOpen(false)}
          onLogin={(email) => {
            setLoggedInEmail(email);
            setIsLoginOpen(false);
          }}
          onGuest={() => setIsLoginOpen(false)}
        />
      )}
      {showAddedToast && (
        <AddedToCartToast
          onViewCart={() => {
            setShowAddedToast(false);
            setIsCartOpen(true);
          }}
          onDismiss={() => setShowAddedToast(false)}
        />
      )}
    </div>
  );
}
