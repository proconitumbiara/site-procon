"use server";

import { headers } from "next/headers";

import { GINCANA_PROJECT_ID } from "@/constants/gincana";
import { db } from "@/db";
import {
  registrationAssentTable,
  registrationTable,
} from "@/db/schema";
import { calculateAge } from "@/lib/formatters/date";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, ilike } from "drizzle-orm";

import { formatPersonName } from "@/lib/formatters/contact";

import { createGincanaRegistrationSchema } from "./schema";

const TERMS_VERSION = "1.0";
const TERMS_HASH = "gincana-2024-v1";

export const createGincanaRegistration = actionClient
  .schema(createGincanaRegistrationSchema)
  .action(async ({ parsedInput }) => {
    const normalizedName = formatPersonName(parsedInput.participantFullName);

    const existingRegistration = await db
      .select({ id: registrationTable.id })
      .from(registrationTable)
      .where(
        and(
          eq(registrationTable.projectId, GINCANA_PROJECT_ID),
          ilike(registrationTable.participantFullName, normalizedName),
        ),
      )
      .limit(1);

    if (existingRegistration.length > 0) {
      return {
        error: {
          message:
            "Já existe uma inscrição cadastrada com este nome. Caso acredite que isso é um erro, entre em contato com o Procon.",
        },
      };
    }

    const age = calculateAge(new Date(parsedInput.participantBirthDate));
    const status =
      age >= 18 ? "completed" : "pending_guardian_autorization";

    const headersList = await headers();
    const userAgent = headersList.get("user-agent") ?? undefined;
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      undefined;

    const [registration] = await db
      .insert(registrationTable)
      .values({
        projectId: GINCANA_PROJECT_ID,
        participantFullName: normalizedName,
        participantPhone: parsedInput.participantPhone.trim(),
        participantBirthDate: parsedInput.participantBirthDate,
        participantSchool: parsedInput.participantSchool.trim(),
        participantCategory: parsedInput.participantCategory,
        clothingSize: parsedInput.clothingSize,
        studentPeriod:
          parsedInput.participantCategory === "student"
            ? parsedInput.studentPeriod ?? null
            : null,
        employeePosition:
          parsedInput.participantCategory === "employee"
            ? (parsedInput.employeePosition?.trim() ?? null)
            : null,
        status,
      })
      .returning({ id: registrationTable.id });

    if (!registration) {
      return { error: { message: "Falha ao criar inscrição." } };
    }

    const now = new Date();
    const assentValues = [
      {
        registrationId: registration.id,
        termsVersion: TERMS_VERSION,
        termsHash: TERMS_HASH,
        assentedAt: now,
        assentMethod: "terms_and_privacy" as const,
        ipAddress,
        userAgent,
        source: "gincana_procon_nas_escolas",
        pageUrl: parsedInput.pageUrl ?? undefined,
        locale: parsedInput.locale ?? undefined,
      },
      {
        registrationId: registration.id,
        termsVersion: TERMS_VERSION,
        termsHash: TERMS_HASH,
        assentedAt: now,
        assentMethod: "image_use" as const,
        ipAddress,
        userAgent,
        source: "gincana_procon_nas_escolas",
        pageUrl: parsedInput.pageUrl ?? undefined,
        locale: parsedInput.locale ?? undefined,
      },
    ];

    await db.insert(registrationAssentTable).values(assentValues);

    return {
      success: true,
      registrationId: registration.id,
      status,
    };
  });
