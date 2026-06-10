"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { priceSearchTypesTable } from "@/db/schema";

import { priceSearchTypesTableColumns } from "./price-search-types-table-columns";

type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface PriceSearchTypesFiltersProps {
  priceSearchTypes: PriceSearchType[];
}

export default function PriceSearchTypesFilters({
  priceSearchTypes,
}: PriceSearchTypesFiltersProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredTypes = useMemo(() => {
    return priceSearchTypes.filter((type) => {
      const matchesName = type.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? type.isActive
            : !type.isActive;

      return matchesName && matchesStatus;
    });
  }, [priceSearchTypes, nameFilter, statusFilter]);

  const columns = useMemo(() => priceSearchTypesTableColumns(), []);

  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Buscar por nome"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="all">Todos</option>
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
        </select>
        <Button
          onClick={() => {
            setNameFilter("");
            setStatusFilter("all");
          }}
          variant="link"
        >
          Resetar filtros
        </Button>
      </div>
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredTypes.length} registro
        {filteredTypes.length === 1 ? "" : "s"} encontrado
        {filteredTypes.length === 1 ? "" : "s"}
      </div>
      <DataTable data={filteredTypes} columns={columns} />
    </>
  );
}
