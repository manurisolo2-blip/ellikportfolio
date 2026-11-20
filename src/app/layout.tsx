import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/context/LanguageContext";
import { SmoothScroll } from "@/components/SmoothScroll";
import { TabTitleManager } from "@/components/TabTitleManager";
import { TubesCursor } from "@/components/ui/tubes-cursor";
import "./globals.css";

export const metadata: Metadata = {
  title: "ellik",
  description:
    "Estudio web independiente en Córdoba. Cartas digitales con pedidos por WhatsApp, tiendas online para indumentaria y desarrollos a medida.",
  keywords: [
    "diseño web a medida",
    "carta digital whatsapp",
    "tienda online indumentaria",
    "desarrollo web córdoba",
    "ELLIK",
  ],
  openGraph: {
    title: "ellik",
    description:
      "Diseño y desarrollo web a medida — Desde Córdoba para cualquier ciudad.",
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
    <html lang="es">
      <head>
        <link
          rel="preconnect"
          href="https://api.fontshare.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[var(--bg-void)] text-[var(--text-primary)] antialiased">
        <LanguageProvider>
          <TabTitleManager />
          <TubesCursor />

          <SmoothScroll>{children}</SmoothScroll>
        </LanguageProvider>
      </body>
    </html>
  );
}
