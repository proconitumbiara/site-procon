"use client";

import { calculateAge } from "@/lib/formatters/date";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { SCHOOLS } from "@/actions/create-form-registration/schema";
import { AGE_RANGES, type AgeRangeValue } from "@/constants/gincana";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { RegistrationWithGuardian } from "../types";
import InscricoesCards from "./inscricoes-cards";
import InscricoesTable from "./inscricoes-table";

interface InscricoesViewProps {
  formId: string;
  registrations: RegistrationWithGuardian[];
}

function getAgeForRegistration(registration: RegistrationWithGuardian) {
  return calculateAge(new Date(registration.participantBirthDate));
}

function matchesAgeRange(age: number, range: AgeRangeValue): boolean {
  if (range === "all") return true;
  if (range === "0-12") return age >= 0 && age <= 12;
  if (range === "13-17") return age >= 13 && age <= 17;
  if (range === "18+") return age >= 18;
  return true;
}

export default function InscricoesView({
  formId,
  registrations,
}: InscricoesViewProps) {
  const router = useRouter();
  const [schoolFilter, setSchoolFilter] = useState<string>("all");
  const [ageRangeFilter, setAgeRangeFilter] = useState<AgeRangeValue>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");
  const [isExportingSchoolPdf, setIsExportingSchoolPdf] = useState(false);
  const [isExportingGeneralPdf, setIsExportingGeneralPdf] = useState(false);

  const onGuardianAdded = () => router.refresh();

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (schoolFilter !== "all" && reg.participantSchool !== schoolFilter) {
        return false;
      }
      const age = getAgeForRegistration(reg);
      if (!matchesAgeRange(age, ageRangeFilter)) {
        return false;
      }
      if (
        categoryFilter !== "all" &&
        reg.participantCategory !== categoryFilter
      ) {
        return false;
      }
      return true;
    });
  }, [registrations, schoolFilter, ageRangeFilter, categoryFilter]);

  const triggerPdfDownload = (url: string) => {
    const link = document.createElement("a");
    link.href = url;
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportSchoolPdf = () => {
    if (schoolFilter === "all") {
      return;
    }

    setIsExportingSchoolPdf(true);
    try {
      const params = new URLSearchParams({
        mode: "school",
        school: schoolFilter,
      });
      triggerPdfDownload(`/api/forms/${formId}/registrations-pdf?${params.toString()}`);
    } finally {
      setTimeout(() => setIsExportingSchoolPdf(false), 600);
    }
  };

  const handleExportGeneralPdf = () => {
    setIsExportingGeneralPdf(true);
    try {
      const params = new URLSearchParams({ mode: "general" });
      triggerPdfDownload(`/api/forms/${formId}/registrations-pdf?${params.toString()}`);
    } finally {
      setTimeout(() => setIsExportingGeneralPdf(false), 600);
    }
  };

  return (
    <div className="space-y-4 overflow-visible">
      <div className="rounded-lg border bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <Select
            value={schoolFilter}
            onValueChange={setSchoolFilter}
          >
            <SelectTrigger className="w-[220px]" aria-label="Filtrar por escola">
              <SelectValue placeholder="Escola" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="bg-background">
                Todas as escolas
              </SelectItem>
              {SCHOOLS.map((school) => (
                <SelectItem key={school} value={school} className="bg-background">
                  {school}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={ageRangeFilter}
            onValueChange={(v) => setAgeRangeFilter(v as AgeRangeValue)}
          >
            <SelectTrigger
              className="w-[180px]"
              aria-label="Filtrar por faixa de idade"
            >
              <SelectValue placeholder="Faixa de idade" />
            </SelectTrigger>
            <SelectContent className="z-50">
              {AGE_RANGES.map((range) => (
                <SelectItem
                  key={range.value}
                  value={range.value}
                  className="bg-background"
                >
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={categoryFilter}
            onValueChange={setCategoryFilter}
          >
            <SelectTrigger
              className="w-[160px]"
              aria-label="Filtrar por categoria"
            >
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent className="z-50">
              <SelectItem value="all" className="bg-background">
                Todas
              </SelectItem>
              <SelectItem value="student" className="bg-background">
                Alunos
              </SelectItem>
              <SelectItem value="employee" className="bg-background">
                Profissionais
              </SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSchoolFilter("all");
              setAgeRangeFilter("all");
              setCategoryFilter("all");
            }}
          >
            Limpar filtros
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportSchoolPdf}
            disabled={schoolFilter === "all" || isExportingSchoolPdf}
          >
            {isExportingSchoolPdf
              ? "Exportando..."
              : "Exportar Selecionado"}
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleExportGeneralPdf}
            disabled={isExportingGeneralPdf}
          >
            {isExportingGeneralPdf
              ? "Exportando..."
              : "Exportar todos"}
          </Button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
          <p className="text-muted-foreground text-sm">
            {filteredRegistrations.length} inscriç
            {filteredRegistrations.length === 1 ? "ão" : "ões"} encontrada
            {filteredRegistrations.length === 1 ? "" : "s"}
            {schoolFilter !== "all" ||
              ageRangeFilter !== "all" ||
              categoryFilter !== "all"
              ? " (com filtros)"
              : ""}
          </p>
          <Tabs
            value={viewMode}
            onValueChange={(v) => setViewMode(v as "cards" | "table")}
            className="bg-card"
          >
            <TabsList className="bg-card">
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="table">Tabela</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {viewMode === "cards" ? (
        <InscricoesCards
          registrations={filteredRegistrations}
          onGuardianAdded={onGuardianAdded}
        />
      ) : (
        <InscricoesTable
          registrations={filteredRegistrations}
          onGuardianAdded={onGuardianAdded}
        />
      )}
    </div>
  );
}
