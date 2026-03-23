"use server";

import { actionClient } from "@/lib/next-safe-action";

import { createComplaintSchema } from "./schema";

function cleanBaseUrl(url: string): string {
  return url.replace(/\/+$/, "");
}

function mapEvidenceTypeToExternal(
  evidenceType: string,
): "documentary" | "photo_video" | "none" {
  // A UI usa valores PT (documental/photos_video), mas a rota externa espera EN.
  switch (evidenceType) {
    case "documental":
      return "documentary";
    case "photos_video":
      return "photo_video";
    case "none":
      return "none";
    default:
      return "none";
  }
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

    const endpoint = `${cleanBaseUrl(apiBaseUrl)}`;

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
      ...(parsedInput.respondentAddress
        ? { respondentAddress: parsedInput.respondentAddress }
        : {}),
      ...(parsedInput.respondentAdditionalInfo
        ? { respondentAdditionalInfo: parsedInput.respondentAdditionalInfo }
        : {}),

      factsDescription: parsedInput.factsDescription,
      request: parsedInput.request,
      ...(parsedInput.evidenceType && parsedInput.evidenceType !== "none"
        ? {
            evidenceType: mapEvidenceTypeToExternal(parsedInput.evidenceType),
          }
        : {}),

      ...(parsedInput.filingDate ? { filingDate: parsedInput.filingDate } : {}),
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

    // A API externa deve retornar um "id" (ou variação) para permitir o upload das provas.
    const body = responseBody as {
      id?: unknown;
      complaintId?: unknown;
      data?: { id?: unknown };
    } | null;

    const complaintIdRaw =
      body?.id ??
      body?.complaintId ??
      body?.data?.id ??
      (typeof responseBody === "object" &&
        responseBody !== null &&
        "data" in responseBody &&
        (responseBody as { data?: { complaintId?: unknown } }).data
          ?.complaintId);

    const complaintId =
      complaintIdRaw != null && complaintIdRaw !== ""
        ? String(complaintIdRaw)
        : undefined;

    if (!complaintId) {
      return {
        error: {
          message:
            "Resposta da API externa inválida: não foi possível obter o código da denúncia (id).",
        },
      };
    }

    return { success: true, complaintId };
  });
