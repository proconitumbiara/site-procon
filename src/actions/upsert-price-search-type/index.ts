"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { priceSearchTypesTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import {
  ErrorMessages,
  ErrorTypes,
  upsertPriceSearchTypeSchema,
} from "./schema";

export const upsertPriceSearchType = actionClient
  .schema(upsertPriceSearchTypeSchema)
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

    const [priceSearchType] = await db
      .insert(priceSearchTypesTable)
      .values({
        id: parsedInput.id,
        name: parsedInput.name.trim(),
        periodicity: parsedInput.periodicity.trim(),
        isActive: parsedInput.isActive ?? true,
      })
      .onConflictDoUpdate({
        target: [priceSearchTypesTable.id],
        set: {
          name: parsedInput.name.trim(),
          periodicity: parsedInput.periodicity.trim(),
          isActive: parsedInput.isActive ?? true,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: priceSearchTypesTable.id,
        name: priceSearchTypesTable.name,
        periodicity: priceSearchTypesTable.periodicity,
        isActive: priceSearchTypesTable.isActive,
      });

    revalidatePath("/gerenciar-pesquisas/tipos");
    revalidatePath("/gerenciar-pesquisas");

    return { success: true, priceSearchType };
  });
