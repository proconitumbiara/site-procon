"use server";

import { headers } from "next/headers";

import { db } from "@/db";
import {
  formsTable,
  registrationAssentTable,
  registrationTable,
} from "@/db/schema";
import { calculateAge } from "@/lib/formatters/date";
import { actionClient } from "@/lib/next-safe-action";
import { and, eq, ilike } from "drizzle-orm";

import { formatPersonName } from "@/lib/formatters/contact";

import { createFormRegistrationSchema } from "./schema";

const TERMS_VERSION = "1.0";
const TERMS_HASH = "form-registration-v1";

export const createFormRegistration = actionClient
  .schema(createFormRegistrationSchema)
  .action(async ({ parsedInput }) => {
    const form = await db.query.formsTable.findFirst({
      where: eq(formsTable.id, parsedInput.formId),
      columns: { id: true, isActive: true },
    });

    if (!form) {
      return {
        error: {
          message: "Formulário não encontrado.",
        },
      };
    }

    if (!form.isActive) {
      return {
        error: {
          message: "Este formulário não está aceitando inscrições no momento.",
        },
      };
    }

    const normalizedName = formatPersonName(parsedInput.participantFullName);

    const existingRegistration = await db
      .select({ id: registrationTable.id })
      .from(registrationTable)
      .where(
        and(
          eq(registrationTable.formId, parsedInput.formId),
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
        formId: parsedInput.formId,
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
        source: "form_registration",
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
        source: "form_registration",
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
