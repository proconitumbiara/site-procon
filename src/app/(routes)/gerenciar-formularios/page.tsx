import { headers } from "next/headers";
import { redirect } from "next/navigation";

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

import FormsGrid from "./_components/forms-grid";

export default async function GerenciarFormulariosPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const forms = await db.query.formsTable.findMany({
    with: {
      project: { columns: { id: true, title: true } },
      registrations: { columns: { id: true } },
    },
    orderBy: (form, { desc }) => [desc(form.createdAT)],
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Formulários</PageTitle>
          <PageDescription>
            Gerencie os formulários de inscrição vinculados aos projetos.
          </PageDescription>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <FormsGrid forms={forms} />
      </PageContent>
    </PageContainer>
  );
}
