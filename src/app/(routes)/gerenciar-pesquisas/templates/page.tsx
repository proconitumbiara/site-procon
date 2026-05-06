import { asc, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AccessDenied } from "@/components/ui/access-denied";
import {
  PageActions,
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

import AddResearchTemplateButton from "./_components/add-research-template-button";
import ResearchTemplatesFilters from "./_components/research-templates-filters";

const TemplatesPage = async () => {
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

  const [templates, products, suppliers] = await Promise.all([
    db.query.researchTemplatesTable.findMany({
      orderBy: (table) => asc(table.name),
      with: {
        items: {
          with: {
            product: true,
            supplier: true,
          },
          orderBy: (table) => asc(table.sortOrder),
        },
      },
    }),
    db.query.productsTable.findMany({
      orderBy: (table) => asc(table.name),
      with: {
        category: true,
      },
    }),
    db.query.suppliersTable.findMany({
      orderBy: (table) => asc(table.name),
    }),
  ]);

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Templates de pesquisa</PageTitle>
          <PageDescription>
            Gerencie modelos com combinações de produto e fornecedor para
            acelerar o cadastro de pesquisas.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddResearchTemplateButton products={products} suppliers={suppliers} />
        </PageActions>
      </PageHeader>
      <PageContent>
        <ResearchTemplatesFilters
          templates={templates}
          products={products}
          suppliers={suppliers}
        />
      </PageContent>
    </PageContainer>
  );
};

export default TemplatesPage;
