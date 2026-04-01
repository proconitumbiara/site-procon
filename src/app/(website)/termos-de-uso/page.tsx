import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import Link from "next/link";

export default function TermosDeUsoPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px] space-y-6">
          <h1 className="text-3xl font-bold">Termos de Uso</h1>
          <p className="text-muted-foreground">
            Ao utilizar este portal, voce concorda com estes termos e com as
            regras de uso aplicaveis aos servicos digitais do Procon Itumbiara.
          </p>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Condicoes gerais</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>Utilizar o site para finalidades licitas e de interesse publico.</li>
              <li>Nao tentar acesso indevido, fraude ou manipulacao do sistema.</li>
              <li>Fornecer informacoes verdadeiras nos formularios disponibilizados.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Privacidade e cookies</h2>
            <p className="text-muted-foreground">
              O uso do portal tambem segue a{" "}
              <Link className="underline" href="/politica-de-privacidade">
                Politica de Privacidade
              </Link>{" "}
              e a{" "}
              <Link className="underline" href="/cookies">
                Politica de Cookies
              </Link>
              .
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-xl font-semibold">Contato</h2>
            <p className="text-muted-foreground">
              Em caso de duvidas, entre em contato por{" "}
              <strong>procon@itumbiara.go.gov.br</strong>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

