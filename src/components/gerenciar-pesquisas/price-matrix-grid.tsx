"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  makeMatrixKey,
  STRUCTURE_CHECKED,
  type MatrixState,
} from "@/lib/price-matrix-utils";
import { cn } from "@/lib/utils";

type Product = {
  id: string;
  name: string;
  category: { name: string };
};

type Supplier = {
  id: string;
  name: string;
};

interface PriceMatrixGridProps {
  mode: "prices" | "structure";
  suppliers: Supplier[];
  products: Product[];
  matrix: MatrixState;
  onChange: (key: string, value: string) => void;
  highlightedKeys?: Set<string>;
}

const sortProducts = (products: Product[]) =>
  [...products].sort((a, b) => {
    const categoryCompare = a.category.name.localeCompare(b.category.name);
    if (categoryCompare !== 0) return categoryCompare;
    return a.name.localeCompare(b.name);
  });

const sortSuppliers = (suppliers: Supplier[]) =>
  [...suppliers].sort((a, b) => a.name.localeCompare(b.name));

export default function PriceMatrixGrid({
  mode,
  suppliers,
  products,
  matrix,
  onChange,
  highlightedKeys,
}: PriceMatrixGridProps) {
  const sortedProducts = sortProducts(products);
  const sortedSuppliers = sortSuppliers(suppliers);

  if (!sortedProducts.length || !sortedSuppliers.length) {
    return (
      <div className="text-muted-foreground rounded-lg border border-dashed p-8 text-center text-sm">
        Selecione um tipo de pesquisa com produtos e fornecedores cadastrados.
      </div>
    );
  }

  return (
    <div className="max-h-[60vh] max-w-full overflow-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="bg-background sticky left-0 z-20 min-w-[180px]">
              Fornecedor
            </TableHead>
            {sortedProducts.map((product) => (
              <TableHead
                key={product.id}
                className="min-w-[120px] text-center align-bottom"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground text-xs font-normal">
                    {product.category.name}
                  </span>
                  <span className="text-xs font-medium">{product.name}</span>
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedSuppliers.map((supplier) => (
            <TableRow key={supplier.id}>
              <TableCell className="bg-background sticky left-0 z-10 font-medium">
                {supplier.name}
              </TableCell>
              {sortedProducts.map((product) => {
                const key = makeMatrixKey(supplier.id, product.id);
                const isHighlighted = highlightedKeys?.has(key);

                return (
                  <TableCell
                    key={product.id}
                    className={cn(
                      "p-1 text-center",
                      isHighlighted && "bg-primary/5 ring-primary/30 ring-1 ring-inset",
                    )}
                  >
                    {mode === "structure" ? (
                      <div className="flex justify-center">
                        <Checkbox
                          checked={matrix[key] === STRUCTURE_CHECKED}
                          onCheckedChange={(checked) =>
                            onChange(key, checked ? STRUCTURE_CHECKED : "")
                          }
                        />
                      </div>
                    ) : (
                      <Input
                        value={matrix[key] ?? ""}
                        onChange={(event) => onChange(key, event.target.value)}
                        placeholder="0,00"
                        className="mx-auto h-8 w-24 text-center text-sm"
                      />
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
