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

import UsersGrid from "./_components/users-grid";
import GenerateRegistrationCodeButton from "./_components/generate-registration-code-button";

const UsuariosPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  // Verificar se o usuário é administrador
  const user = await db.query.usersTable.findFirst({
    where: (table, { eq }) => eq(table.id, session.user.id),
  });

  if (user?.role !== "administrator") {
    redirect("/home");
  }

  const users = await db.query.usersTable.findMany({
    orderBy: (table) => asc(table.name),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Usuários</PageTitle>
          <PageDescription>
            Gerencie os usuários do sistema e suas permissões.
          </PageDescription>
          <div className="mt-4 flex justify-end">
            <GenerateRegistrationCodeButton />
          </div>
        </PageHeaderContent>
      </PageHeader>
      <PageContent>
        <UsersGrid users={users} />
      </PageContent>
    </PageContainer>
  );
};

export default UsuariosPage;
