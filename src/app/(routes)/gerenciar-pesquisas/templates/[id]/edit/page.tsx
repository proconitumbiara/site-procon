import Link from "next/link";
import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

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
import { getResearchTemplateById } from "@/lib/data/content";

import UpsertResearchTemplatePageForm from "../../_components/upsert-research-template-page-form";

interface EditResearchTemplatePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditResearchTemplatePage({
  params,
}: EditResearchTemplatePageProps) {
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
    return <AccessDenied />;
  }

  const { id } = await params;
  const template = await getResearchTemplateById(id);

  if (!template) {
    notFound();
  }

  const [products, suppliers, priceSearchTypes] = await Promise.all([
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
                <BreadcrumbPage>Editar template</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageTitle>Editar template de pesquisa</PageTitle>
          <PageDescription>
            Atualize as combinações de produto e fornecedor deste template.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <UpsertResearchTemplatePageForm
          template={{
            id: template.id,
            name: template.name,
            priceSearchTypeId: template.priceSearchTypeId,
            description: template.description,
            isActive: template.isActive,
            items: template.items.map((item) => ({
              productId: item.productId,
              supplierId: item.supplierId,
            })),
          }}
          products={products}
          suppliers={suppliers}
          priceSearchTypes={priceSearchTypes}
        />
      </PageContent>
    </PageContainer>
  );
}
