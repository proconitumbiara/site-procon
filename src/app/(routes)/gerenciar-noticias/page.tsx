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

import AddNewsButton from "./_components/add-news-button";
import NewsGrid from "./_components/news-grid";

const NoticiasPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const news = await db.query.newsTable.findMany({
    orderBy: (table) => desc(table.createdAT),
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Notícias</PageTitle>
          <PageDescription>Gerencie as notícias publicadas.</PageDescription>
        </PageHeaderContent>
        <PageActions>
          <AddNewsButton />
        </PageActions>
      </PageHeader>
      <PageContent>
        <NewsGrid news={news} />
      </PageContent>
    </PageContainer>
  );
};

export default NoticiasPage;
