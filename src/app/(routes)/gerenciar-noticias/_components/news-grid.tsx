"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { newsTable } from "@/db/schema";

const DEFAULT_NEWS_IMAGE = "/LogoHorizontal.png";

interface NewsGridProps {
  news: (typeof newsTable.$inferSelect)[];
}

const NewsGrid = ({ news }: NewsGridProps) => {
  if (!news.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhuma notícia cadastrada até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {news.map((item) => (
        <Card key={item.id} className="h-full border">
          <CardHeader className="flex flex-row items-start gap-3 border-b pb-4">
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
              <Image
                src={item.coverImageUrl || DEFAULT_NEWS_IMAGE}
                alt={`Capa da notícia ${item.title}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{item.title}</CardTitle>
                <Badge variant={item.isPublished ? "default" : "secondary"}>
                  {item.isPublished ? "Publicado" : "Rascunho"}
                </Badge>
                {item.emphasis && (
                  <Badge variant="secondary">Em destaque</Badge>
                )}
              </div>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/gerenciar-noticias/${item.id}`}>
                <ChevronRight className="h-4 w-4" aria-label="Abrir notícia" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4" />
        </Card>
      ))}
    </div>
  );
};

export default NewsGrid;
