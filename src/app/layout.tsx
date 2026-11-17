import type { Metadata, Viewport } from "next";
import { Instrument_Serif } from "next/font/google";
import { CustomCursor } from "@/components/CustomCursor";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ELLIK — Diseño & Ingeniería Web de Alta Conversión",
  description:
    "Estudio web especializado en páginas rápidas de alta conversión para comercios, gastronomía, indumentaria e instituciones. Pedidos directos sin fricción ni intermediarios.",
  keywords: [
    "diseño web alta conversión",
    "carta digital whatsapp",
    "catálogo online indumentaria",
    "desarrollo web a medida",
    "ELLIK",
  ],
  openGraph: {
    title: "ELLIK — Diseño & Ingeniería Web de Alta Conversión",
    description:
      "Páginas rápidas pensadas para que el cliente elija solo y te llegue el pedido armado por WhatsApp.",
    type: "website",
    locale: "es_AR",
  },
};

export const viewport: Viewport = {
  themeColor: "#050505",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={instrumentSerif.variable}>
      <head>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@500,600,700&f[]=cabinet-grotesk@700,800&f[]=satoshi@400,500,700&f[]=azeret-mono@400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg-void)] text-[var(--text-primary)] antialiased">
        {/* Textura fija de grano espacial (feTurbulence inline, sin peso extra) */}
        <div
          aria-hidden="true"
          className="pointer-events-none fixed inset-0 z-[110] opacity-[0.035]"
        >
          <svg
            className="h-full w-full"
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            height="100%"
          >
            <filter id="ellik-space-grain">
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.82"
                numOctaves="3"
                stitchTiles="stitch"
              />
            </filter>
            <rect
              width="100%"
              height="100%"
              filter="url(#ellik-space-grain)"
            />
          </svg>
        </div>

        <CustomCursor />

        {children}
      </body>
    </html>
  );
}
