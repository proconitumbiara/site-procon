import Section from "@/components/website/global/Section";

import { RegistrarDenunciaForm } from "./_components/registrar-denuncia-form";

export default function RegistrarDenunciaPage() {
  return (
    <main id="main-content" role="main" aria-label="Conteúdo principal">
      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 flex flex-col items-center bg-">
        <Section
          id="registrar-denuncia"
          title="Formulário de Denúncia - PROCON"
          description="Preencha os campos abaixo para solicitar fiscalização. Ao enviar, seus dados serão encaminhados ao órgão competente."
          variant="default"
        >
          <RegistrarDenunciaForm />
        </Section>
      </div>
    </main>
  );
}

