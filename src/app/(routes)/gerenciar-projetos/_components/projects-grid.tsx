"use client";

import { ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProjectWithDocuments } from "@/types/content-management";

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  draft: "Rascunho",
};

const ProjectsGrid = ({ projects }: { projects: ProjectWithDocuments[] }) => {
  const sortedProjects = useMemo(
    () =>
      [...projects].sort(
        (a, b) =>
          new Date(b.createdAT).getTime() - new Date(a.createdAT).getTime(),
      ),
    [projects],
  );

  if (!projects.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <p className="text-muted-foreground text-sm">
          Nenhum projeto cadastrado até o momento.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {sortedProjects.map((project) => (
        <Card key={project.id} className="h-full border">
          <CardHeader className="flex flex-row items-start gap-3 border-b pb-4">
            {project.coverImageUrl && (
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md border">
                <Image
                  src={project.coverImageUrl}
                  alt={`Capa do projeto ${project.title}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{project.title}</CardTitle>
                {project.emphasis && (
                  <Badge variant="secondary">Em destaque</Badge>
                )}
                <Badge variant="outline">
                  {STATUS_LABELS[project.status] ?? project.status}
                </Badge>
              </div>
            </div>
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/gerenciar-projetos/${project.id}`}>
                <ChevronRight className="h-4 w-4" aria-label="Abrir projeto" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="pt-4" />
        </Card>
      ))}
    </div>
  );
};

export default ProjectsGrid;
