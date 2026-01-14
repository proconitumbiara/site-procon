"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  categoriesTable,
  productsTable,
  suppliersTable,
} from "@/db/schema";

import UpsertPriceSearchForm from "./upsert-price-search-form";

type Supplier = typeof suppliersTable.$inferSelect;
type Category = typeof categoriesTable.$inferSelect;
type Product = typeof productsTable.$inferSelect & {
  category: Category;
};

interface AddPriceSearchButtonProps {
  suppliers: Supplier[];
  categories: Category[];
  products: Product[];
}

const AddPriceSearchButton = ({
  suppliers,
  categories,
  products,
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
        suppliers={suppliers}
        categories={categories}
        products={products}
        onSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
};

export default AddPriceSearchButton;


