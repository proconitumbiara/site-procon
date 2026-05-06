"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { deleteSupplierSchema } from "./schema";

export const deleteSupplier = actionClient
  .schema(deleteSupplierSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      throw new Error("Unauthorized");
    }

    const supplier = await db.query.suppliersTable.findFirst({
      where: eq(suppliersTable.id, parsedInput.id),
    });

    if (!supplier) {
      throw new Error("Fornecedor não encontrado");
    }

    if (!supplier.isActive) {
      throw new Error("Fornecedor já está inativo");
    }

    await db
      .update(suppliersTable)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(suppliersTable.id, parsedInput.id));

    revalidatePath("/gerenciar-pesquisas");

    return { success: true };
  });
