"use server";

import { actionClient } from "@/lib/next-safe-action";

import { createComplaintSchema } from "./schema";

function cleanBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

export const createComplaint = actionClient
  .schema(createComplaintSchema)
  .action(async ({ parsedInput }) => {
    const secret = process.env.COMPLAINTS_SECRET;
    const apiBaseUrl = process.env.COMPLAINTS_API_URL;

    if (!secret) {
      return {
        error: {
          message: "Configuração ausente: COMPLAINTS_SECRET.",
        },
      };
    }

    if (!apiBaseUrl) {
      return {
        error: {
          message: "Configuração ausente: COMPLAINTS_API_URL.",
        },
      };
    }

    const endpoint = `${cleanBaseUrl(apiBaseUrl)}/api/complaint`;

    const payload = {
      isAnonymous: parsedInput.isAnonymous,

      ...(parsedInput.isAnonymous
        ? {}
        : {
            complainantName: parsedInput.complainantName,
            complainantProfession: parsedInput.complainantProfession,
            complainantCpf: parsedInput.complainantCpf,
            complainantPhone: parsedInput.complainantPhone,
            complainantEmail: parsedInput.complainantEmail,
            complainantAddress: parsedInput.complainantAddress,
            complainantZipCode: parsedInput.complainantZipCode,
          }),

      respondentCompanyName: parsedInput.respondentCompanyName,
      ...(parsedInput.respondentCnpj
        ? { respondentCnpj: parsedInput.respondentCnpj }
        : {}),
      respondentAddress: parsedInput.respondentAddress,
      respondentZipCode: parsedInput.respondentZipCode,
      ...(parsedInput.respondentAdditionalInfo
        ? { respondentAdditionalInfo: parsedInput.respondentAdditionalInfo }
        : {}),

      factsDescription: parsedInput.factsDescription,
      request: parsedInput.request,
      evidenceType: parsedInput.evidenceType,

      filingDate: parsedInput.filingDate,
    };

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secret}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let responseBody: unknown;
    try {
      responseBody = await response.json();
    } catch {
      responseBody = await response.text().catch(() => null);
    }

    if (!response.ok) {
      const messageFromApi =
        typeof responseBody === "object" &&
        responseBody !== null &&
        "message" in responseBody
          ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (responseBody as any).message
          : undefined;

      return {
        error: {
          message:
            messageFromApi ??
            `Falha ao enviar denúncia (HTTP ${response.status}).`,
        },
      };
    }

    return { success: true };
  });

