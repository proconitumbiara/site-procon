import Link from "next/link";

import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import Location from "@/components/website/global/location";
import { companyData } from "@/lib/data/institutional-information";

export const dynamic = 'force-dynamic';

export default async function AberturaDeReclamacaoPage() {
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
                                <BreadcrumbLink asChild>
                                    <Link href="/servicos">Serviços</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage className="line-clamp-1">
                                    Abertura de Reclamação
                                </BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Conteúdo do serviço */}
                    <article className="mx-auto max-w-4xl">
                        {/* Header com ícone, título e descrição */}
                        <div className="mb-6 flex flex-col gap-4 justify-between sm:mb-8 sm:flex-row sm:gap-6">
                            {/* Título e descrição */}
                            <div className="min-w-0 flex-1">
                                <h1 className="text-foreground mb-3 text-2xl font-bold sm:mb-4 sm:text-3xl md:text-4xl">
                                    Abertura de Reclamação
                                </h1>
                                <p className="text-muted-foreground text-base leading-relaxed sm:text-lg">
                                    O serviço de abertura de reclamação do Procon permite que o consumidor registre formalmente problemas relacionados a relações de consumo, como cobrança indevida, produtos com defeito, descumprimento de oferta, serviços não prestados ou outras irregularidades previstas no Código de Defesa do Consumidor.
                                    Após o registro, o Procon analisa a demanda e realiza a intermediação junto à empresa reclamada, buscando uma solução administrativa para o conflito.
                                </p>
                            </div>
                        </div>

                        <div className="space-y-8">
                            <section>
                                <h2 className="mb-3 text-xl font-semibold">Requisitos</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    Para realizar a reclamação, é necessário apresentar documentos pessoais, comprovante de endereço e documentos que comprovem a relação de consumo, como notas fiscais, contratos, faturas ou comprovantes de pagamento.
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-3 text-xl font-semibold">Como solicitar</h2>
                                <p className="text-muted-foreground leading-relaxed">
                                    <strong className="mr-2">1. Reúna a documentação necessária:</strong>
                                    Antes de iniciar o atendimento, tenha em mãos seus documentos pessoais, comprovante de endereço e todos os documentos relacionados ao problema, como nota fiscal, contrato, boletos, faturas, comprovantes de pagamento, conversas, protocolos de atendimento ou qualquer outra prova da relação de consumo. <br /> <br />

                                    <strong className="mr-2">2. Organize as informações do ocorrido:</strong>
                                    Separe os dados principais da reclamação, como nome da empresa, data da compra ou contratação, valor envolvido, descrição do problema e o que já foi tentado para resolver diretamente com o fornecedor. <br /> <br />

                                    <strong className="mr-2">3. Procure o atendimento do Procon:</strong>
                                    Dirija-se ao Procon para registrar sua reclamação. O atendimento poderá ser realizado presencialmente, e em alguns casos também por canais digitais ou telefone, conforme a disponibilidade do órgão em seu município. <br /> <br />

                                    <strong className="mr-2">4. Apresente os documentos e relate o problema:</strong>
                                    No momento do atendimento, entregue a documentação e explique com clareza o ocorrido. É importante informar todos os detalhes para que a reclamação seja registrada corretamente. <br /> <br />

                                    <strong className="mr-2">5. Aguarde a análise e formalização da reclamação:</strong>
                                    Após o atendimento, o Procon fará a análise inicial da documentação e formalizará a reclamação, encaminhando a demanda ao fornecedor para manifestação. <br /> <br />

                                    <strong className="mr-2">6. Acompanhe o andamento do processo:</strong>
                                    Depois do registro, acompanhe os prazos e orientações repassadas pelo Procon. Caso necessário, poderão ser solicitados documentos complementares ou novos esclarecimentos. <br /> <br />

                                    <strong className="mr-2">7. Aguarde a tentativa de solução administrativa</strong>
                                    O Procon atuará na mediação do conflito, buscando uma solução entre consumidor e fornecedor de forma administrativa, com base no Código de Defesa do Consumidor. <br /> <br />
                                </p>
                            </section>

                            <section>
                                <h2 className="mb-3 text-xl font-semibold">
                                    Informações de contato
                                </h2>
                                <div className="text-muted-foreground space-y-2">
                                    <p>
                                        E-mail:{" "}
                                        <a
                                            href={`mailto:${companyData.email}`}
                                            className="text-primary hover:underline"
                                        >
                                            {companyData.email}
                                        </a>
                                    </p>
                                    <p>
                                        Telefone:{" "}
                                        <a
                                            href={`tel:${companyData.phone}`}
                                            className="text-primary hover:underline"
                                        >
                                            {companyData.phone}
                                        </a>
                                    </p>
                                </div>
                                <div className="mt-8">
                                    <Location />
                                </div>
                            </section>
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
        </>
    );
}
