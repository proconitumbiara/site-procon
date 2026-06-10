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
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredProducts = useMemo(() => {
    let filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(nameFilter.toLowerCase()) &&
        (categoryFilter !== "all" ? product.categoryId === categoryFilter : true) &&
        (typeFilter !== "all" ? product.priceSearchTypeId === typeFilter : true),
    );
    // Se não há filtros, ordena por createdAT do mais novo para o mais antigo
    if (!nameFilter && categoryFilter === "all" && typeFilter === "all") {
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
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
            setCategoryFilter("all");
            setTypeFilter("all");
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

