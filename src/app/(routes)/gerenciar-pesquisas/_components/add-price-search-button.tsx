"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  categoriesTable,
  priceSearchTypesTable,
  productsTable,
  researchTemplatesTable,
  suppliersTable,
} from "@/db/schema";

import UpsertPriceSearchForm from "./upsert-price-search-form";

type Supplier = typeof suppliersTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;
type Product = typeof productsTable.$inferSelect & {
  category: Category;
};
type Template = typeof researchTemplatesTable.$inferSelect & {
  items: Array<{
    productId: string;
    supplierId: string;
    product: typeof productsTable.$inferSelect;
    supplier: typeof suppliersTable.$inferSelect;
  }>;
};
type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface AddPriceSearchButtonProps {
  priceSearchTypes: PriceSearchType[];
  suppliers: Supplier[];
  categories: Category[];
  products: Product[];
  templates: Template[];
}

const AddPriceSearchButton = ({
  priceSearchTypes,
  suppliers,
  categories,
  products,
  templates,
}: AddPriceSearchButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Nova pesquisa
        </Button>
      </DialogTrigger>
      <UpsertPriceSearchForm
        priceSearchTypes={priceSearchTypes}
        suppliers={suppliers}
        categories={categories}
        products={products}
        templates={templates}
        onSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
};

export default AddPriceSearchButton;


