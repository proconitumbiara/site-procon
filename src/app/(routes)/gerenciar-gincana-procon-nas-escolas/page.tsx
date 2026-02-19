import { eq } from "drizzle-orm";
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
import { GINCANA_PROJECT_ID } from "@/constants/gincana";
import { db } from "@/db";
import { registrationTable } from "@/db/schema";
import { auth } from "@/lib/auth";

import GincanaInscricoesView from "./_components/inscricoes-table";

const GerenciarGincanaPage = async () => {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        redirect("/auth/sign-in");
    }

    const registrations = await db.query.registrationTable.findMany({
        where: eq(registrationTable.projectId, GINCANA_PROJECT_ID),
        with: {
            guardianAuthorizationDocuments: {
                with: {
                    guardian: true,
                },
            },
        },
        orderBy: (table, { asc }) => [asc(table.participantFullName)],
    });

    return (
        <PageContainer>
            <PageHeader>
                <PageHeaderContent>
                    <PageTitle>Gincana Procon nas Escolas</PageTitle>
                    <PageDescription>
                        Gerencie as inscrições da Gincana Procon nas Escolas.
                    </PageDescription>
                </PageHeaderContent>
            </PageHeader>
            <PageContent>
                <GincanaInscricoesView registrations={registrations} />
            </PageContent>
        </PageContainer>
    );
};

export default GerenciarGincanaPage;
