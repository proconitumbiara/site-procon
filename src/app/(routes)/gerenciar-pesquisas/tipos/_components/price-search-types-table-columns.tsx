"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deletePriceSearchType } from "@/actions/delete-price-search-type";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { priceSearchTypesTable } from "@/db/schema";

import UpsertPriceSearchTypeForm from "./upsert-price-search-type-form";

type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

export const priceSearchTypesTableColumns = (): ColumnDef<PriceSearchType>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "periodicity",
    accessorKey: "periodicity",
    header: "Periodicidade",
  },
  {
    id: "status",
    header: "Status",
    cell: ({ row }) =>
      row.original.isActive ? (
        <Badge variant="secondary">Ativo</Badge>
      ) : (
        <Badge variant="outline">Inativo</Badge>
      ),
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => {
      const priceSearchType = row.original;
      return <PriceSearchTypeActions priceSearchType={priceSearchType} />;
    },
  },
];

function PriceSearchTypeActions({
  priceSearchType,
}: {
  priceSearchType: PriceSearchType;
}) {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { execute: deleteAction, status: deleteStatus } = useAction(
    deletePriceSearchType,
    {
      onSuccess: () => {
        toast.success("Tipo inativado com sucesso!");
        window.location.reload();
      },
      onError: (error) => {
        const message =
          error.error?.serverError ?? "Erro ao inativar tipo de pesquisa.";
        toast.error(message);
      },
    },
  );

  return (
    <div className="flex items-center gap-2">
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <UpsertPriceSearchTypeForm
          priceSearchType={priceSearchType}
          onSuccess={() => setIsEditDialogOpen(false)}
        />
      </Dialog>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="hover:bg-red-500 hover:text-white"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Tem certeza que deseja inativar este tipo?
            </AlertDialogTitle>
            <AlertDialogDescription>
              O tipo será ocultado de novos cadastros, mas o histórico será
              preservado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAction({ id: priceSearchType.id })}
              disabled={deleteStatus === "executing"}
            >
              {deleteStatus === "executing" ? "Inativando..." : "Inativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
