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

// Importante: `preprocess` converte `""` para `undefined`.
// Para campos opcionais, precisamos que o schema interno aceite `undefined`,
// senão o Zod tenta validar `undefined` como string e gera erro.
const optionalTrimmedString = z.preprocess(
  emptyStringToUndefined,
  z.string().optional(),
);

const optionalDigitsString = z.preprocess(
  digitsOnlyOrUndefined,
  z.string().optional(),
);

const standardizedNameSchema = z.preprocess((value) => {
  if (typeof value !== "string") return "";
  return standardizeFullName(value);
}, z.string());

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
    complainantName: standardizedNameSchema,
    complainantProfession: optionalTrimmedString,
    complainantCpf: cpfSchema,
    complainantPhone: phoneSchema,
    // Observação: como usamos `preprocess` para converter `""` em `undefined`,
    // o schema interno também precisa aceitar `undefined` (por isso `.optional()` aqui).
    complainantEmail: z.preprocess(
      emptyStringToUndefined,
      z.string().email("Informe um e-mail válido.").optional(),
    ),
    complainantAddress: optionalTrimmedString,
    complainantZipCode: zipCodeSchema,

    // Seção 3 - Qualificação do Denunciado (Fornecedor)
    respondentCompanyName: z
      .string()
      .trim()
      .min(1, "Razão Social/Nome Fantasia é obrigatório."),
    respondentCnpj: cnpjSchema.optional(),
    // A rota externa trata `respondentAddress` como opcional.
    respondentAddress: optionalTrimmedString,
    respondentAdditionalInfo: optionalTrimmedString,

    // Seção 4 - Relato dos Fatos
    factsDescription: z
      .string()
      .trim()
      .min(1, "O relato dos fatos é obrigatório."),

    // Seção 5 - Do Pedido
    request: z.string().trim().min(1, "O pedido é obrigatório."),

    // Seção 6 - Meios de Prova
    // Opcional: quando não enviar, a API define como `none`.
    evidenceType: evidenceTypeEnum.optional(),

    // Metadados (conforme PDF)
    // Opcional: quando não enviar, a API define como Date(now).
    filingDate: z
      .preprocess(
        emptyStringToUndefined,
        z
          .string()
          .trim()
          .min(1, "Informe a data da solicitação.")
          .refine(
            (value) => /^\d{4}-\d{2}-\d{2}$/.test(value),
            "filingDate deve estar no formato YYYY-MM-DD",
          )
          .refine(
            (value) => !Number.isNaN(Date.parse(value)),
            "Informe uma data válida.",
          ),
      )
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Regras condicionais:
    // - Se NÃO for anônimo, exigimos os dados mínimos do denunciante.
    // - Se for anônimo, nenhum dado do denunciante é obrigatório.
    if (!data.isAnonymous) {
      if (!data.complainantName.trim().length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["complainantName"],
          message: "Informe o nome do denunciante.",
        });
      }

      // Observação: `cpfSchema`, `phoneSchema` e `complainantEmail` são opcionais
      // por definição do schema. Aqui forçamos presença apenas quando `isAnonymous=false`.
      if (!data.complainantCpf) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["complainantCpf"],
          message: "Informe o CPF do denunciante.",
        });
      }

      if (!data.complainantPhone) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["complainantPhone"],
          message: "Informe o telefone do denunciante.",
        });
      }

      if (!data.complainantEmail) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["complainantEmail"],
          message: "Informe o e-mail do denunciante.",
        });
      }
    }
  });

export type CreateComplaintInput = z.infer<typeof createComplaintSchema>;
