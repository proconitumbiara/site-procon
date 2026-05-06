"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  categoriesTable,
  productsTable,
  researchTemplatesTable,
  suppliersTable,
} from "@/db/schema";

import UpsertResearchTemplateForm from "./upsert-research-template-form";

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

export const researchTemplatesTableColumns = (
  products: Product[],
  suppliers: Supplier[],
): ColumnDef<ResearchTemplate>[] => [
  {
    id: "name",
    accessorKey: "name",
    header: "Nome",
  },
  {
    id: "slug",
    accessorKey: "slug",
    header: "Slug",
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
    id: "itemsCount",
    header: "Itens",
    cell: ({ row }) => row.original.items.length,
  },
  {
    id: "actions",
    header: "Ações",
    cell: ({ row }) => (
      <ResearchTemplateActions
        template={row.original}
        products={products}
        suppliers={suppliers}
      />
    ),
  },
];

function ResearchTemplateActions({
  template,
  products,
  suppliers,
}: {
  template: ResearchTemplate;
  products: Product[];
  suppliers: Supplier[];
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <UpsertResearchTemplateForm
        template={template}
        products={products}
        suppliers={suppliers}
        onSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
}
