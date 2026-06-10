"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  categoriesTable,
  priceSearchTypesTable,
  productsTable,
} from "@/db/schema";

import { productsTableColumns } from "./products-table-columns";

type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type Category = typeof categoriesTable.$inferSelect;
type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface ProductsFiltersProps {
  products: Product[];
  categories: Category[];
  priceSearchTypes: PriceSearchType[];
}

export default function ProductsFilters({
  products,
  categories,
  priceSearchTypes,
}: ProductsFiltersProps) {
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        (categoryFilter ? product.categoryId === categoryFilter : true) &&
        (typeFilter ? product.priceSearchTypeId === typeFilter : true),
    );
    // Se não há filtros, ordena por createdAT do mais novo para o mais antigo
    if (!nameFilter && !categoryFilter && !typeFilter) {
      filtered = [...filtered].sort((a, b) => {
        const dateA = new Date(a.createdAT).getTime();
        const dateB = new Date(b.createdAT).getTime();
        return dateB - dateA; // mais novo primeiro
      });
    }
    return filtered;
  }, [products, nameFilter, categoryFilter, typeFilter]);

  const columns = useMemo(
    () => productsTableColumns(categories, priceSearchTypes),
    [categories, priceSearchTypes],
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
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded border p-2 text-sm"
        >
          <option value="" className="bg-background">
            Todas as categorias
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id} className="bg-background">
              {category.name}
            </option>
          ))}
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
            setCategoryFilter("");
            setTypeFilter("");
          }}
          variant="link"
        >
          Resetar filtros
        </Button>
      </div>
      {/* Contador de registros */}
      <div className="text-muted-foreground mb-2 text-sm">
        {filteredProducts.length} registro
        {filteredProducts.length === 1 ? "" : "s"} encontrado
        {filteredProducts.length === 1 ? "" : "s"}
      </div>
      <DataTable data={filteredProducts} columns={columns} />
    </>
  );
}

