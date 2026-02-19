"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import {
  guardianAuthorizationDocumentTable,
  guardianTable,
  registrationTable,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { actionClient } from "@/lib/next-safe-action";

import { createGuardianAndAuthorizationSchema } from "./schema";

const DOCUMENT_TYPE = "image_use";
const DOCUMENT_VERSION = "1.0";
const DOCUMENT_HASH = "gincana-authorization-v1";

export const createGuardianAndAuthorization = actionClient
  .schema(createGuardianAndAuthorizationSchema)
  .action(async ({ parsedInput }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) {
      return { error: { message: "Não autorizado." } };
    }

    const [guardian] = await db
      .insert(guardianTable)
      .values({
        fullName: parsedInput.fullName.trim(),
        document: parsedInput.document.trim(),
        phone: parsedInput.phone.trim(),
        relationship: parsedInput.relationship.trim(),
      })
      .returning({ id: guardianTable.id });

    if (!guardian) {
      return { error: { message: "Falha ao criar responsável." } };
    }

    const now = new Date();

    await db.insert(guardianAuthorizationDocumentTable).values({
      registrationId: parsedInput.registrationId,
      guardianId: guardian.id,
      documentType: DOCUMENT_TYPE,
      documentVersion: DOCUMENT_VERSION,
      documentHash: DOCUMENT_HASH,
      fileUrl: parsedInput.fileUrl,
      mimeType: parsedInput.mimeType,
      uploadedAt: now,
      uploadedBy: session.user.id,
      status: "approved",
    });

    await db
      .update(registrationTable)
      .set({ status: "completed" })
      .where(eq(registrationTable.id, parsedInput.registrationId));

    revalidatePath("/gerenciar-gincana-procon-nas-escolas");

    return { success: true };
  });
