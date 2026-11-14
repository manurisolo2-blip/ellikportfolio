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
  { id: "inicio", label: "INICIO" },
  { id: "problema", label: "EL PROBLEMA" },
  { id: "solucion", label: "LA SOLUCIÓN" },
  { id: "proyectos", label: "PROYECTOS" },
  { id: "modalidades", label: "MODALIDADES" },
  { id: "contacto", label: "CONTACTO" },
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
    category: "GASTRONOMÍA · EXPERIENCIA INTERACTIVA",
    title: "Mojo Grille Cuban Kitchen",
    location: "Miami, FL",
    description:
      "Experiencia digital inmersiva con deconstrucción interactiva de producto vinculada al scroll, catálogo dinámico de platos a la plancha y flujo de pedidos directo por WhatsApp.",
    highlight: "Scroll-scrollytelling de producto + pedidos directos sin comisiones",
    liveUrl: "https://mojo-grille-demo.vercel.app/",
    displayDomain: "mojo-grille-demo.vercel.app",
    previewImage:
      "https://mojo-grille-demo.vercel.app/assets/mojo-bowl-ropa-vieja.jpg",
    secondaryImage:
      "https://mojo-grille-demo.vercel.app/assets/mojo-cubano.jpg",
    fallbackVariant: "gastro-1",
  },
  {
    id: "dopamine",
    index: "02",
    shortTitle: "Dopamine",
    category: "INDUMENTARIA · E-COMMERCE",
    title: "Dopamine Streetwear",
    location: "Buenos Aires, AR",
    description:
      "Tienda online de indumentaria urbana de edición limitada con selección rápida de talle desde la grilla, cálculo automático de descuento por transferencia y carrito lateral sin recargas.",
    highlight: "Añadido rápido por talle + checkout ágil mobile-first",
    liveUrl: "https://dopamine-three-omega.vercel.app/",
    displayDomain: "dopamine-three-omega.vercel.app",
    previewImage:
      "https://dopamine-three-omega.vercel.app/assets/Branding/hero-bg.jpg",
    secondaryImage:
      "https://dopamine-three-omega.vercel.app/Ropa/Buzos/Buzo%20WIN.webp",
    fallbackVariant: "ropa",
  },
  {
    id: "lung-yai",
    index: "03",
    shortTitle: "Lung Yai",
    category: "GASTRONOMÍA · CARTA EDITORIAL",
    title: "Lung Yai Thai Tapas",
    location: "Calle Ocho, Miami",
    description:
      "Plataforma web y carta digital de lectura ultra rápida para restaurante distinguido por la Guía Michelin (Bib Gourmand), optimizada para tráfico móvil desde redes y pedidos online.",
    highlight: "Arquitectura editorial bilingüe de carga instantánea",
    liveUrl: "https://lungyai.vercel.app/",
    displayDomain: "lungyai.vercel.app",
    previewImage: "https://lungyai.vercel.app/media/wok-flames-poster.webp",
    secondaryImage: "https://lungyai.vercel.app/images/lung-yai-logo.webp",
    fallbackVariant: "gastro-2",
  },
  {
    id: "deportistas-rio3",
    index: "04",
    shortTitle: "Capital del Deportista",
    category: "INSTITUCIONAL · PORTAL HISTÓRICO",
    title: "Río Tercero — Capital Nacional del Deportista",
    location: "Río Tercero, Córdoba",
    description:
      "Portal oficial e interactivo (Ley Nacional N.º 27.378) con directorio filtrable por disciplina, fichas técnicas de atletas olímpicos y campeones mundiales, cronología y dossier cívico.",
    highlight: "Directorio interactivo en tiempo real + estándar de accesibilidad",
    liveUrl: "https://deportistasrio3.vercel.app/",
    displayDomain: "deportistasrio3.vercel.app",
    previewImage:
      "https://deportistasrio3.vercel.app/assets/rio_tercero_hero.webp",
    secondaryImage: "https://deportistasrio3.vercel.app/assets/prigioni.jpg",
    fallbackVariant: "municipal",
  },
];

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    code: "01",
    title: "01 — CARTA & LANDING",
    fullTitle: "01 — CARTA & LANDING",
    description:
      "Ideal para locales gastronómicos y servicios que necesitan recibir pedidos o consultas hoy mismo.",
    scopeItems: [
      "Carta o grilla de servicios interactiva pensada para celular",
      "Armado automático de pedido hacia WhatsApp Business",
      "Carga veloz para tráfico directo desde Instagram",
    ],
    defaultRubro: "Local Gastronómico",
  },
  {
    code: "02",
    title: "02 — CATÁLOGO COMERCIAL",
    fullTitle: "02 — CATÁLOGO COMERCIAL",
    description:
      "Pensado para tiendas de ropa y comercios con múltiples categorías, variantes y carrito directo a WhatsApp.",
    scopeItems: [
      "Categorías dinámicas y selector rápido de talles o variantes",
      "Carrito persistente con resumen listo para cobrar o reservar",
      "Panel simple para actualizar stock y precios sin fricción",
    ],
    defaultRubro: "Tienda de Ropa",
  },
  {
    code: "03",
    title: "03 — DESARROLLO A MEDIDA",
    fullTitle: "03 — DESARROLLO A MEDIDA",
    description:
      "Desarrollos institucionales o plataformas web personalizadas con requerimientos específicos.",
    scopeItems: [
      "Arquitectura de información institucional o multi-área",
      "Integraciones específicas, formularios y accesibilidad",
      "Código limpio documentado y soporte técnico directo",
    ],
    defaultRubro: "Institución / Otro",
  },
];
