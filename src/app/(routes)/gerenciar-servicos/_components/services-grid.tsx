"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ServiceWithDocuments } from "@/types/content-management";

interface ServicesGridProps {
  services: ServiceWithDocuments[];
}

const ServicesGrid = ({ services }: ServicesGridProps) => {
  if (!services.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum serviço cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {services.map((service) => (
        <Card key={service.id} className="h-full border">
          <CardHeader className="flex flex-row items-start gap-3 border-b pb-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{service.title}</CardTitle>
                <Badge variant={service.isActive ? "default" : "secondary"}>
                  {service.isActive ? "Ativo" : "Inativo"}
                </Badge>
                {service.emphasis && (
                  <Badge variant="secondary">Em destaque</Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/gerenciar-servicos/${service.id}`}>
                <ChevronRight className="h-4 w-4" aria-label="Abrir serviço" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4" />
        </Card>
      ))}
    </div>
  );
};

export default ServicesGrid;
