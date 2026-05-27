"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { formsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { formatSlug } from "@/lib/formatters";
import { actionClient } from "@/lib/next-safe-action";
import { eq } from "drizzle-orm";

import { ErrorMessages, ErrorTypes, upsertFormSchema } from "./schema";

export const upsertForm = actionClient
  .schema(upsertFormSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return {
        error: {
          type: ErrorTypes.UNAUTHENTICATED,
          message: ErrorMessages[ErrorTypes.UNAUTHENTICATED],
        },
      };
    }

    const slug = formatSlug(parsedInput.name);
    if (!slug) {
      throw new Error(
        "Não foi possível gerar um slug válido para o formulário.",
      );
    }

    let formId: string | undefined;

    if (parsedInput.id) {
      const [result] = await db
        .update(formsTable)
        .set({
          name: parsedInput.name.trim(),
          slug,
          isActive: parsedInput.isActive ?? true,
          updatedAt: new Date(),
        })
        .where(eq(formsTable.id, parsedInput.id))
        .returning({ id: formsTable.id });

      formId = result?.id;
    } else {
      const [result] = await db
        .insert(formsTable)
        .values({
          name: parsedInput.name.trim(),
          slug,
          isActive: parsedInput.isActive ?? true,
          projectId: parsedInput.projectId,
        })
        .returning({ id: formsTable.id });

      formId = result?.id;
    }

    if (!formId) {
      return {
        error: {
          type: "FAILED" as const,
          message: "Falha ao salvar formulário.",
        },
      };
    }

    revalidatePath("/gerenciar-formularios");
    revalidatePath(`/gerenciar-formularios/${formId}`);
    revalidatePath("/gerenciar-projetos");

    return { success: true, formId };
  });
