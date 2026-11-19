export interface NavSection {
  id: string;
  label: string;
}

export interface PainPoint {
  code: string;
  text: string;
}

export interface SystemPillar {
  code: string;
  title: string;
  description: string;
}

export interface Mission {
  id: string;
  index: string;
  shortTitle: string;
  category: string;
  title: string;
  location: string;
  description: string;
  highlight: string;
  liveUrl: string;
  displayDomain: string;
  previewImage: string;
  secondaryImage: string;
  fallbackVariant?: "gastro-1" | "gastro-2" | "ropa" | "municipal";
}

export interface InvestmentPlan {
  code: string;
  title: string;
  fullTitle: string;
  description: string;
  scopeItems: string[];
  defaultRubro: BusinessCategory;
}

export const BUSINESS_CATEGORIES = [
  "Local Gastronómico",
  "Tienda de Ropa",
  "Institución / Otro",
] as const;

export type BusinessCategory = (typeof BUSINESS_CATEGORIES)[number];

export const ELLIK_CONFIG = {
  brandName: "ELLIK",
  whatsappNumber: "5493571000000", // Reemplazar por número real con código de país sin +
  instagramUrl: "https://instagram.com/ellik.web",
  email: "hola@ellik.com.ar",
} as const;

export const NAV_SECTIONS: NavSection[] = [
  { id: "inicio", label: "Index" },
  { id: "proyectos", label: "Obra (04)" },
  { id: "servicios", label: "Qué hago" },
  { id: "contacto", label: "Contacto" },
];

export const PAIN_POINTS: PainPoint[] = [
  {
    code: "01",
    text: "Viernes a la noche con el WhatsApp colapsado de audios y pedidos anotados con errores.",
  },
  {
    code: "02",
    text: "Clientes que piden la carta, precios o talles por Instagram y se enfrían esperando respuesta.",
  },
  {
    code: "03",
    text: "Pagar comisiones altas en apps de delivery por clientes que ya conocen tu marca.",
  },
  {
    code: "04",
    text: "Páginas lentas o desactualizadas que se ven bien en computadora pero pierden ventas en el celular.",
  },
];

export const SYSTEM_PILLARS: SystemPillar[] = [
  {
    code: "01",
    title: "VELOCIDAD MÓVIL",
    description:
      "Carga inmediata en redes móviles para que ningún cliente abandone antes de ver tus productos.",
  },
  {
    code: "02",
    title: "AUTOGESTIÓN DE PEDIDO",
    description:
      "El cliente arma su carrito o consulta de talles solo y te llega un mensaje estructurado listo para confirmar.",
  },
  {
    code: "03",
    title: "CERO INTERMEDIARIOS",
    description:
      "Sin comisiones por venta ni plantillas pesadas. Código limpio a medida listo para escalar.",
  },
];

export const MISSIONS: Mission[] = [
  {
    id: "mojo-grille",
    index: "01",
    shortTitle: "Mojo Grille",
    category: "Gastronomía, Miami",
    title: "Mojo Grille",
    location: "Miami, FL",
    description:
      "Web interactiva para restaurante cubano en Miami. El plato principal se desarma al hacer scroll y el cliente manda el pedido armado directo al WhatsApp del local.",
    highlight: "Pedidos por WhatsApp sin pagar comisiones",
    liveUrl: "https://mojo-grille-demo.vercel.app/",
    displayDomain: "mojo-grille-demo.vercel.app",
    previewImage: "/previews/mojo-desktop.webp",
    secondaryImage: "/previews/mojo-mobile.webp",
    fallbackVariant: "gastro-1",
  },
  {
    id: "dopamine",
    index: "02",
    shortTitle: "Dopamine",
    category: "E-Commerce, Buenos Aires",
    title: "Dopamine Streetwear",
    location: "Buenos Aires, AR",
    description:
      "Tienda online de ropa urbana. Permite elegir el talle directo desde el catálogo, calcula solo el descuento por transferencia y abre la bolsa de compra sin recargar la página.",
    highlight: "Compra rápida en 2 toques desde el celular",
    liveUrl: "https://dopamine-three-omega.vercel.app/",
    displayDomain: "dopamine-three-omega.vercel.app",
    previewImage: "/previews/dopamine-desktop.webp",
    secondaryImage: "/previews/dopamine-mobile.webp",
    fallbackVariant: "ropa",
  },
  {
    id: "lung-yai",
    index: "03",
    shortTitle: "Lung Yai",
    category: "Restaurante, Guía Michelin",
    title: "Lung Yai Thai Tapas",
    location: "Calle Ocho, Miami",
    description:
      "Carta digital bilingüe y sitio oficial para restaurante tailandés en Calle Ocho (Miami). Pensada para abrirse al instante desde Instagram sin bajar PDFs pesados.",
    highlight: "Carga instantánea en móvil + menú bilingüe",
    liveUrl: "https://lungyai.vercel.app/",
    displayDomain: "lungyai.vercel.app",
    previewImage: "/previews/lungyai-desktop.webp",
    secondaryImage: "/previews/lungyai-mobile.webp",
    fallbackVariant: "gastro-2",
  },
  {
    id: "deportistas-rio3",
    index: "04",
    shortTitle: "Capital del Deportista",
    category: "Institucional, Río Tercero",
    title: "Capital Nacional del Deportista",
    location: "Río Tercero, Córdoba",
    description:
      "Archivo histórico y directorio interactivo para la Municipalidad de Río Tercero. Buscador en vivo por deporte, perfiles de atletas olímpicos y recorrido histórico.",
    highlight: "Proyecto oficial para gestión municipal",
    liveUrl: "https://deportistasrio3.vercel.app/",
    displayDomain: "deportistasrio3.vercel.app",
    previewImage: "/previews/rio3-desktop.webp",
    secondaryImage: "/previews/rio3-mobile.webp",
    fallbackVariant: "municipal",
  },
];

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    code: "01",
    title: "Web de Pedidos & Carta Digital",
    fullTitle: "Web de Pedidos & Carta Digital",
    description:
      "Para locales de comida que quieren recibir el pedido ya armado en su WhatsApp sin errores ni demoras.",
    scopeItems: [
      "Carta interactiva pensada para abrir al instante desde el celular",
      "Armado automático del pedido directo a WhatsApp",
      "Sin comisiones por venta ni intermediarios",
    ],
    defaultRubro: "Local Gastronómico",
  },
  {
    code: "02",
    title: "Catálogo & Tienda Online",
    fullTitle: "Catálogo & Tienda Online",
    description:
      "Para marcas de ropa y comercios que necesitan mostrar talles, stock y vender directo desde el teléfono.",
    scopeItems: [
      "Selección de talles y categorías sin recargar la página",
      "Cálculo automático de descuentos y bolsa de compra",
      "Carga simple de stock y precios",
    ],
    defaultRubro: "Tienda de Ropa",
  },
  {
    code: "03",
    title: "Desarrollo Web a Medida",
    fullTitle: "Desarrollo Web a Medida",
    description:
      "Sitios institucionales, portales o ideas especiales programadas desde cero con animaciones propias.",
    scopeItems: [
      "Arquitectura institucional o multi-área a medida",
      "Directorios, buscadores en vivo e integraciones específicas",
      "Código limpio y soporte directo de desarrollador",
    ],
    defaultRubro: "Institución / Otro",
  },
];
