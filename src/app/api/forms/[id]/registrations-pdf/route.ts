import { and, asc, eq } from "drizzle-orm";
import { jsPDF } from "jspdf";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { registrationTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getFormById } from "@/lib/data/content";

type ExportMode = "school" | "general";

type RegistrationWithGuardian = Awaited<
  ReturnType<typeof getRegistrations>
>[number];

async function getRegistrations(params: { formId: string; mode: ExportMode; selectedSchool?: string }) {
  const { formId, mode, selectedSchool } = params;

  const whereClause =
    mode === "school" && selectedSchool
      ? and(
          eq(registrationTable.formId, formId),
          eq(registrationTable.participantSchool, selectedSchool),
        )
      : eq(registrationTable.formId, formId);

  return db.query.registrationTable.findMany({
    where: whereClause,
    with: {
      guardianAuthorizationDocuments: {
        with: { guardian: true },
      },
    },
    orderBy: [asc(registrationTable.participantSchool), asc(registrationTable.participantFullName)],
  });
}

const CATEGORY_LABELS: Record<string, string> = {
  student: "Aluno",
  employee: "Profissional",
};

const STATUS_LABELS: Record<string, string> = {
  completed: "Completa",
  pending_guardian_autorization: "Aguardando autorizacao",
};

function formatDate(value: string | Date | null | undefined) {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("pt-BR");
}

function formatCategory(value: string) {
  return CATEGORY_LABELS[value] ?? value;
}

function formatStatus(value: string) {
  return STATUS_LABELS[value] ?? value;
}

function sanitizeFileName(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

function buildGroupedBySchool(registrations: RegistrationWithGuardian[]) {
  const grouped = new Map<string, RegistrationWithGuardian[]>();
  for (const registration of registrations) {
    const school = registration.participantSchool || "Escola nao informada";
    const bucket = grouped.get(school) ?? [];
    bucket.push(registration);
    grouped.set(school, bucket);
  }

  return [...grouped.entries()].sort(([schoolA], [schoolB]) =>
    schoolA.localeCompare(schoolB, "pt-BR"),
  );
}

function createPdfBuffer(params: {
  formName: string;
  mode: ExportMode;
  selectedSchool?: string;
  registrations: RegistrationWithGuardian[];
}) {
  const { formName, mode, selectedSchool, registrations } = params;

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 14;
  const topMargin = 14;
  const bottomMargin = 14;
  const contentWidth = pageWidth - marginX * 2;
  const lineHeight = 5;
  let cursorY = topMargin;

  const ensureSpace = (neededHeight: number) => {
    if (cursorY + neededHeight <= pageHeight - bottomMargin) {
      return;
    }
    doc.addPage();
    cursorY = topMargin;
  };

  const drawWrappedLine = (label: string, value: string) => {
    const text = `${label}: ${value || "-"}`;
    const lines = doc.splitTextToSize(text, contentWidth);
    ensureSpace(lines.length * lineHeight + 1);
    doc.text(lines, marginX, cursorY);
    cursorY += lines.length * lineHeight;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Relatorio de inscricoes", marginX, cursorY);
  cursorY += 7;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  drawWrappedLine("Formulario", formName);
  drawWrappedLine(
    "Modo de exportacao",
    mode === "school" ? "Por escola selecionada" : "Geral por escola",
  );
  if (selectedSchool) {
    drawWrappedLine("Escola filtrada", selectedSchool);
  }
  drawWrappedLine("Gerado em", new Date().toLocaleString("pt-BR"));

  cursorY += 2;
  doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
  cursorY += 6;

  if (!registrations.length) {
    doc.setFont("helvetica", "normal");
    doc.text("Nenhuma inscricao encontrada para os filtros selecionados.", marginX, cursorY);
    return doc.output("arraybuffer");
  }

  const groupedEntries = buildGroupedBySchool(registrations);

  groupedEntries.forEach(([school, schoolRegistrations], schoolIndex) => {
    ensureSpace(10);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(`${school} (${schoolRegistrations.length})`, marginX, cursorY);
    cursorY += 6;

    schoolRegistrations.forEach((registration, regIndex) => {
      ensureSpace(10);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text(`${regIndex + 1}. ${registration.participantFullName}`, marginX, cursorY);
      cursorY += 5;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      drawWrappedLine("Telefone", registration.participantPhone);
      drawWrappedLine("Nascimento", formatDate(registration.participantBirthDate));
      drawWrappedLine("Escola", registration.participantSchool);
      drawWrappedLine("Categoria", formatCategory(registration.participantCategory));
      drawWrappedLine("Serie", registration.studentPeriod ?? "-");
      drawWrappedLine("Cargo/Funcao", registration.employeePosition ?? "-");
      drawWrappedLine("Tamanho da roupa", registration.clothingSize ?? "-");
      drawWrappedLine("Status", formatStatus(registration.status));

      const guardians = registration.guardianAuthorizationDocuments ?? [];
      drawWrappedLine("Qtd. autorizacoes", String(guardians.length));
      guardians.forEach((guardianDoc, guardianIndex) => {
        const guardian = guardianDoc.guardian;
        drawWrappedLine(
          `Responsavel ${guardianIndex + 1}`,
          `${guardian.fullName} | Doc: ${guardian.document} | Tel: ${guardian.phone} | Parentesco: ${guardian.relationship}`,
        );
        drawWrappedLine(`Arquivo autorizacao ${guardianIndex + 1}`, guardianDoc.fileUrl);
      });

      cursorY += 2;
      ensureSpace(4);
      doc.setDrawColor(190);
      doc.line(marginX, cursorY, pageWidth - marginX, cursorY);
      cursorY += 5;
    });

    if (schoolIndex < groupedEntries.length - 1) {
      ensureSpace(3);
      cursorY += 1;
    }
  });

  return doc.output("arraybuffer");
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const form = await getFormById(id);

  if (!form) {
    return NextResponse.json({ error: "Formulario nao encontrado" }, { status: 404 });
  }

  const mode = (request.nextUrl.searchParams.get("mode") ?? "general") as ExportMode;
  const selectedSchool = request.nextUrl.searchParams.get("school") ?? undefined;

  if (mode !== "school" && mode !== "general") {
    return NextResponse.json({ error: "Modo de exportacao invalido" }, { status: 400 });
  }

  if (mode === "school" && !selectedSchool) {
    return NextResponse.json(
      { error: "Parametro school e obrigatorio para exportacao por escola" },
      { status: 400 },
    );
  }

  const registrations = await getRegistrations({
    formId: id,
    mode,
    selectedSchool,
  });

  const pdf = createPdfBuffer({
    formName: form.name,
    mode,
    selectedSchool,
    registrations,
  });

  const fileBase = sanitizeFileName(form.slug || form.name || "formulario");
  const fileMode =
    mode === "school" && selectedSchool
      ? `escola-${sanitizeFileName(selectedSchool)}`
      : "geral";
  const fileName = `inscricoes-${fileBase}-${fileMode}.pdf`;

  return new NextResponse(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Cache-Control": "no-store",
    },
  });
}
