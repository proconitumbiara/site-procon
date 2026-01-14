import { z } from "zod";

export const ErrorTypes = {
  TOKEN_REQUIRED: "TOKEN_REQUIRED",
  TOKEN_NOT_FOUND: "TOKEN_NOT_FOUND",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  ACCOUNT_NOT_FOUND: "ACCOUNT_NOT_FOUND",
  RESET_ERROR: "RESET_ERROR",
} as const;

export const ErrorMessages = {
  [ErrorTypes.TOKEN_REQUIRED]: "Token é obrigatório",
  [ErrorTypes.TOKEN_NOT_FOUND]: "Token não encontrado ou inválido",
  [ErrorTypes.TOKEN_EXPIRED]: "Token expirado. Por favor, solicite um novo link",
  [ErrorTypes.USER_NOT_FOUND]: "Usuário não encontrado",
  [ErrorTypes.ACCOUNT_NOT_FOUND]: "Conta não encontrada",
  [ErrorTypes.RESET_ERROR]: "Erro ao redefinir senha",
} as const;

export type ErrorType = keyof typeof ErrorTypes;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token é obrigatório"),
  newPassword: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres"),
});

export type Schema = z.infer<typeof resetPasswordSchema>;
