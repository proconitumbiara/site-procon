"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { suppliersTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  formatPhone,
  normalizeAddress,
  normalizePhone,
} from "@/lib/formatters";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertSupplierSchema } from "./schema";

const normalizeNullableString = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const upsertSupplier = actionClient
  .schema(upsertSupplierSchema)
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

    const [supplier] = await db
      .insert(suppliersTable)
      .values({
        id: parsedInput.id,
        name: parsedInput.name.trim(),
        address: normalizeNullableString(
          normalizeAddress(parsedInput.address ?? ""),
        ),
        phone: normalizeNullableString(
          formatPhone(normalizePhone(parsedInput.phone)),
        ),
        isActive: parsedInput.isActive ?? true,
      })
      .onConflictDoUpdate({
        target: [suppliersTable.id],
        set: {
          name: parsedInput.name.trim(),
          address: normalizeNullableString(
            normalizeAddress(parsedInput.address ?? ""),
          ),
          phone: normalizeNullableString(
            formatPhone(normalizePhone(parsedInput.phone)),
          ),
          isActive: parsedInput.isActive ?? true,
          updatedAt: new Date(),
        },
      })
      .returning({
        id: suppliersTable.id,
        name: suppliersTable.name,
        address: suppliersTable.address,
        phone: suppliersTable.phone,
        isActive: suppliersTable.isActive,
      });

    revalidatePath(`/gerenciar-fornecedores`);

    return { success: true, supplier };
  });
