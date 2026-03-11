"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DataTable } from "@/components/ui/data-table";
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

interface InscricoesTableProps {
  registrations: RegistrationWithGuardian[];
  onGuardianAdded?: () => void;
}

export default function InscricoesTable({
  registrations,
  onGuardianAdded,
}: InscricoesTableProps) {
  const [viewingId, setViewingId] = useState<string | null>(null);

  const columns: ColumnDef<RegistrationWithGuardian>[] = [
    {
      id: "participantFullName",
      accessorKey: "participantFullName",
      header: "Nome",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.participantFullName}</span>
      ),
    },
    {
      id: "participantSchool",
      accessorKey: "participantSchool",
      header: "Escola",
      cell: ({ row }) => row.original.participantSchool,
    },
    {
      id: "participantCategory",
      accessorKey: "participantCategory",
      header: "Categoria",
      cell: ({ row }) =>
        row.original.participantCategory === "student"
          ? "Aluno"
          : "Profissional",
    },
    {
      id: "age",
      header: "Idade",
      cell: ({ row }) => {
        const age = calculateAge(
          new Date(row.original.participantBirthDate),
        );
        return `${age} anos`;
      },
    },
    {
      id: "status",
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant={
            row.original.status === "completed" ? "default" : "secondary"
          }
        >
          {getStatusLabel(row.original.status)}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Ações",
      cell: ({ row }) => {
        const reg = row.original;
        return (
          <Dialog
            open={viewingId === reg.id}
            onOpenChange={(open) => setViewingId(open ? reg.id : null)}
          >
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Visualizar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>{reg.participantFullName}</DialogTitle>
              </DialogHeader>
              <RegistrationExpandedContent
                registration={reg}
                onGuardianAdded={() => {
                  setViewingId(null);
                  onGuardianAdded?.();
                }}
              />
            </DialogContent>
          </Dialog>
        );
      },
    },
  ];

  if (!registrations.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma inscrição encontrada.
        </p>
      </div>
    );
  }

  return <DataTable data={registrations} columns={columns} />;
}
