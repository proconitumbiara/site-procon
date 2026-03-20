import Link from "next/link";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import ServiceCard from "@/components/website/cards/ServiceCard";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";

const SERVICES: Array<{
  id: string;
  title: string;
  description: string;
  href: string;
}> = [
  {
    id: "abertura-de-reclamacao",
    title: "Abertura de Reclamação",
    description:
      "O serviço de abertura de reclamação do Procon permite que o consumidor registre formalmente problemas relacionados a relações de consumo e acompanhe a mediação para buscar uma solução administrativa.",
    href: "/servicos/abertura-de-reclamacao",
  },
  {
    id: "denuncia",
    title: "Denúncia",
    description:
      "Registre uma denúncia sobre situações que possam violar direitos do consumidor. Após o envio, o Procon orienta os próximos passos conforme o caso.",
    href: "/formularios/registrar-denuncia",
  },
];

export default function ServicosPage() {
  return (
    <>
      <Header />
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Início</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Serviços</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Título da página */}
          <div className="mb-8">
            <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
              Todos os Serviços
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Conheça os serviços oferecidos pelo Procon Itumbiara para proteger
              e defender os direitos dos consumidores
            </p>
          </div>

          {/* Grid de serviços */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => (
                <ServiceCard
                  key={service.id}
                  id={service.id}
                  title={service.title}
                  description={service.description}
                  href={service.href}
                />
              ))}
            </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
