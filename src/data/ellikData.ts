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
  shortTitle: string;
  category: string;
  title: string;
  problemSolved: string;
  metric: string;
  liveUrl: string;
  domainDisplay: string;
  /** Ruta de captura real en public/proyectos/. Al guardar las 4 capturas allí, se muestran automáticamente en la órbita 3D del Hero y en Proyectos. */
  previewImage: string;
  fallbackVariant: "gastro-1" | "gastro-2" | "ropa" | "municipal";
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

// Al guardar tus 4 capturas reales dentro de public/proyectos/
// (gastro-1.jpg, gastro-2.jpg, ropa.jpg, municipalidad.jpg),
// aparecerán automáticamente tanto en la órbita 3D del Hero como en Proyectos.
export const MISSIONS: Mission[] = [
  {
    id: "proyecto-01",
    shortTitle: "Gastronomía I",
    category: "GASTRONOMÍA · PEDIDOS DIRECTOS",
    title: "Sistema de Pedidos Gastronómico I",
    problemSolved:
      "Eliminación de demoras y errores de toma de pedido en horas pico mediante carta interactiva conectada a WhatsApp Business.",
    metric: "Pedido armado en menos de 45 segundos",
    liveUrl: "https://ejemplo-comida-1.vercel.app",
    domainDisplay: "pedidos.local-gastro-01.ar",
    previewImage: "/proyectos/gastro-1.jpg",
    fallbackVariant: "gastro-1",
  },
  {
    id: "proyecto-02",
    shortTitle: "Gastronomía II",
    category: "GASTRONOMÍA · CATÁLOGO EXPRESS",
    title: "Plataforma Gastronómica II",
    problemSolved:
      "Presentación visual de menú de alta rotación optimizada para conversión inmediata desde enlaces de Instagram.",
    metric: "Cero comisiones por pedido",
    liveUrl: "https://ejemplo-comida-2.vercel.app",
    domainDisplay: "carta.cocina-urbana.ar",
    previewImage: "/proyectos/gastro-2.jpg",
    fallbackVariant: "gastro-2",
  },
  {
    id: "proyecto-03",
    shortTitle: "Indumentaria",
    category: "INDUMENTARIA · CATÁLOGO DIGITAL",
    title: "Catálogo Digital de Indumentaria",
    problemSolved:
      "Exploración fluida de prendas por categoría con selector rápido de talles y consulta directa de disponibilidad.",
    metric: "Experiencia optimizada para pantallas táctiles",
    liveUrl: "https://ejemplo-ropa.vercel.app",
    domainDisplay: "tienda.indumentaria-drop.ar",
    previewImage: "/proyectos/ropa.jpg",
    fallbackVariant: "ropa",
  },
  {
    id: "proyecto-04",
    shortTitle: "Municipalidad",
    category: "INSTITUCIONAL · SECTOR PÚBLICO",
    title: "Desarrollo Web Municipal",
    problemSolved:
      "Arquitectura de información clara, accesible y de alto estándar técnico desarrollada para gestión municipal.",
    metric: "Estándar institucional validado",
    liveUrl: "https://ejemplo-municipalidad.vercel.app",
    domainDisplay: "portal.gestion-municipal.gob.ar",
    previewImage: "/proyectos/municipalidad.jpg",
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
