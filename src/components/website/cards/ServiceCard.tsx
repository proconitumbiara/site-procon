import { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import IconButtonLink from "../global/IconButtonLink";

interface ServiceCardProps {
  id?: string | number;
  title: string;
  description: string;
  href: string;
  status?: "active" | "inactive";
  emphasis?: boolean;
  icon?: LucideIcon;
  order?: number;
}

export default function ServiceCard({
  id,
  title,
  description,
  href,
  status = "active",
  icon: Icon,
  order,
}: ServiceCardProps) {
  if (status === "inactive") {
    return null;
  }

  const isDenuncia = href === "/formularios/registrar-denuncia";

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
      <div className="relative z-10 mb-2">
        <h3 className="text-foreground group-hover:text-primary text-xl font-semibold transition-colors duration-300">
          {title}
        </h3>
      </div>
      <p className="text-muted-foreground group-hover:text-foreground/80 relative z-10 mb-4 grow text-sm transition-colors duration-300 line-clamp-2">
        {description}
      </p>
      <div className="relative z-10 mt-auto flex justify-between">

        {isDenuncia && (
          <div className="shrink-0">
            <IconButtonLink
              label="Registrar denúncia"
              url={href}
            />
          </div>
        )}

        {!isDenuncia && (
          <Button
            asChild
            variant="outline"
            className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-300 group-hover:scale-105"
          >
            <Link href={href} className="no-underline">
              Ver mais
            </Link>
          </Button>
        )}

      </div>
    </div>
  );
}
