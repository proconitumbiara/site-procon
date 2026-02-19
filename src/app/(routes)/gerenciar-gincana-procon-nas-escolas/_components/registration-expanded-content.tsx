"use client";

import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import type { GincanaRegistrationWithGuardian } from "../types";
import GuardianAuthorizationForm from "./guardian-authorization-form";


interface RegistrationExpandedContentProps {
  registration: GincanaRegistrationWithGuardian;
  onGuardianAdded?: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  completed: "Completa",
  pending_guardian_autorization: "Aguardando autorização",
};

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

export function RegistrationExpandedContent({
  registration,
  onGuardianAdded,
}: RegistrationExpandedContentProps) {
  const hasGuardianDocs = registration.guardianAuthorizationDocuments?.length > 0;

  return (
    <div className="w-full space-y-6">
      <div className="grid gap-6 text-sm sm:grid-cols-2">
        <div className="text-muted-foreground flex justify-between gap-2">
          <span>Nome completo</span>
          <span className="text-foreground text-right font-medium">
            {registration.participantFullName}
          </span>
        </div>
        <div className="text-muted-foreground flex justify-between gap-2">
          <span>Telefone</span>
          <span className="text-foreground">{registration.participantPhone}</span>
        </div>
        <div className="text-muted-foreground flex justify-between gap-2">
          <span>Data de nascimento</span>
          <span className="text-foreground">
            {formatDate(registration.participantBirthDate)}
          </span>
        </div>
        <div className="text-muted-foreground flex justify-between gap-2">
          <span>Escola</span>
          <span className="text-foreground text-right">
            {registration.participantSchool}
          </span>
        </div>
        <div className="text-muted-foreground flex justify-between gap-2">
          <span>Categoria</span>
          <span className="text-foreground">
            {registration.participantCategory === "student"
              ? "Aluno"
              : "Profissional"}
          </span>
        </div>
        {registration.studentPeriod && (
          <div className="text-muted-foreground flex justify-between gap-2">
            <span>Série</span>
            <span className="text-foreground">
              {registration.studentPeriod}
            </span>
          </div>
        )}
        {registration.employeePosition && (
          <div className="text-muted-foreground flex justify-between gap-2">
            <span>Cargo / Função</span>
            <span className="text-foreground">
              {registration.employeePosition}
            </span>
          </div>
        )}
        <div className="text-muted-foreground flex justify-between gap-2">
          <span>Tamanho da roupa</span>
          <span className="text-foreground">
            {registration.clothingSize ?? "-"}
          </span>
        </div>
        <div className="text-muted-foreground flex justify-between gap-2">
          <span>Status</span>
          <span className="text-foreground font-medium">
            {getStatusLabel(registration.status)}
          </span>
        </div>
      </div>

      <div className="border-t pt-4">
        <h4 className="mb-3 text-sm font-semibold">Responsável e autorização</h4>
        {hasGuardianDocs ? (
          <div className="space-y-4">
            {registration.guardianAuthorizationDocuments.map((doc) => (
              <div
                key={doc.id}
                className="rounded-lg border p-4 space-y-2"
              >
                <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                  Responsável
                </p>
                <div className="grid gap-1 text-sm sm:grid-cols-2">
                  <div>
                    <span className="text-muted-foreground">Nome: </span>
                    {doc.guardian.fullName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Documento: </span>
                    {doc.guardian.document}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Telefone: </span>
                    {doc.guardian.phone}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Parentesco: </span>
                    {doc.guardian.relationship}
                  </div>
                </div>
                <div className="pt-2">
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <FileText className="size-4" />
                    Abrir autorização (PDF)
                  </a>
                </div>
              </div>
            ))}
            <GuardianAuthorizationForm
              registrationId={registration.id}
              onSuccess={onGuardianAdded}
              trigger={
                <Button variant="outline" size="sm">
                  Adicionar outro responsável / autorização
                </Button>
              }
            />
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-muted-foreground text-sm">
              Nenhum responsável ou autorização vinculada a esta inscrição.
            </p>
            <GuardianAuthorizationForm
              registrationId={registration.id}
              onSuccess={onGuardianAdded}
              trigger={
                <Button variant="default" size="sm">
                  Cadastrar responsável e autorização
                </Button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}
