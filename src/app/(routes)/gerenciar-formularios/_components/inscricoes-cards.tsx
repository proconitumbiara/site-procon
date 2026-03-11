"use client";

import { ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { calculateAge } from "@/lib/formatters/date";
import type { RegistrationWithGuardian } from "../types";

import { RegistrationExpandedContent } from "./registration-expanded-content";

const STATUS_LABELS: Record<string, string> = {
  completed: "Completa",
  pending_guardian_autorization: "Aguardando autorização",
};

function getStatusLabel(status: string) {
  return STATUS_LABELS[status] ?? status;
}

interface InscricoesCardsProps {
  registrations: RegistrationWithGuardian[];
  onGuardianAdded?: () => void;
}

export default function InscricoesCards({
  registrations,
  onGuardianAdded,
}: InscricoesCardsProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (!registrations.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma inscrição encontrada.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {registrations.map((reg) => {
        const isExpanded = expandedIds.has(reg.id);
        const age = calculateAge(new Date(reg.participantBirthDate));
        return (
          <Card key={reg.id} className="border">
            <CardHeader
              className={`flex flex-col gap-3 pb-4 ${isExpanded ? "border-b" : ""}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <CardTitle className="text-lg">
                  {reg.participantFullName}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(reg.id)}
                  className="flex items-center gap-1"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Visualizar
                    </>
                  )}
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{reg.participantSchool}</Badge>
                <Badge variant="outline">
                  {reg.participantCategory === "student"
                    ? "Aluno"
                    : "Profissional"}
                </Badge>
                <Badge variant="outline">{age} anos</Badge>
                <Badge
                  variant={
                    reg.status === "completed" ? "default" : "secondary"
                  }
                >
                  {getStatusLabel(reg.status)}
                </Badge>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="pt-4">
                <RegistrationExpandedContent
                  registration={reg}
                  onGuardianAdded={onGuardianAdded}
                />
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
