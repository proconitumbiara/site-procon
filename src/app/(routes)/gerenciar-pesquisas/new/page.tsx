import { asc } from "drizzle-orm";
import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

import UpsertPriceSearchPageForm from "../_components/upsert-price-search-page-form";

async function loadPriceSearchFormData() {
  return Promise.all([
    db.query.priceSearchTypesTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
    db.query.suppliersTable.findMany({
      orderBy: (table) => asc(table.name),
      where: (table, { eq }) => eq(table.isActive, true),
    }),
    db.query.productsTable.findMany({
      orderBy: (table) => asc(table.name),
      where: (table, { eq }) => eq(table.isActive, true),
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
}

export default async function NewPriceSearchPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const [priceSearchTypes, suppliers, products, templates] =
    await loadPriceSearchFormData();

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
                <BreadcrumbPage>Nova pesquisa</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <PageTitle>Nova pesquisa de preços</PageTitle>
          <PageDescription>
            Cadastre uma nova pesquisa preenchendo os preços na grade.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <UpsertPriceSearchPageForm
          priceSearchTypes={priceSearchTypes}
          suppliers={suppliers}
          products={products}
          templates={templates}
        />
      </PageContent>
    </PageContainer>
  );
}
