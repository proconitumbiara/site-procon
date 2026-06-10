"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
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
  const [typeFilter, setTypeFilter] = useState("");

  const filteredSuppliers = useMemo(() => {
    let filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        (typeFilter ? supplier.priceSearchTypeId === typeFilter : true),
    );
    // Se não há filtros, ordena por createdAT do mais novo para o mais antigo
    if (!nameFilter && !typeFilter) {
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
        <Button
          onClick={() => {
            setNameFilter("");
            setTypeFilter("");
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
