"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import UpsertFormForm from "@/app/(routes)/gerenciar-formularios/_components/upsert-form-form";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

interface AddFormButtonProps {
  projectId: string;
}

export default function AddFormButton({ projectId }: AddFormButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <UpsertFormForm
        projectId={projectId}
        onSuccess={() => setOpen(false)}
        embedded={false}
      />
    </Dialog>
  );
}
