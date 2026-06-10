"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { priceSearchTypesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { deletePriceSearchTypeSchema } from "./schema";

export const deletePriceSearchType = actionClient
  .schema(deletePriceSearchTypeSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const priceSearchType = await db.query.priceSearchTypesTable.findFirst({
      where: eq(priceSearchTypesTable.id, parsedInput.id),
    });

    if (!priceSearchType) {
      throw new Error("Tipo de pesquisa não encontrado");
    }

    if (!priceSearchType.isActive) {
      throw new Error("Tipo de pesquisa já está inativo");
    }

    await db
      .update(priceSearchTypesTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(priceSearchTypesTable.id, parsedInput.id));

    revalidatePath("/gerenciar-pesquisas/tipos");
    revalidatePath("/gerenciar-pesquisas");

    return { success: true };
  });
