import Link from "next/link";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { registrationTable } from "@/db/schema";
import { getFormById } from "@/lib/data/content";
import { auth } from "@/lib/auth";

import InscricoesView from "../_components/inscricoes-view";
import UpsertFormForm from "../_components/upsert-form-form";

interface FormPageProps {
  params: Promise<{ id: string }>;
}

export default async function FormPage({ params }: FormPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;
  const form = await getFormById(id);

  if (!form) {
    notFound();
  }

  const registrations = await db.query.registrationTable.findMany({
    where: eq(registrationTable.formId, id),
    with: {
      guardianAuthorizationDocuments: {
        with: { guardian: true },
      },
    },
    orderBy: (table, { asc }) => [asc(table.participantFullName)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/gerenciar-formularios">Formulários</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{form.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageTitle>{form.name}</PageTitle>
          <PageDescription>
            Edite o formulário e visualize as inscrições. Projeto:{" "}
            {form.project?.title ?? "—"}
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent className="flex flex-col gap-6">
        <section className="shrink-0 rounded-lg border bg-muted/30 px-4 py-3">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Dados do formulário</h2>
          <UpsertFormForm form={form} embedded />
        </section>
        <section className="min-h-0 flex-1">
          <h2 className="mb-3 text-lg font-semibold">Inscrições</h2>
          <InscricoesView registrations={registrations} />
        </section>
      </PageContent>
    </PageContainer>
  );
}
