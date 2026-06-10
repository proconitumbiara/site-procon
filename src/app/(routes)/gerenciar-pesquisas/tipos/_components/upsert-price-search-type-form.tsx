"use client";

import { Loader2 } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { upsertPriceSearchType } from "@/actions/upsert-price-search-type";
import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { priceSearchTypesTable } from "@/db/schema";

type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface UpsertPriceSearchTypeFormProps {
  priceSearchType?: PriceSearchType;
  onSuccess?: () => void;
}

const UpsertPriceSearchTypeForm = ({
  priceSearchType,
  onSuccess,
}: UpsertPriceSearchTypeFormProps) => {
  const [name, setName] = useState(priceSearchType?.name ?? "");
  const [periodicity, setPeriodicity] = useState(
    priceSearchType?.periodicity ?? "",
  );
  const [isActive, setIsActive] = useState(priceSearchType?.isActive ?? true);

  const { execute, status } = useAction(upsertPriceSearchType, {
    onSuccess: (result) => {
      if (result.data?.error) {
        toast.error(result.data.error.message);
        return;
      }
      toast.success(
        priceSearchType
          ? "Tipo atualizado com sucesso!"
          : "Tipo criado com sucesso!",
      );
      onSuccess?.();
      window.location.reload();
    },
    onError: () => {
      toast.error("Erro ao salvar tipo de pesquisa.");
    },
  });

  const handleSubmit = () => {
    if (!name.trim()) {
      toast.error("Informe o nome do tipo.");
      return;
    }
    if (!periodicity.trim()) {
      toast.error("Informe a periodicidade.");
      return;
    }
    execute({
      id: priceSearchType?.id,
      name: name.trim(),
      periodicity: periodicity.trim(),
      isActive,
    });
  };

  return (
    <DialogContent>
      <DialogTitle>
        {priceSearchType ? "Editar tipo de pesquisa" : "Novo tipo de pesquisa"}
      </DialogTitle>
      <DialogDescription>
        {priceSearchType
          ? "Atualize os dados do tipo de pesquisa."
          : "Cadastre um novo tipo para segmentar pesquisas, produtos e fornecedores."}
      </DialogDescription>
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">Nome</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex.: Cesta Básica"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Periodicidade</label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border px-3 py-2"
            value={periodicity}
            onChange={(e) => setPeriodicity(e.target.value)}
            placeholder="Ex.: Mensal, Semestral, Anual"
          />
        </div>
        <div>
          <label className="text-sm font-medium">Tipo ativo</label>
          <div className="border-input bg-background mt-1 flex h-10 items-center gap-2 rounded-md border px-3">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            <span className="text-muted-foreground text-sm">
              Desmarque para inativar sem remover histórico
            </span>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button
          variant="outline"
          onClick={onSuccess}
          disabled={status === "executing"}
        >
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={status === "executing"}>
          {status === "executing" ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : priceSearchType ? (
            "Atualizar"
          ) : (
            "Criar"
          )}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UpsertPriceSearchTypeForm;
