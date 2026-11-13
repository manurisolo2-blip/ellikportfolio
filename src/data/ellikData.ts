export interface NavSection {
  id: string;
  code: string;
  label: string;
}

export interface PainPoint {
  code: string;
  signal: string;
  text: string;
}

export interface SystemPillar {
  code: string;
  title: string;
  description: string;
  telemetry: string;
}

export interface MissionPreviewItem {
  name: string;
  detail: string;
  priceOrStatus: string;
  tag?: string;
}

export interface Mission {
  code: string;
  category: string;
  title: string;
  problemSolved: string;
  metric: string;
  liveUrl: string;
  accentTag: string;
  domainDisplay: string;
  previewMode: "gastronomy-order" | "gastronomy-menu" | "apparel-catalog" | "institutional-portal";
  previewHeadline: string;
  previewSubline: string;
  previewItems: MissionPreviewItem[];
  previewActionLabel: string;
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
  tagline: "SISTEMA DE DISEÑO & INGENIERÍA WEB",
  whatsappNumber: "5493571000000", // Reemplazar por número real con código de país sin +
  instagramUrl: "https://instagram.com/ellik.web",
  email: "hola@ellik.com.ar",
  coordinates: "32°10'S 64°06'W // OPERANDO REMOTO",
} as const;

export const NAV_SECTIONS: NavSection[] = [
  { id: "orbita", code: "01", label: "ÓRBITA" },
  { id: "friccion", code: "02", label: "FRICCIÓN" },
  { id: "sistema", code: "03", label: "SISTEMA" },
  { id: "misiones", code: "04", label: "MISIONES" },
  { id: "inversion", code: "05", label: "INVERSIÓN" },
  { id: "despegue", code: "06", label: "DESPEGUE" },
];

export const PAIN_POINTS: PainPoint[] = [
  {
    code: "01",
    signal: "SATURACIÓN OPERATIVA",
    text: "Viernes a la noche con el WhatsApp colapsado de audios y pedidos anotados con errores.",
  },
  {
    code: "02",
    signal: "CAÍDA DE CONVERSIÓN",
    text: "Clientes que piden la carta, precios o talles por Instagram y se enfrían esperando respuesta.",
  },
  {
    code: "03",
    signal: "MARGEN CEDIDO",
    text: "Pagar comisiones altas en apps de delivery por clientes que ya conocen tu marca.",
  },
  {
    code: "04",
    signal: "FUGA MÓVIL",
    text: "Páginas lentas o desactualizadas que se ven bien en computadora pero pierden ventas en el celular.",
  },
];

export const SYSTEM_PILLARS: SystemPillar[] = [
  {
    code: "SYS.01",
    title: "VELOCIDAD MÓVIL",
    description:
      "Carga sub-segundo en redes 4G/5G para que ningún cliente abandone antes de ver tus productos.",
    telemetry: "FCP < 0.8S // CERO LIBRERÍAS 3D PESADAS",
  },
  {
    code: "SYS.02",
    title: "AUTOGESTIÓN DE PEDIDO",
    description:
      "El cliente arma su carrito o consulta de talles solo y te llega un mensaje estructurado listo para confirmar.",
    telemetry: "WHATSAPP PAYLOAD // FORMATO LIMPIO",
  },
  {
    code: "SYS.03",
    title: "CERO INTERMEDIARIOS",
    description:
      "Sin comisiones por venta ni plantillas pesadas. Código limpio a medida listo para escalar.",
    telemetry: "0% COMISIÓN // ARQUITECTURA PROPIA",
  },
];

