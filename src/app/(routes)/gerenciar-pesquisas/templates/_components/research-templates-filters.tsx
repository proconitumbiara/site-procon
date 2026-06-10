"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  categoriesTable,
  priceSearchTypesTable,
  productsTable,
  researchTemplatesTable,
  suppliersTable,
} from "@/db/schema";

import { researchTemplatesTableColumns } from "./research-templates-table-columns";

type Supplier = typeof suppliersTable.$inferSelect;
type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type ResearchTemplate = typeof researchTemplatesTable.$inferSelect & {
  items: Array<{
    id: string;
    productId: string;
    supplierId: string;
    sortOrder: number;
    product: typeof productsTable.$inferSelect;
    supplier: typeof suppliersTable.$inferSelect;
  }>;
};

type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface ResearchTemplatesFiltersProps {
  templates: ResearchTemplate[];
  products: Product[];
  suppliers: Supplier[];
  priceSearchTypes: PriceSearchType[];
}

const ResearchTemplatesFilters = ({
  templates,
  products,
  suppliers,
  priceSearchTypes,
}: ResearchTemplatesFiltersProps) => {
  const [nameFilter, setNameFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesName = template.name
        .toLowerCase()
        .includes(nameFilter.toLowerCase());
      const matchesStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "active"
            ? template.isActive
            : !template.isActive;
      const matchesType = typeFilter
        ? template.priceSearchTypeId === typeFilter
        : true;

      return matchesName && matchesStatus && matchesType;
    });
  }, [templates, nameFilter, statusFilter, typeFilter]);

  const columns = useMemo(
    () => researchTemplatesTableColumns(products, suppliers, priceSearchTypes),
    [products, suppliers, priceSearchTypes],
  );

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
            setStatusFilter("all");
            setTypeFilter("");
          }}
          variant="link"
        >
          Resetar filtros
        </Button>
      </div>
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredTemplates.length} registro
        {filteredTemplates.length === 1 ? "" : "s"} encontrado
        {filteredTemplates.length === 1 ? "" : "s"}
      </div>
      <DataTable data={filteredTemplates} columns={columns} />
    </>
  );
};

export default ResearchTemplatesFilters;
