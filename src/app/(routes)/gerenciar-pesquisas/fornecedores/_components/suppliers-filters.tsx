"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { priceSearchTypesTable, suppliersTable } from "@/db/schema";

import { suppliersTableColumns } from "./suppliers-table-columns";

type Supplier = typeof suppliersTable.$inferSelect;
type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface SuppliersFiltersProps {
  suppliers: Supplier[];
  priceSearchTypes: PriceSearchType[];
}

export default function SuppliersFilters({
  suppliers,
  priceSearchTypes,
}: SuppliersFiltersProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        (typeFilter !== "all" ? supplier.priceSearchTypeId === typeFilter : true),
    );
    // Se não há filtros, ordena por createdAT do mais novo para o mais antigo
    if (!nameFilter && typeFilter === "all") {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAT).getTime();
        const dateB = new Date(b.createdAT).getTime();
        return dateB - dateA; // mais novo primeiro
      });
    }
    return filtered;
  }, [suppliers, nameFilter, typeFilter]);

  const columns = useMemo(
    () => suppliersTableColumns(priceSearchTypes),
    [priceSearchTypes],
  );

  return (
    <>
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        />
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todos os tipos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            {priceSearchTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={() => {
            setNameFilter("");
            setTypeFilter("all");
          }}
          variant="link"
        >
          Resetar filtros
        </Button>
      </div>
      {/* Contador de registros */}
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredSuppliers.length} registro
        {filteredSuppliers.length === 1 ? "" : "s"} encontrado
        {filteredSuppliers.length === 1 ? "" : "s"}
      </div>
      <DataTable data={filteredSuppliers} columns={columns} />
    </>
  );
}
