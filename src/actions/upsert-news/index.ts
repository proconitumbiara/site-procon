"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

import { db } from "@/db";
import { newsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { ErrorMessages, ErrorTypes, upsertNewsSchema } from "./schema";

const normalizeNullableString = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

const toDateOrNull = (value?: string | null) => {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length ? new Date(trimmed) : null;
};

export const upsertNews = actionClient
  .schema(upsertNewsSchema)
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

    let newsId: string | undefined;
    await db.transaction(async (tx) => {
      const [result] = await tx
        .insert(newsTable)
        .values({
          id: parsedInput.id,
          title: parsedInput.title.trim(),
          slug: parsedInput.slug.trim(),
          excerpt: normalizeNullableString(parsedInput.excerpt),
          content: normalizeNullableString(parsedInput.content),
          coverImageUrl: normalizeNullableString(parsedInput.coverImageUrl),
          publishedAt: toDateOrNull(parsedInput.publishedAt),
          isPublished: parsedInput.isPublished,
          emphasis: parsedInput.emphasis ?? false,
        })
        .onConflictDoUpdate({
          target: [newsTable.id],
          set: {
            title: parsedInput.title.trim(),
            slug: parsedInput.slug.trim(),
            excerpt: normalizeNullableString(parsedInput.excerpt),
            content: normalizeNullableString(parsedInput.content),
            coverImageUrl: normalizeNullableString(parsedInput.coverImageUrl),
            publishedAt: toDateOrNull(parsedInput.publishedAt),
            isPublished: parsedInput.isPublished,
            emphasis: parsedInput.emphasis ?? false,
            updatedAt: new Date(),
          },
        })
        .returning({ id: newsTable.id });

      newsId = result?.id ?? parsedInput.id;

      if (!newsId) {
        throw new Error("Falha ao salvar notícia.");
      }
    });

    revalidatePath("/");
    revalidatePath("/gerenciar-noticias");
    if (newsId) {
      revalidatePath(`/gerenciar-noticias/${newsId}`);
    }

    return { success: true };
  });
