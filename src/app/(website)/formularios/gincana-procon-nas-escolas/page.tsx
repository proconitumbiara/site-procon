import { notFound } from "next/navigation";

import Section from "@/components/website/global/Section";
import Image from "next/image";
import { getFormBySlug } from "@/lib/data/content";

import { GincanaRegistrationForm } from "./_components/gincana-registration-form";

const GINCANA_FORM_SLUG = "gincana-procon-nas-escolas";

export default async function GincanaProconNasEscolasPage() {
  const form = await getFormBySlug(GINCANA_FORM_SLUG);

  if (!form || !form.isActive) {
    notFound();
  }

  return (
    <>
      <main id="main-content" role="main" aria-label="Conteúdo principal">
        <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 flex flex-col items-center bg-">
          <Image
            src="/LogoGincanaProcon.png"
            alt="Gincana Procon nas Escolas"
            width={500}
            height={500}
            className="mx-auto h-auto max-h-48 w-auto mix-blend-multiply md:mx-0 md:max-h-48"
          />
          <div className="mb-4">
            <h1 className="text-foreground mb-2 text-3xl font-bold sm:text-4xl">
              Inscrição - Gincana Procon nas Escolas
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg">
              Preencha os dados abaixo para realizar sua inscrição no projeto.
            </p>
          </div>

          <Section
            id="inscricao"
            title="Formulário de inscrição"
            description="Preencha todos os campos e aceite os termos para finalizar."
          >
            <GincanaRegistrationForm formId={form.id} />
          </Section>
        </div>
      </main>
    </>
  );
}
