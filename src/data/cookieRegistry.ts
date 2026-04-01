export type CookieCategory = "essential" | "functional" | "analytics" | "marketing";

export interface CookieRegistryEntry {
  category: CookieCategory;
  provider: string;
  cookieName: string;
  purpose: string;
  legalBasis: string;
  retention: string;
}

export const cookieRegistry: CookieRegistryEntry[] = [
  {
    category: "essential",
    provider: "Procon Itumbiara",
    cookieName: "cookie_consent",
    purpose: "Armazena as preferências de consentimento do usuário.",
    legalBasis: "Legítimo interesse para gestão da preferência de privacidade.",
    retention: "12 meses",
  },
  {
    category: "essential",
    provider: "Procon Itumbiara",
    cookieName: "cookie_consent_audit",
    purpose: "Registra histórico local de mudanças de consentimento para auditoria.",
    legalBasis: "Legítimo interesse e prestação de contas.",
    retention: "Até 50 eventos locais",
  },
  {
    category: "analytics",
    provider: "Google Analytics (futuro)",
    cookieName: "_ga, _ga_*",
    purpose: "Mede tráfego, sessões e desempenho de páginas.",
    legalBasis: "Consentimento do titular.",
    retention: "Conforme configuração da conta GA",
  },
  {
    category: "analytics",
    provider: "Google Tag Manager (futuro)",
    cookieName: "_gid, _gat (dependente de tags)",
    purpose: "Gerencia disparo de tags de mensuração e eventos.",
    legalBasis: "Consentimento do titular.",
    retention: "Conforme configuração das tags",
  },
  {
    category: "marketing",
    provider: "Meta Pixel (futuro)",
    cookieName: "_fbp, fr",
    purpose: "Mede campanhas e auxilia em remarketing.",
    legalBasis: "Consentimento do titular.",
    retention: "Conforme política da Meta",
  },
];

