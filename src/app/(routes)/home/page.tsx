import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  BriefcaseBusinessIcon,
  HammerIcon,
  Newspaper,
  Search,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import { AccessDenied } from "@/components/ui/access-denied";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { auth } from "@/lib/auth";

const quickLinks = [
  {
    title: "Pesquisas",
    description: "Gerencie pesquisas de preços e fornecedores",
    url: "/gerenciar-pesquisas",
    icon: Search,
    color: "text-primary",
  },
  {
    title: "Notícias",
    description: "Gerencie as notícias publicadas no site",
    url: "/gerenciar-noticias",
    icon: Newspaper,
    color: "text-primary",
  },
  {
    title: "Projetos",
    description: "Gerencie os projetos do Procon",
    url: "/gerenciar-projetos",
    icon: BriefcaseBusinessIcon,
    color: "text-primary",
  },
  {
    title: "Serviços",
    description: "Gerencie os serviços oferecidos",
    url: "/gerenciar-servicos",
    icon: HammerIcon,
    color: "text-primary",
  },
];

const HomePage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/auth/sign-in");
  }

  const userName = session.user.name || "Usuário";

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 flex size-12 items-center justify-center rounded-lg">
              <Sparkles className="text-primary size-6" />
            </div>
            <div>
              <PageTitle>Bem-vindo, {userName}!</PageTitle>
              <PageDescription>
                Gerencie o conteúdo do site do Procon de forma eficiente
              </PageDescription>
            </div>
          </div>
        </PageHeaderContent>
      </PageHeader>

      <PageContent>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Card
                key={link.title}
                className="group transition-all hover:shadow-md"
              >
                <CardHeader>
                  <div className="bg-muted mb-2 flex size-10 items-center justify-center rounded-lg">
                    <Icon className={`size-5 ${link.color}`} />
                  </div>
                  <CardTitle className="text-lg">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full">
                    <Link href={link.url} className="no-underline">
                      Acessar
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="text-primary size-5" />
              <CardTitle>Visão Geral</CardTitle>
            </div>
            <CardDescription>
              Acesse rapidamente as principais funcionalidades do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Use os cards acima para navegar rapidamente entre as diferentes
              seções de gerenciamento. Cada seção permite criar, editar e
              excluir conteúdo do site.
            </p>
          </CardContent>
        </Card>
      </PageContent>
    </PageContainer>
  );
};

export default HomePage;
