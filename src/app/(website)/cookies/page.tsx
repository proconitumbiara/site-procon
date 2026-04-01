import Footer from "@/components/website/global/Footer";
import Header from "@/components/website/global/Header";
import AlterarPreferenciasButton from "@/components/cookies/AlterarPreferenciasButton";
import { cookieRegistry } from "@/data/cookieRegistry";

export default function CookiesPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[900px] space-y-6">
          <h1 className="text-3xl font-bold">Política de Cookies</h1>
          <p className="text-muted-foreground">
            Esta página descreve como utilizamos cookies no portal do Procon
            Itumbiara, as categorias disponíveis e como você pode alterar sua
            decisão de consentimento a qualquer momento.
          </p>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Categorias de cookies</h2>
            <ul className="list-disc space-y-2 pl-6">
              <li>
                <strong>Essenciais:</strong> necessários para funcionamento básico
                e armazenamento da sua escolha de consentimento.
              </li>
              <li>
                <strong>Funcionais:</strong> melhoram a experiência de uso, sem
                serem estritamente indispensáveis.
              </li>
              <li>
                <strong>Analytics:</strong> medem tráfego e desempenho (previstos
                para Google Analytics/Google Tag Manager).
              </li>
              <li>
                <strong>Marketing:</strong> usados para campanhas e remarketing
                (previsto para Meta Pixel/Facebook).
              </li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Registro técnico de cookies</h2>
            <div className="overflow-x-auto rounded-md border">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="p-3">Categoria</th>
                    <th className="p-3">Provedor</th>
                    <th className="p-3">Cookie(s)</th>
                    <th className="p-3">Finalidade</th>
                    <th className="p-3">Base legal</th>
                    <th className="p-3">Retenção</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieRegistry.map((entry) => (
                    <tr key={`${entry.provider}-${entry.cookieName}`} className="border-t">
                      <td className="p-3 capitalize">{entry.category}</td>
                      <td className="p-3">{entry.provider}</td>
                      <td className="p-3">{entry.cookieName}</td>
                      <td className="p-3">{entry.purpose}</td>
                      <td className="p-3">{entry.legalBasis}</td>
                      <td className="p-3">{entry.retention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-semibold">Gerenciar preferências</h2>
            <p className="text-muted-foreground">
              Você pode revisar, revogar e definir novamente suas preferências de
              cookies a qualquer momento.
            </p>
            <AlterarPreferenciasButton />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

