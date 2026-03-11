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

export const upsertFormSchema = z.object({
  id: z.string().uuid().optional(),
  name: z
    .string()
    .trim()
    .min(1, { message: "O nome do formulário é obrigatório." }),
  slug: z
    .string()
    .trim()
    .min(1, { message: "O slug do formulário é obrigatório." }),
  isActive: z.boolean(),
  projectId: z.string().uuid({ message: "O projeto é obrigatório." }),
});

export type UpsertFormInput = z.infer<typeof upsertFormSchema>;
