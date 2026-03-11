"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { projectsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertProjectSchema } from "./schema";

const normalizeNullableString = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const upsertProject = actionClient
  .schema(upsertProjectSchema)
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

    let projectId: string | undefined;
    await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(projectsTable)
        .values({
          id: parsedInput.id,
          title: parsedInput.title.trim(),
          slug: parsedInput.slug.trim(),
          summary: normalizeNullableString(parsedInput.summary),
          description: normalizeNullableString(parsedInput.description),
          coverImageUrl: normalizeNullableString(parsedInput.coverImageUrl),
          emphasis: parsedInput.emphasis ?? false,
          status: (parsedInput.status ?? "active").trim(),
        })
        .onConflictDoUpdate({
          target: [projectsTable.id],
          set: {
            title: parsedInput.title.trim(),
            slug: parsedInput.slug.trim(),
            summary: normalizeNullableString(parsedInput.summary),
            description: normalizeNullableString(parsedInput.description),
            coverImageUrl: normalizeNullableString(parsedInput.coverImageUrl),
            emphasis: parsedInput.emphasis ?? false,
            status: (parsedInput.status ?? "active").trim(),
            updatedAt: new Date(),
          },
        })
        .returning({ id: projectsTable.id });

      projectId = result?.id ?? parsedInput.id;

      if (!projectId) {
        throw new Error("Falha ao salvar projeto.");
      }
    });

    revalidatePath("/gerenciar-projetos");
    if (projectId) {
      revalidatePath(`/gerenciar-projetos/${projectId}`);
    }

    return { success: true };
  });
