import { z } from "zod";

export const ErrorTypes = {
  UNAUTHENTICATED: "UNAUTHENTICATED",
  USER_NOT_AUTHORIZED: "USER_NOT_AUTHORIZED",
} as const;

export const ErrorMessages = {
  [ErrorTypes.UNAUTHENTICATED]: "Usuário não autenticado",
  [ErrorTypes.USER_NOT_AUTHORIZED]:
    "Usuário não autorizado a realizar esta ação",
} as const;

export const upsertPriceSearchTypeSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: "O nome do tipo é obrigatório." }),
  periodicity: z
    .string()
    .trim()
    .min(1, { message: "A periodicidade é obrigatória." }),
  isActive: z.boolean().optional(),
});

export type UpsertPriceSearchTypeInput = z.infer<
  typeof upsertPriceSearchTypeSchema
>;
