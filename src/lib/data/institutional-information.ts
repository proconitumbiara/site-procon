export interface CompanyUnit {
  name: string;
  address: string;
  phones: string[];
  mapsEmbedUrl: string;
  mapsLinkUrl: string;
}

export interface CompanySocial {
  instagram?: { url: string; label: string };
  youtube?: { url: string; label: string };
  facebook?: { url: string; label: string };
  podcast?: { url: string; label: string };
}

export interface CompanyData {
  companyName: string;
  cnpj: string;
  phone: string;
  email: string;
  businessHours: string;
  social: CompanySocial;
  units: CompanyUnit[];
}

export const companyData: CompanyData = {
  companyName: "Procon Itumbiara",
  cnpj: "08.242.183/0001-63",
  phone: "(64) 3432-1215",
  email: "procon@itumbiara.go.gov.br",
  businessHours: "Segunda a Sexta: 8h às 18h",
  social: {
    // Exemplo de preenchimento:
    instagram: {
      url: "https://instagram.com/proconitumbiara",
      label: "@proconitumbiara",
    },
    facebook: {
      url: "https://facebook.com/proconitumbiara",
      label: "Procon Itumbiara",
    },
  },
  units: [
    // Exemplo de unidade:
    {
      name: "Itumbiara / GO",
      address: "Av. Porto Nacional, 495 - Centro - Itumbiara - GO - 75528-122",
      phones: ["(64) 3432-1215"],
      mapsEmbedUrl:
        "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3785.7544018613016!2d-49.238357224116825!3d-18.404025582667046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94a10d078313e389%3A0x4768ed2b10fc595e!2sAv.%20Porto%20Nacional%2C%20495%20-%20Planalto%2C%20Itumbiara%20-%20GO%2C%2075533-713!5e0!3m2!1spt-BR!2sbr!4v1774007715868!5m2!1spt-BR!2sbr",
      mapsLinkUrl:
        "https://www.google.com/maps/search/?api=1&query=Av.%20Porto%20Nacional%2C%20495%20-%20Centro%2C%20Itumbiara%20-%20GO%2C%2075528-122",
    },
  ],
};
