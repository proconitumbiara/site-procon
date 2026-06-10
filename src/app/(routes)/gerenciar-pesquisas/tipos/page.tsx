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

import AddPriceSearchTypeButton from "./_components/add-price-search-type-button";
import PriceSearchTypesFilters from "./_components/price-search-types-filters";

const TiposPesquisaPage = async () => {
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

  const priceSearchTypes = await db.query.priceSearchTypesTable.findMany({
    orderBy: (table) => asc(table.name),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Tipos de pesquisa</PageTitle>
          <PageDescription>
            Gerencie os tipos para segmentar pesquisas, produtos, fornecedores e
            templates.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddPriceSearchTypeButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <PriceSearchTypesFilters priceSearchTypes={priceSearchTypes} />
      </PageContent>
    </PageContainer>
  );
};

export default TiposPesquisaPage;
