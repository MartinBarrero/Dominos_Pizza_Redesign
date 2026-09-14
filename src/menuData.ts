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
    price: 24900,
    tag: "La más pedida",
    category: "Pizzas",
    popular: true,
    img: "https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 2,
    name: "Margarita Suprema",
    desc: "Mozzarella fresca, tomate Roma, albahaca fresca, aceite de oliva extra virgen",
    price: 21900,
    tag: "Favorita del chef",
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 3,
    name: "Cuatro Quesos",
    desc: "Mozzarella, gouda ahumado, parmesano rallado y queso azul sobre base blanca cremosa",
    price: 26900,
    tag: "Nuevo",
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 4,
    name: "BBQ Chicken",
    desc: "Pollo asado en tiras, cebolla morada caramelizada, jalapeño, salsa BBQ ahumada casera",
    price: 25900,
    tag: "Oferta 2×1",
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 5,
    name: "Vegetariana Deluxe",
    desc: "Pimientos asados, champiñones portobello, espinacas, aceitunas negras y queso de cabra",
    price: 23900,
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 6,
    name: "Prosciutto & Rúcula",
    desc: "Prosciutto di Parma, rúcula fresca, queso parmesano en láminas, reducción balsámica",
    price: 28900,
    tag: "Premium",
    category: "Pizzas",
    img: "https://images.unsplash.com/photo-1566843972142-a7fcb70de55a?w=600&h=400&fit=crop&auto=format",
  },
  // Acompañamientos
  {
    id: 7,
    name: "Pan de Ajo",
    desc: "Baguette artesanal tostado con mantequilla de ajo asado, perejil fresco y queso parmesano",
    price: 8900,
    category: "Acompañamientos",
    img: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 8,
    name: "Alitas Buffalo",
    desc: "8 alitas crujientes bañadas en salsa buffalo picante, con aderezo blue cheese",
    price: 14900,
    tag: "Picante",
    category: "Acompañamientos",
    img: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 9,
    name: "Nuggets de Pollo",
    desc: "12 piezas de pollo empanizado con panko japonés, mostaza miel y salsa catsup",
    price: 11900,
    category: "Acompañamientos",
    img: "https://images.unsplash.com/photo-1562967914-608f82629710?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 10,
    name: "Palitos de Mozzarella",
    desc: "6 palitos de mozzarella empanizados y fritos, con salsa marinara casera para botanear",
    price: 9900,
    category: "Acompañamientos",
    img: "https://images.unsplash.com/photo-1573140401552-3fab0b24306f?w=600&h=400&fit=crop&auto=format",
  },
  // Bebidas
  {
    id: 11,
    name: "Limonada Natural",
    desc: "Limonada fresca exprimida al momento con menta, azúcar de caña y hielos triturados",
    price: 5900,
    category: "Bebidas",
    img: "https://images.unsplash.com/photo-1559352473-bb502c92086b?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 12,
    name: "Refresco 600ml",
    desc: "Coca-Cola, Pepsi, Sprite o Fanta. Botella individual bien fría para acompañar tu pizza",
    price: 4900,
    category: "Bebidas",
    img: "https://images.unsplash.com/photo-1583487136420-f2089d1bfc78?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 13,
    name: "Agua Mineral",
    desc: "Agua mineral sin gas 600ml, opción ligera para acompañar cualquier platillo",
    price: 3500,
    category: "Bebidas",
    img: "https://images.unsplash.com/photo-1711154319702-70f9e8c3a90f?w=600&h=400&fit=crop&auto=format",
  },
  // Postres
  {
    id: 14,
    name: "Tiramisú Clásico",
    desc: "Capas de bizcocho de café, mascarpone cremoso y cacao amargo, receta italiana original",
    price: 10900,
    tag: "Artesanal",
    category: "Postres",
    img: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 15,
    name: "Brownie con Helado",
    desc: "Brownie de chocolate semi-amargo tibio con una bola de helado de vainilla premium",
    price: 8900,
    category: "Postres",
    img: "https://images.unsplash.com/photo-1639744211487-b27e3551b07c?w=600&h=400&fit=crop&auto=format",
  },
  {
    id: 16,
    name: "Cheesecake de Fresa",
    desc: "Base de galleta, crema cheese suave, cobertura de fresas frescas con coulis artesanal",
    price: 9900,
    category: "Postres",
    img: "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&h=400&fit=crop&auto=format",
  },
];