export const MISSIONS: Mission[] = [
  {
    code: "MISIÓN 01",
    category: "GASTRONOMÍA // PEDIDOS DIRECTOS",
    title: "Sistema de Pedidos Gastronómico I",
    problemSolved:
      "Eliminación de demoras y errores de toma de pedido en horas pico mediante carta interactiva conectada a WhatsApp Business.",
    metric: "Pedido armado en < 45 seg",
    liveUrl: "https://ejemplo-comida-1.vercel.app",
    accentTag: "MOBILE-FIRST + WHATSAPP CHECKOUT",
    domainDisplay: "pedidos.local-gastro-01.ar",
    previewMode: "gastronomy-order",
    previewHeadline: "DOBLE SMASH + PAPAS CHEDDAR",
    previewSubline: "SIN DEMORAS DE AUDIO • ENVÍO EN 30 MIN",
    previewItems: [
      {
        name: "DOBLE CUARTO CLÁSICA",
        detail: "Medallón 220g + cheddar + cebolla grillada",
        priceOrStatus: "$ 11.400",
        tag: "TOP",
      },
      {
        name: "PAPAS RÚSTICAS C/ BACON",
        detail: "Porción individual + salsa alioli",
        priceOrStatus: "$ 5.200",
      },
      {
        name: "COMBO NOCHE X2",
        detail: "2 burgers + 2 bebidas + papas grandes",
        priceOrStatus: "$ 24.800",
      },
    ],
    previewActionLabel: "ENVIAR PEDIDO POR WHATSAPP ($ 16.600) →",
  },
  {
    code: "MISIÓN 02",
    category: "GASTRONOMÍA // CATÁLOGO EXPRESS",
    title: "Plataforma Gastronómica II",
    problemSolved:
      "Presentación visual de menú de alta rotación optimizada para conversión inmediata desde enlaces de Instagram.",
    metric: "0% comisiones por pedido",
    liveUrl: "https://ejemplo-comida-2.vercel.app",
    accentTag: "ALTA CONVERSIÓN EN HORA PICO",
    domainDisplay: "carta.cocina-urbana.ar",
    previewMode: "gastronomy-menu",
    previewHeadline: "CARTA ACTIVA • TURNO NOCHE",
    previewSubline: "ENTRADA DESDE BIO DE INSTAGRAM • 4G READY",
    previewItems: [
      {
        name: "PIZZA NAPOLETANA MASSA MADRE",
        detail: "Fermentación 48h + mozzarella fior di latte",
        priceOrStatus: "$ 14.500",
        tag: "EN STOCK",
      },
      {
        name: "FUGAZZETA RELLENA CHICA",
        detail: "Cebolla morada + queso provolone estacionado",
        priceOrStatus: "$ 15.900",
      },
      {
        name: "EMPANADAS ARTESANALES X6",
        detail: "Carne cortada a cuchillo / jamón y queso",
        priceOrStatus: "$ 9.600",
      },
    ],
    previewActionLabel: "CONFIRMAR RETIRO EN LOCAL →",
  },
  {
    code: "MISIÓN 03",
    category: "INDUMENTARIA // E-COMMERCE",
    title: "Catálogo Digital de Indumentaria",
    problemSolved:
      "Exploración fluida de prendas por categoría con selector rápido de talles y consulta directa de disponibilidad.",
    metric: "UX optimizada para pantallas táctiles",
    liveUrl: "https://ejemplo-ropa.vercel.app",
    accentTag: "CATÁLOGO VISUAL + TALLES",
    domainDisplay: "tienda.indumentaria-drop.ar",
    previewMode: "apparel-catalog",
    previewHeadline: "DROP OTOÑO // PRENDAS EN STOCK",
    previewSubline: "FILTRO INSTANTÁNEO DE TALLES • SIN REGISTRO",
    previewItems: [
      {
        name: "BUZO OVERSIZE HEAVY 420G",
        detail: "Algodón peinado • Negro carbón",
        priceOrStatus: "S / M / L / XL",
        tag: "DISPONIBLE",
      },
      {
        name: "PANTALÓN CARGO RIPSTOP",
        detail: "Corte relajado • Talle 38 al 46",
        priceOrStatus: "40 / 42 / 44",
      },
      {
        name: "REMERA BOXY FIT",
        detail: "Jersey 24/1 • Blanco hueso",
        priceOrStatus: "M / L",
      },
    ],
    previewActionLabel: "CONSULTAR DISPONIBILIDAD POR TALLE →",
  },
  {
    code: "MISIÓN 04",
    category: "INSTITUCIONAL // SECTOR PÚBLICO",
    title: "Desarrollo Web Municipal",
    problemSolved:
      "Arquitectura de información clara, accesible y de alto estándar técnico desarrollada para gestión municipal.",
    metric: "Estándar institucional validado",
    liveUrl: "https://ejemplo-municipalidad.vercel.app",
    accentTag: "ARQUITECTURA & ACCESIBILIDAD",
    domainDisplay: "portal.gestion-municipal.gob.ar",
    previewMode: "institutional-portal",
    previewHeadline: "PORTAL DE GESTIÓN & TRÁMITES",
    previewSubline: "ACCESO RÁPIDO CIUDADANO • NORMA WCAG AA",
    previewItems: [
      {
        name: "GUÍA DE TRÁMITES Y HABILITACIONES",
        detail: "Turnos online y requisitos descargables",
        priceOrStatus: "ACTIVO 24/7",
        tag: "PÚBLICO",
      },
      {
        name: "BOLETÍN OFICIAL Y TRANSPARENCIA",
        detail: "Ordenanzas indexadas por fecha y área",
        priceOrStatus: "ACTUALIZADO",
      },
      {
        name: "ATENCIÓN VECINAL DIRECTA",
        detail: "Derivación por área de gestión",
        priceOrStatus: "OPERATIVO",
      },
    ],
    previewActionLabel: "EXPLORAR PORTAL INSTITUCIONAL →",
  },
];

export const INVESTMENT_PLANS: InvestmentPlan[] = [
  {
    code: "ORBIT-01",
    title: "CARTA & LANDING EXPRESS",
    fullTitle: "ORBIT-01 // CARTA & LANDING EXPRESS",
    description:
      "Ideal para locales gastronómicos y servicios que necesitan recibir pedidos o consultas hoy mismo.",
    scopeItems: [
      "Carta o grilla de servicios interactiva mobile-first",
      "Armado automático de pedido hacia WhatsApp Business",
      "Velocidad optimizada para enlaces desde Instagram",
    ],
    defaultRubro: "Local Gastronómico",
  },
  {
    code: "ORBIT-02",
    title: "CATÁLOGO COMERCIAL",
    fullTitle: "ORBIT-02 // CATÁLOGO COMERCIAL",
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
    code: "ORBIT-03",
    title: "SISTEMA A MEDIDA",
    fullTitle: "ORBIT-03 // SISTEMA A MEDIDA",
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
