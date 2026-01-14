import { asc } from "drizzle-orm";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

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
import { auth } from "@/lib/auth";

import AddServiceButton from "./_components/add-service-button";
import ServicesGrid from "./_components/services-grid";

const ServicosPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const services = await db.query.servicesTable.findMany({
    orderBy: (table) => asc(table.title),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Serviços</PageTitle>
          <PageDescription>
            Controle os serviços disponibilizados ao cidadão.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddServiceButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <ServicesGrid services={services} />
      </PageContent>
    </PageContainer>
  );
};

export default ServicosPage;
