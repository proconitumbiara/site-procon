"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { priceSearchTypesTable } from "@/db/schema";

import UpsertSupplierForm from "./upsert-supplier-form";

type PriceSearchType = typeof priceSearchTypesTable.$inferSelect;

interface AddSupplierButtonProps {
  priceSearchTypes: PriceSearchType[];
}

const AddSupplierButton = ({ priceSearchTypes }: AddSupplierButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo fornecedor
        </Button>
      </DialogTrigger>
      <UpsertSupplierForm
        priceSearchTypes={priceSearchTypes}
        onSuccess={() => setOpen(false)}
      />
    </Dialog>
  );
};

export default AddSupplierButton;

