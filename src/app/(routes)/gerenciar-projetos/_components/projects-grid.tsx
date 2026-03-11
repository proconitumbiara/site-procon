"use client";

import { ChevronRight, FileText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import AddFormButton from "@/app/(routes)/gerenciar-projetos/_components/add-form-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { FormRecord } from "@/lib/data/content";
import type { ProjectRecord } from "@/lib/data/content";

type ProjectWithForms = ProjectRecord & { forms: FormRecord[] };

const STATUS_LABELS: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  draft: "Rascunho",
};

const ProjectsGrid = ({ projects }: { projects: ProjectWithForms[] }) => {
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {sortedProjects.map((project) => (
        <Card key={project.id} className="h-full border">
          <CardHeader className="flex flex-row items-start gap-3 pb-4">
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
          <CardFooter className="flex flex-col items-stretch gap-3 border-t pt-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-muted-foreground text-sm font-medium">
                Formulários
              </span>
              <AddFormButton projectId={project.id} />
            </div>
            {project.forms?.length ? (
              <ul className="flex flex-col gap-1">
                {project.forms.map((form) => (
                  <li key={form.id}>
                    <Link
                      href={`/gerenciar-formularios/${form.id}`}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-foreground hover:bg-muted"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      {form.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-sm">
                Nenhum formulário vinculado.
              </p>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default ProjectsGrid;
