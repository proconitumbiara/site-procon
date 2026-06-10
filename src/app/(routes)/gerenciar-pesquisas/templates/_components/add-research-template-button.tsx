"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  categoriesTable,
  priceSearchTypesTable,
  productsTable,
  suppliersTable,
} from "@/db/schema";

import UpsertResearchTemplateForm from "./upsert-research-template-form";

type Supplier = typeof suppliersTable.$inferSelect;
type Product = typeof productsTable.$inferSelect & {
  category: typeof categoriesTable.$inferSelect;
};
type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface AddResearchTemplateButtonProps {
  suppliers: Supplier[];
  products: Product[];
  priceSearchTypes: PriceSearchType[];
}

const AddResearchTemplateButton = ({
  suppliers,
  products,
  priceSearchTypes,
}: AddResearchTemplateButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo template
        </Button>
      </DialogTrigger>
      <UpsertResearchTemplateForm
        suppliers={suppliers}
        products={products}
        priceSearchTypes={priceSearchTypes}
        onSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
};

export default AddResearchTemplateButton;
