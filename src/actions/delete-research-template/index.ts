"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { researchTemplatesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { deleteResearchTemplateSchema } from "./schema";

export const deleteResearchTemplate = actionClient
  .schema(deleteResearchTemplateSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const template = await db.query.researchTemplatesTable.findFirst({
      where: eq(researchTemplatesTable.id, parsedInput.id),
    });

    if (!template) {
      throw new Error("Template não encontrado");
    }

    if (!template.isActive) {
      throw new Error("Template já está inativo");
    }

    await db
      .update(researchTemplatesTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(researchTemplatesTable.id, parsedInput.id));

    revalidatePath("/gerenciar-pesquisas");
    revalidatePath("/gerenciar-pesquisas/templates");

    return { success: true };
  });
