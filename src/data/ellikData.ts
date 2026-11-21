export type Locale = "es" | "en";

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

export const RUBRO_COPY: Record<
  BusinessCategory,
  Record<Locale, { cardLabel: string; whatsappLabel: string }>
> = {
  "Local Gastronómico": {
    es: { cardLabel: "Gastronomía", whatsappLabel: "Local Gastronómico" },
    en: { cardLabel: "Hospitality", whatsappLabel: "Food & Hospitality" },
  },
  "Tienda de Ropa": {
    es: { cardLabel: "Indumentaria", whatsappLabel: "Tienda de Ropa" },
    en: { cardLabel: "Apparel", whatsappLabel: "Apparel & Retail" },
  },
  "Institución / Otro": {
    es: { cardLabel: "A medida", whatsappLabel: "Institución / Otro" },
    en: { cardLabel: "Custom", whatsappLabel: "Custom / Institution" },
  },
};

export const ELLIK_CONFIG = {
  brandName: "ELLIK",
  whatsappNumber: "5493571345390",
  linkedinUrl: "https://www.linkedin.com/in/juan-manuel-risolo-luconi-4003572aa",
  email: "manurluconi@gmail.com",
} as const;

export const NAV_SECTIONS: NavSection[] = [
  { id: "inicio", label: "Index" },
  { id: "problema", label: "El problema" },
  { id: "proyectos", label: "Obra (04)" },
  { id: "servicios", label: "Qué hago" },
  { id: "contacto", label: "Contacto" },
];

export const NAV_SECTIONS_BY_LOCALE: Record<Locale, NavSection[]> = {
  es: [
    { id: "inicio", label: "Inicio" },
    { id: "problema", label: "El problema" },
    { id: "proyectos", label: "Obra" },
    { id: "servicios", label: "Qué hago" },
    { id: "contacto", label: "Contacto" },
  ],
  en: [
    { id: "inicio", label: "Home" },
    { id: "problema", label: "The Problem" },
    { id: "proyectos", label: "Work" },
    { id: "servicios", label: "Services" },
    { id: "contacto", label: "Contact" },
  ],
};

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
    category: "Gastronomía — Miami",
    title: "Mojo Grille",
    location: "Miami, FL",
    description:
      "Web interactiva para restaurante cubano. El plato se desarma al scrollear y el cliente envía el pedido listo al WhatsApp del local, sin comisiones.",
    highlight: "Pedidos armados a WhatsApp",
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
    category: "E-Commerce — Buenos Aires",
    title: "Dopamine Streetwear",
    location: "Buenos Aires, AR",
    description:
      "Tienda de ropa urbana con selector de talles directo en el catálogo, descuento automático por transferencia y bolsa lateral sin recargas.",
    highlight: "Compra móvil en 2 toques",
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
    category: "Guía Michelin — Miami",
    title: "Lung Yai Thai Tapas",
    location: "Calle Ocho, Miami",
    description:
      "Sitio oficial y carta digital para restaurante tailandés en Calle Ocho, pensada para abrir al instante desde Instagram sin PDFs pesados.",
    highlight: "Carta bilingüe instantánea",
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
    category: "Institucional — Río Tercero",
    title: "Capital Nacional del Deportista",
    location: "Río Tercero, Córdoba",
    description:
      "Portal interactivo creado para la Municipalidad de Río Tercero, con buscador en vivo por disciplina, fichas de atletas olímpicos y archivo deportivo.",
    highlight: "Desarrollo oficial municipal",
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

export const MISSIONS_BY_LOCALE: Record<Locale, Mission[]> = {
  es: MISSIONS,
  en: [
    {
      id: "mojo-grille",
      index: "01",
      shortTitle: "Mojo Grille",
      category: "Hospitality — Miami",
      title: "Mojo Grille",
      location: "Miami, FL",
      description:
        "Interactive site for a Cuban restaurant. The dish disassembles on scroll and guests send a complete order straight to WhatsApp—zero commission fees.",
      highlight: "WhatsApp order builder",
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
      category: "E-Commerce — Buenos Aires",
      title: "Dopamine Streetwear",
      location: "Buenos Aires, AR",
      description:
        "Streetwear storefront with instant size selection inside the catalog, automatic bank-transfer discounts, and a slide-out cart with zero page reloads.",
      highlight: "2-tap mobile checkout",
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
      category: "Michelin Guide — Miami",
      title: "Lung Yai Thai Tapas",
      location: "Calle Ocho, Miami",
      description:
        "Official site and digital menu for a Thai restaurant on Calle Ocho, built to open straight from Instagram with no heavy PDF files.",
      highlight: "Instant bilingual menu",
      liveUrl: "https://lungyai.vercel.app/",
      displayDomain: "lungyai.vercel.app",
      previewImage: "/previews/lungyai-desktop.webp",
      secondaryImage: "/previews/lungyai-mobile.webp",
      fallbackVariant: "gastro-2",
    },
    {
      id: "deportistas-rio3",
      index: "04",
      shortTitle: "Sports Capital Portal",
      category: "Institutional — Río Tercero",
      title: "National Sports Capital",
      location: "Río Tercero, Córdoba",
      description:
        "Interactive portal built for the City of Río Tercero, featuring live discipline search, Olympic athlete profiles, and a municipal sports archive.",
      highlight: "Official municipal portal",
      liveUrl: "https://deportistasrio3.vercel.app/",
      displayDomain: "deportistasrio3.vercel.app",
      previewImage: "/previews/rio3-desktop.webp",
      secondaryImage: "/previews/rio3-mobile.webp",
      fallbackVariant: "municipal",
    },
  ],
};

export const INVESTMENT_PLANS_BY_LOCALE: Record<Locale, InvestmentPlan[]> = {
  es: INVESTMENT_PLANS,
  en: [
    {
      code: "01",
      title: "Ordering Web & Digital Menu",
      fullTitle: "Ordering Web & Digital Menu",
      description:
        "For restaurants and food spots that want structured orders arriving on WhatsApp with zero mistakes or delays.",
      scopeItems: [
        "Interactive menu built to load fast on mobile",
        "Automatic order builder straight to WhatsApp",
        "Zero sales commissions or third-party platforms",
      ],
      defaultRubro: "Local Gastronómico",
    },
    {
      code: "02",
      title: "Catalog & Online Store",
      fullTitle: "Catalog & Online Store",
      description:
        "For apparel brands and retail shops that need clear sizing, live stock, and direct mobile sales.",
      scopeItems: [
        "Instant size and category filters without page reloads",
        "Automatic discount calculation and slide-out cart",
        "Straightforward stock and pricing updates",
      ],
      defaultRubro: "Tienda de Ropa",
    },
    {
      code: "03",
      title: "Custom Web Development",
      fullTitle: "Custom Web Development",
      description:
        "Institutional sites, portals, and bespoke web projects coded from scratch with tailored motion.",
      scopeItems: [
        "Custom institutional or multi-section architecture",
        "Directories, live search, and custom integrations",
        "Clean production code and direct developer support",
      ],
      defaultRubro: "Institución / Otro",
    },
  ],
};
