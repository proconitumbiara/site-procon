import "../globals.css";

import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import { ThemeProvider } from "next-themes";

import AccessibilityPanel from "@/components/website/global/AccessibilityPanel";
import Analytics from "@/components/Analytics";
import CookieConsent from "@/components/CookieConsent";
import ForceLightTheme from "@/components/website/global/ForceLightTheme";
import { AccessibilityProvider } from "@/lib/AccessibilityContext";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Procon Itumbiara - Proteção e Defesa do Consumidor",
  description:
    "Site institucional do Procon - Fundação de Proteção e Defesa do Consumidor",
};

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`${montserrat.variable} antialiased`}>
      <ThemeProvider
        attribute="class"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <ForceLightTheme />
        <AccessibilityProvider>
          {/* Skip Link para Acessibilidade */}
          <a href="#main-content" className="skip-link">
            Pular para o conteúdo principal
          </a>
          {children}
          <Analytics />
          <CookieConsent />
          <AccessibilityPanel />
        </AccessibilityProvider>
      </ThemeProvider>
    </div>
  );
}
