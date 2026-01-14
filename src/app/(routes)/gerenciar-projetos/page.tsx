import { desc } from "drizzle-orm";
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

import AddProjectButton from "./_components/add-project-button";
import ProjectsGrid from "./_components/projects-grid";

const ProjetosPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const projects = await db.query.projectsTable.findMany({
    orderBy: (table) => desc(table.createdAT),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Projetos</PageTitle>
          <PageDescription>
            Acompanhe e organize os projetos institucionais.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddProjectButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <ProjectsGrid projects={projects} />
      </PageContent>
    </PageContainer>
  );
};

export default ProjetosPage;
