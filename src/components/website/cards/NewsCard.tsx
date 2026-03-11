import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NewsCardProps {
  id: string | number;
  title: string;
  image: string;
  description: string;
  slug: string;
  imageAlt?: string;
  publishedAt?: string | Date;
  status?: "published" | "draft";
  emphasis?: boolean;
}

export default function NewsCard({
  title,
  image,
  description,
  imageAlt,
  slug,
  publishedAt,
  status,
  id,
  emphasis,
}: NewsCardProps) {
  const altText = imageAlt || title;
  const href = slug ? `/noticias/${slug}` : `/noticias/${id}`;
  const publishedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("pt-BR")
    : null;
  const isPublished = status === "published";

  return (
    <div className="bg-card border-border group hover:border-primary flex h-full flex-col rounded-lg border p-6 transition-all duration-300 hover:shadow-lg">
      <div className="flex flex-row gap-3">
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={image}
            alt={altText}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="64px"
          />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-foreground group-hover:text-primary text-xl font-semibold transition-colors duration-300">
              {title}
            </h3>
            {emphasis && (
              <Badge variant="secondary">Em destaque</Badge>
            )}
            <Badge variant={isPublished ? "default" : "secondary"}>
              {isPublished ? "Publicado" : "Rascunho"}
            </Badge>
          </div>
          {isPublished && publishedDate && (
            <p className="text-muted-foreground mt-1 text-sm">
              Publicado em: {publishedDate}
            </p>
          )}
        </div>
      </div>
      <p className="text-muted-foreground group-hover:text-foreground/80 mb-4 mt-3 grow text-sm transition-colors duration-300 line-clamp-2">
        {description}
      </p>
      <Button
        asChild
        variant="outline"
        className="group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary mt-auto w-full transition-all duration-300 group-hover:scale-105"
      >
        <Link href={href} className="no-underline">
          Ler Mais
        </Link>
      </Button>
    </div>
  );
}
