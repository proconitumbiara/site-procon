"use server";

import { and, eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import {
  productsTable,
  researchTemplateItemsTable,
  researchTemplatesTable,
  suppliersTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import {
  ErrorMessages,
  ErrorTypes,
  upsertResearchTemplateSchema,
} from "./schema";

const normalizeNullableString = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const upsertResearchTemplate = actionClient
  .schema(upsertResearchTemplateSchema)
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

    const productIds = [...new Set(parsedInput.items.map((item) => item.productId))];
    const supplierIds = [
      ...new Set(parsedInput.items.map((item) => item.supplierId)),
    ];

    if (productIds.length > 0) {
      const activeProducts = await db.query.productsTable.findMany({
        where: and(
          inArray(productsTable.id, productIds),
          eq(productsTable.isActive, true),
        ),
      });

      if (activeProducts.length !== productIds.length) {
        throw new Error(
          "O template possui produtos inativos ou inexistentes.",
        );
      }
    }

    if (supplierIds.length > 0) {
      const activeSuppliers = await db.query.suppliersTable.findMany({
        where: and(
          inArray(suppliersTable.id, supplierIds),
          eq(suppliersTable.isActive, true),
        ),
      });

      if (activeSuppliers.length !== supplierIds.length) {
        throw new Error(
          "O template possui fornecedores inativos ou inexistentes.",
        );
      }
    }

    await db.transaction(async (tx) => {
      const [templateResult] = await tx
        .insert(researchTemplatesTable)
        .values({
          id: parsedInput.id,
          name: parsedInput.name.trim(),
          slug: parsedInput.slug.trim(),
          description: normalizeNullableString(parsedInput.description),
          isActive: parsedInput.isActive ?? true,
        })
        .onConflictDoUpdate({
          target: [researchTemplatesTable.id],
          set: {
            name: parsedInput.name.trim(),
            slug: parsedInput.slug.trim(),
            description: normalizeNullableString(parsedInput.description),
            isActive: parsedInput.isActive ?? true,
            updatedAt: new Date(),
          },
        })
        .returning({ id: researchTemplatesTable.id });

      const templateId = templateResult?.id ?? parsedInput.id;

      if (!templateId) {
        throw new Error("Falha ao salvar template.");
      }

      await tx
        .delete(researchTemplateItemsTable)
        .where(eq(researchTemplateItemsTable.templateId, templateId));

      if (parsedInput.items.length > 0) {
        await tx.insert(researchTemplateItemsTable).values(
          parsedInput.items.map((item, index) => ({
            templateId,
            productId: item.productId,
            supplierId: item.supplierId,
            sortOrder: item.sortOrder ?? index,
          })),
        );
      }
    });

    revalidatePath("/gerenciar-pesquisas");
    revalidatePath("/gerenciar-pesquisas/templates");

    return { success: true };
  });
