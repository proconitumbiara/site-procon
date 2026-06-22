"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  researchTemplatesTable,
} from "@/db/schema";

type ResearchTemplate = typeof researchTemplatesTable.$inferSelect & {
  items: Array<{
    id: string;
    productId: string;
    supplierId: string;
    sortOrder: number;
  }>;
};

export const researchTemplatesTableColumns =
  (): ColumnDef<ResearchTemplate>[] => [
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
      <Button variant="outline" size="sm" asChild>
        <Link href={`/gerenciar-pesquisas/templates/${row.original.id}/edit`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>
    ),
  },
];
