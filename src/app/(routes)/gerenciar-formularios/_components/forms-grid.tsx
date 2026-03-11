"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type FormWithProjectAndCount = {
  id: string;
  name: string;
  slug: string;
  projectId: string;
  project: { id: string; title: string };
  registrations: { id: string }[];
};

const FormsGrid = ({ forms }: { forms: FormWithProjectAndCount[] }) => {
  if (!forms.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum formulário cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {forms.map((form) => (
        <Card key={form.id} className="h-full border">
          <CardHeader className="flex flex-row items-start justify-between gap-3 border-b pb-4">
            <div className="min-w-0 flex-1">
              <CardTitle className="text-lg">{form.name}</CardTitle>
              <p className="text-muted-foreground mt-1 text-sm">
                Projeto: {form.project?.title ?? "—"}
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {form.registrations.length} inscriç
                {form.registrations.length === 1 ? "ão" : "ões"}
              </p>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/gerenciar-formularios/${form.id}`}>
                <ChevronRight
                  className="h-4 w-4"
                  aria-label="Ver formulário e inscrições"
                />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild variant="outline" className="w-full sm:w-auto">
              <Link href={`/gerenciar-formularios/${form.id}`}>
                Ver inscrições
              </Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FormsGrid;
