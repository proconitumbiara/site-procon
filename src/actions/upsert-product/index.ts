"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { productsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertProductSchema } from "./schema";

export const upsertProduct = actionClient
  .schema(upsertProductSchema)
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

    const [product] = await db
      .insert(productsTable)
      .values({
        id: parsedInput.id,
        name: parsedInput.name.trim(),
        categoryId: parsedInput.categoryId,
      })
      .onConflictDoUpdate({
        target: [productsTable.id],
        set: {
          name: parsedInput.name.trim(),
          categoryId: parsedInput.categoryId,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: productsTable.id,
        name: productsTable.name,
        categoryId: productsTable.categoryId,
      });

    revalidatePath("/gerenciar-pesquisas");
    revalidatePath(`/gerenciar-pesquisas/produtos`);

    return { success: true, product };
  });
