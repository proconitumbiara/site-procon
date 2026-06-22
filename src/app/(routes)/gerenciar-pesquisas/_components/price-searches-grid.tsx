"use client";

import { ChevronDown, ChevronUp, Pencil } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { priceSearchTypesTable } from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCentavosToBRL, formatDate } from "@/lib/formatters";
import { PriceSearchWithRelations } from "@/types/content-management";

type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface PriceSearchesGridProps {
  priceSearches: PriceSearchWithRelations[];
  priceSearchTypes: PriceSearchType[];
}

const PriceSearchesGrid = ({
  priceSearches,
  priceSearchTypes,
}: PriceSearchesGridProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [typeFilter, setTypeFilter] = useState("");

  const filteredPriceSearches = useMemo(() => {
    return priceSearches.filter((search) =>
      typeFilter ? search.priceSearchTypeId === typeFilter : true,
    );
  }, [priceSearches, typeFilter]);

  const getTypeName = (typeId: string) =>
    priceSearchTypes.find((type) => type.id === typeId)?.name ?? "-";

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  if (!priceSearches.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma pesquisa cadastrada até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="">Todos os tipos</option>
          {priceSearchTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
        {typeFilter && (
          <Button variant="link" onClick={() => setTypeFilter("")}>
            Resetar filtros
          </Button>
        )}
        <span className="text-muted-foreground text-sm">
          {filteredPriceSearches.length} pesquisa
          {filteredPriceSearches.length === 1 ? "" : "s"} encontrada
          {filteredPriceSearches.length === 1 ? "" : "s"}
        </span>
      </div>

      {filteredPriceSearches.length === 0 && (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground text-sm">
            Nenhuma pesquisa encontrada para o filtro selecionado.
          </p>
        </div>
      )}

      {filteredPriceSearches.map((search) => {
        const isExpanded = expandedIds.has(search.id);
        return (
          <Card key={search.id} className="border">
            <CardHeader
              className={`flex flex-col gap-4 pb-4 lg:flex-row lg:items-start lg:justify-between ${
                isExpanded ? "border-b" : ""
              }`}
            >
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-xl">{search.title}</CardTitle>
                  <Badge variant="outline">
                    {getTypeName(search.priceSearchTypeId)}
                  </Badge>
                  <Badge variant="outline">{search.year}</Badge>
                  {search.emphasis && (
                    <Badge variant="secondary">Em destaque</Badge>
                  )}
                </div>
                <CardDescription>{search.slug}</CardDescription>
                {search.summary && (
                  <p className="text-muted-foreground text-sm">
                    {search.summary}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleExpand(search.id)}
                  className="flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-4 w-4" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-4 w-4" />
                      Expandir
                    </>
                  )}
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/gerenciar-pesquisas/${search.id}/edit`}>
                    <Pencil className="h-4 w-4" />
                    Editar
                  </Link>
                </Button>
              </div>
            </CardHeader>
            {isExpanded && (
              <CardContent className="space-y-6 pt-4">
                <div className="grid gap-2 text-sm">
                  <div className="text-muted-foreground flex justify-between">
                    <span>Itens cadastrados</span>
                    <span className="text-foreground font-medium">
                      {search.items.length}
                    </span>
                  </div>
                  {search.collectionDate && (
                    <div className="text-muted-foreground flex justify-between">
                      <span>Data da coleta</span>
                      <span>{formatDate(search.collectionDate)}</span>
                    </div>
                  )}
                  <div className="text-muted-foreground flex justify-between">
                    <span>Criada em</span>
                    <span>{formatDate(search.createdAT)}</span>
                  </div>
                  <div className="text-muted-foreground flex justify-between">
                    <span>Atualizada em</span>
                    <span>{formatDate(search.updatedAt)}</span>
                  </div>
                </div>
                {search.observation && (
                  <div className="border-primary bg-muted/50 rounded-lg border-l-4 p-4">
                    <p className="mb-2 text-sm font-semibold">Observação:</p>
                    <p className="text-muted-foreground text-sm">
                      {search.observation}
                    </p>
                  </div>
                )}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Produtos e preços</h4>
                  </div>
                  {search.items.length === 0 ? (
                    <p className="text-muted-foreground text-sm">
                      Nenhum item vinculado.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Produto</TableHead>
                            <TableHead>Fornecedor</TableHead>
                            <TableHead>Categoria</TableHead>
                            <TableHead>Preço</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {search.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">
                                {item.product.name}
                              </TableCell>
                              <TableCell>{item.supplier.name}</TableCell>
                              <TableCell>
                                {item.product.category.name}
                              </TableCell>
                              <TableCell>
                                {formatCentavosToBRL(item.price)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

export default PriceSearchesGrid;
