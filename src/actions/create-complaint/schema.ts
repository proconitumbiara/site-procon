import { z } from "zod";

function standardizeFullName(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) =>
      word.length > 0
        ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
        : "",
    )
    .filter(Boolean)
    .join(" ");
}

function emptyStringToUndefined(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
}

function digitsOnlyOrUndefined(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const digits = value.replace(/\D/g, "");
  return digits.length ? digits : undefined;
}

const EvidenceTypeEnumValues = ["documental", "photos_video", "none"] as const;
export const evidenceTypeEnum = z.enum(EvidenceTypeEnumValues);

const optionalTrimmedString = z
  .preprocess(emptyStringToUndefined, z.string())
  .optional();

const optionalDigitsString = z
  .preprocess(digitsOnlyOrUndefined, z.string())
  .optional();

const optionalStandardizedName = z
  .preprocess(
    (value) => {
      if (typeof value !== "string") return undefined;
      const normalized = standardizeFullName(value);
      return normalized.length ? normalized : undefined;
    },
    z.string(),
  )
  .optional();

const cpfSchema = optionalDigitsString.refine(
  (value) => value == null || value.length === 11,
  { message: "Informe um CPF válido (11 dígitos)." },
);

const phoneSchema = optionalDigitsString.refine(
  (value) => value == null || value.length === 11,
  { message: "Informe um telefone válido (11 dígitos)." },
);

const zipCodeSchema = optionalDigitsString.refine(
  (value) => value == null || value.length === 8,
  { message: "Informe um CEP válido (8 dígitos)." },
);

const requiredZipCodeSchema = z
  .string()
  .trim()
  .min(1, "Informe o CEP.")
  .transform((value) => value.replace(/\D/g, ""))
  .refine((value) => value.length === 8, "Informe um CEP válido (8 dígitos).");

const cnpjSchema = optionalDigitsString.refine(
  (value) => value == null || value.length === 14,
  { message: "Informe um CNPJ válido (14 dígitos)." },
);

export const createComplaintSchema = z
  .object({
    // Seção 1 - Solicitação Anônima
    isAnonymous: z.boolean(),

    // Seção 2 - Qualificação do Denunciante (Consumidor)
    complainantName: optionalStandardizedName,
    complainantProfession: optionalTrimmedString,
    complainantCpf: cpfSchema,
    complainantPhone: phoneSchema,
    complainantEmail: z.preprocess(
      emptyStringToUndefined,
      z.string().email("Informe um e-mail válido."),
    ).optional(),
    complainantAddress: optionalTrimmedString,
    complainantZipCode: zipCodeSchema,

    // Seção 3 - Qualificação do Denunciado (Fornecedor)
    respondentCompanyName: z
      .string()
      .trim()
      .min(1, "Razão Social/Nome Fantasia é obrigatório."),
    respondentCnpj: cnpjSchema.optional(),
    respondentAddress: z
      .string()
      .trim()
      .min(10, "Endereço do denunciado é obrigatório."),
    respondentZipCode: requiredZipCodeSchema,
    respondentAdditionalInfo: optionalTrimmedString,

    // Seção 4 - Relato dos Fatos
    factsDescription: z
      .string()
      .trim()
      .min(20, "O relato dos fatos é obrigatório e deve ter mais detalhes."),

    // Seção 5 - Do Pedido
    request: z
      .string()
      .trim()
      .min(10, "O pedido é obrigatório."),

    // Seção 6 - Meios de Prova
    evidenceType: evidenceTypeEnum,

    // Metadados (conforme PDF)
    filingDate: z
      .string()
      .trim()
      .min(1, "Informe a data da solicitação.")
      .refine(
        (value) => {
          const time = Date.parse(value);
          return !Number.isNaN(time);
        },
        "Informe uma data válida.",
      ),
  })
  .superRefine((data, ctx) => {
    if (data.isAnonymous) return;

    // Se não for anônimo, exigimos todos os dados da seção 2.
    if (!data.complainantName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["complainantName"],
        message: "Informe o nome completo.",
      });
    }
    if (!data.complainantProfession) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["complainantProfession"],
        message: "Informe a profissão.",
      });
    }
    if (!data.complainantCpf) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["complainantCpf"],
        message: "Informe o CPF.",
      });
    }
    if (!data.complainantPhone) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["complainantPhone"],
        message: "Informe o telefone.",
      });
    }
    if (!data.complainantEmail) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["complainantEmail"],
        message: "Informe o e-mail.",
      });
    }
    if (!data.complainantAddress) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["complainantAddress"],
        message: "Informe o endereço.",
      });
    }
    if (!data.complainantZipCode) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["complainantZipCode"],
        message: "Informe o CEP.",
      });
    }
  });

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;

