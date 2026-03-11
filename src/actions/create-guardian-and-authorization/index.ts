"use server";

import { createHash } from "crypto";
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

const DOCUMENT_TYPE = "PDF";

async function computeDocumentHash(fileUrl: string): Promise<string> {
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error("Não foi possível obter o arquivo para gerar o hash.");
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return createHash("sha256").update(buffer).digest("hex");
}

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
    let documentHash: string;
    try {
      documentHash = await computeDocumentHash(parsedInput.fileUrl);
    } catch {
      return { error: { message: "Falha ao processar o documento (hash)." } };
    }

    await db.insert(guardianAuthorizationDocumentTable).values({
      registrationId: parsedInput.registrationId,
      guardianId: guardian.id,
      documentType: DOCUMENT_TYPE,
      documentHash,
      fileUrl: parsedInput.fileUrl,
      uploadedAt: now,
      uploadedBy: session.user.id,
      status: "approved",
    });

    const [registration] = await db
      .update(registrationTable)
      .set({ status: "completed" })
      .where(eq(registrationTable.id, parsedInput.registrationId))
      .returning({ formId: registrationTable.formId });

    revalidatePath("/gerenciar-formularios");
    if (registration?.formId) {
      revalidatePath(`/gerenciar-formularios/${registration.formId}`);
    }

    return { success: true };
  });
