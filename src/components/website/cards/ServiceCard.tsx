import { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ServiceCardProps {
  id: string | number;
  name: string;
  description: string;
  slug: string;
  href?: string;
  status?: "active" | "inactive";
  emphasis?: boolean;
  icon?: LucideIcon;
  order?: number;
}

export default function ServiceCard({
  id,
  name,
  description,
  slug,
  href,
  status = "active",
  emphasis,
  icon: Icon,
  order,
}: ServiceCardProps) {
  const cardHref = href || `/servicos/${slug}`;

  if (status === "inactive") {
    return null;
  }

  return (
    <div
      className="bg-card border-border group hover:border-primary relative flex h-full flex-col overflow-hidden rounded-lg border p-6 transition-all duration-300 hover:shadow-lg"
      data-service-id={id}
      data-order={order}
    >
      {Icon && (
        <Icon
          className="text-muted-foreground/10 group-hover:text-primary/20 absolute bottom-0 left-0 h-22 w-22 -translate-x-6 translate-y-6 transition-all duration-300 group-hover:scale-110"
          aria-hidden="true"
        />
      )}
      <div className="relative z-10 mb-2 flex flex-wrap items-center gap-2">
        <h3 className="text-foreground group-hover:text-primary text-xl font-semibold transition-colors duration-300">
          {name}
        </h3>
        {emphasis && (
          <Badge variant="secondary">Em destaque</Badge>
        )}
        <Badge variant={status === "active" ? "default" : "secondary"}>
          {status === "active" ? "Ativo" : "Inativo"}
        </Badge>
      </div>
      <p className="text-muted-foreground group-hover:text-foreground/80 relative z-10 mb-4 grow text-sm transition-colors duration-300 line-clamp-2">
        {description}
      </p>
      <div className="relative z-10 mt-auto flex justify-end">
        <Button
          asChild
          variant="outline"
          className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 group-hover:scale-105"
        >
          <Link href={cardHref} className="no-underline">
            Acessar
          </Link>
        </Button>
      </div>
    </div>
  );
}
