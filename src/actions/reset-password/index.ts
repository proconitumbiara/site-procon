"use server";

import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  accountsTable,
  sessionsTable,
  usersTable,
  verificationsTable,
} from "@/db/schema";
import { hashPassword } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, resetPasswordSchema } from "./schema";

export const resetPassword = actionClient
  .schema(resetPasswordSchema)
  .action(async ({ parsedInput }) => {
    try {
      const { token, newPassword } = parsedInput;

      // Buscar token na tabela de verificações
      const verification = await db.query.verificationsTable.findFirst({
        where: eq(verificationsTable.value, token),
      });

      if (!verification) {
        return {
          error: {
            type: ErrorTypes.TOKEN_NOT_FOUND,
            message: ErrorMessages[ErrorTypes.TOKEN_NOT_FOUND],
          },
        };
      }

      // Validar se o token não expirou
      const now = new Date();
      if (verification.expiresAt < now) {
        // Deletar token expirado
        await db
          .delete(verificationsTable)
          .where(eq(verificationsTable.id, verification.id));

        return {
          error: {
            type: ErrorTypes.TOKEN_EXPIRED,
            message: ErrorMessages[ErrorTypes.TOKEN_EXPIRED],
          },
        };
      }

      // Buscar usuário pelo email (identifier)
      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.email, verification.identifier),
      });

      if (!user) {
        return {
          error: {
            type: ErrorTypes.USER_NOT_FOUND,
            message: ErrorMessages[ErrorTypes.USER_NOT_FOUND],
          },
        };
      }

      // Buscar conta do usuário
      const account = await db.query.accountsTable.findFirst({
        where: eq(accountsTable.userId, user.id),
      });

      if (!account) {
        return {
          error: {
            type: ErrorTypes.ACCOUNT_NOT_FOUND,
            message: ErrorMessages[ErrorTypes.ACCOUNT_NOT_FOUND],
          },
        };
      }

      // Usar a função de hash compartilhada do Better Auth
      // Isso garante que o hash seja gerado no formato exato que o Better Auth espera
      const hashedPassword = await hashPassword(newPassword);

      // Atualizar senha na tabela de contas
      await db
        .update(accountsTable)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(eq(accountsTable.id, account.id));

      // Deletar todas as sessões ativas do usuário por segurança
      // Isso força o usuário a fazer login novamente com a nova senha
      await db
        .delete(sessionsTable)
        .where(eq(sessionsTable.userId, user.id));

      // Deletar token usado para evitar reutilização
      await db
        .delete(verificationsTable)
        .where(eq(verificationsTable.id, verification.id));

      return {
        data: {
          success: true,
        },
      };
    } catch (error: unknown) {
      console.error("Erro ao redefinir senha:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : ErrorMessages[ErrorTypes.RESET_ERROR];
      return {
        error: {
          type: ErrorTypes.RESET_ERROR,
          message: errorMessage,
        },
      };
    }
  });
