import Link from "next/link";
import { asc } from "drizzle-orm";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";

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
import { auth } from "@/lib/auth";
import { getPriceSearchById } from "@/lib/data/content";

import UpsertPriceSearchPageForm from "../../_components/upsert-price-search-page-form";

interface EditPriceSearchPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPriceSearchPage({
  params,
}: EditPriceSearchPageProps) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const { id } = await params;
  const priceSearch = await getPriceSearchById(id);

  if (!priceSearch) {
    notFound();
  }

  const [priceSearchTypes, suppliers, products, templates] = await Promise.all([
    db.query.priceSearchTypesTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
    db.query.suppliersTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
    db.query.productsTable.findMany({
      orderBy: (table) => asc(table.name),
      with: { category: true },
    }),
    db.query.researchTemplatesTable.findMany({
      orderBy: (table) => asc(table.name),
      where: (table, { eq }) => eq(table.isActive, true),
      with: {
        items: {
          orderBy: (table) => asc(table.sortOrder),
        },
      },
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
                  <Link href="/gerenciar-pesquisas">Pesquisas</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Editar pesquisa</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageTitle>Editar pesquisa de preços</PageTitle>
          <PageDescription>
            Atualize os dados e preços desta pesquisa na grade.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <UpsertPriceSearchPageForm
          priceSearch={priceSearch}
          priceSearchTypes={priceSearchTypes}
          suppliers={suppliers}
          products={products}
          templates={templates}
        />
      </PageContent>
    </PageContainer>
  );
}
