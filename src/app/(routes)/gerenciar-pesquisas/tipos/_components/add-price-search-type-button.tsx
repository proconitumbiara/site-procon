"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertPriceSearchTypeForm from "./upsert-price-search-type-form";

const AddPriceSearchTypeButton = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Novo tipo
        </Button>
      </DialogTrigger>
      <UpsertPriceSearchTypeForm onSuccess={() => setOpen(false)} />
    </Dialog>
  );
};

export default AddPriceSearchTypeButton;
