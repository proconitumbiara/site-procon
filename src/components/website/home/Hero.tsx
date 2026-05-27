import Image from "next/image";

interface HeroProps {
  title?: string;
  description?: string;
  popularSearches?: string[];
  onSearch?: (query: string) => void;
}

export default function Hero({
  title = "Bem-vindo ao Portal do Procon Itumbiara",
  onSearch,
}: HeroProps) {
  return (
    <section
      id="inicio"
      className="relative flex w-full items-center justify-center py-8 sm:py-12 lg:py-16"
      aria-labelledby="hero-title"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-border relative mx-auto max-w-7xl overflow-hidden rounded-2xl border shadow-sm sm:rounded-3xl">
          {/* Background Image */}
          <div className="relative aspect-video sm:aspect-16/8 lg:aspect-16/7">
            {/* Overlay para melhorar legibilidade do texto */}


            {/* Content */}
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
              <div className="flex w-full max-w-4xl flex-col items-center justify-center">
                <Image src="/LogoHorizontal.png" alt="Procon" width={800} height={800} className="object-contain" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
