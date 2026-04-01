import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import Link from "next/link";

export default function PoliticaDePrivacidadePage() {
  return (
    <>
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px] space-y-6">
          <h1 className="text-3xl font-bold">Política de Privacidade</h1>
          <p className="text-muted-foreground">
            Esta política explica como dados pessoais são tratados no site do
            Procon Itumbiara, as finalidades, bases legais e direitos do titular
            previstos na LGPD (Lei n. 13.709/2018).
          </p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Dados que podemos tratar</h2>
            <p className="text-muted-foreground">
              Dados fornecidos em formulários, canais de contato, dados de
              navegação e preferências de cookies.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Finalidades e bases legais</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Prestação de serviços públicos e atendimento ao cidadão.</li>
              <li>Cumprimento de obrigação legal e execução de políticas públicas.</li>
              <li>
                Consentimento para categorias não essenciais de cookies e
                rastreadores.
              </li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Direitos do titular</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Confirmação da existência de tratamento.</li>
              <li>Acesso, correção e atualização de dados.</li>
              <li>Anonimização, bloqueio ou eliminação quando aplicável.</li>
              <li>Revogação de consentimento e informação sobre compartilhamentos.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Cookies e terceiros</h2>
            <p className="text-muted-foreground">
              A gestão de cookies está disponível na página{" "}
              <Link className="underline" href="/cookies">
                Política de Cookies.
              </Link>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Canal de privacidade</h2>
            <p className="text-muted-foreground">
              Para solicitações relacionadas aos seus direitos como titular, entre
              em contato pelo e-mail: <strong>procon@itumbiara.go.gov.br</strong>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

