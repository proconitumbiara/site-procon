import { asc, eq } from "drizzle-orm";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/ui/access-denied";
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
import { usersTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import UpsertResearchTemplatePageForm from "../_components/upsert-research-template-page-form";

const loadTemplateFormData = () =>
  Promise.all([
    db.query.productsTable.findMany({
      orderBy: (table) => asc(table.name),
      with: { category: true },
    }),
    db.query.suppliersTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
    db.query.priceSearchTypesTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
  ]);

async function ensureAdministrator() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const user = await db.query.usersTable.findFirst({
    where: eq(usersTable.id, session.user.id),
  });

  if (user?.role !== "administrator") {
    return null;
  }

  return session;
}

export default async function NewResearchTemplatePage() {
  const session = await ensureAdministrator();

  if (!session) {
    return <AccessDenied />;
  }

  const [products, suppliers, priceSearchTypes] = await loadTemplateFormData();

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/gerenciar-pesquisas/templates">
                    Templates
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Novo template</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageTitle>Novo template de pesquisa</PageTitle>
          <PageDescription>
            Defina combinações de produto e fornecedor para reutilizar em novas
            pesquisas.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <UpsertResearchTemplatePageForm
          products={products}
          suppliers={suppliers}
          priceSearchTypes={priceSearchTypes}
        />
      </PageContent>
    </PageContainer>
  );
}
