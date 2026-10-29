import { Flame, Wheat, HeartHandshake } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { Reveal } from "@/components/Reveal";

const FEATURES = [
  { icon: Flame, title: "Täglich frisch", text: "Unser Sortiment wird täglich frisch für Sie zubereitet." },
  { icon: Wheat, title: "Balkan & Klassiker", text: "Von Burek und Pite bis zu Brot, Brötchen und Pizza." },
  { icon: HeartHandshake, title: "Herzlich willkommen", text: "Freundlich, unkompliziert – zum Mitnehmen oder vor Ort." },
];

export default function About() {
  const { settings } = useSettings();

  return (
    <section id="ueber-uns" data-testid="about-section" className="bg-cream py-20 lg:py-32">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-8">
        <Reveal className="relative">
          <div className="relative">
            <div className="absolute -left-4 -top-4 h-full w-full rounded-[2rem] border-2 border-brand-400" aria-hidden="true" />
            <img
              src="/assets/store-dusk.webp"
              alt="Beleuchteter Eingang der NETI Balkan Bäckerei am Abend"
              loading="lazy"
              width={1400}
              height={1050}
              data-testid="about-image"
              className="relative aspect-[4/3] w-full rounded-[2rem] object-cover shadow-soft"
            />
            <div className="absolute -bottom-6 -right-3 rounded-2xl bg-espresso px-6 py-4 text-cream shadow-soft sm:-right-6">
              <p className="font-display text-2xl font-bold text-brand-400">NETI</p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">Balkan Bäckerei</p>
            </div>
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="inline-block rounded-full border border-brand-300 bg-brand-100/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-800">
              Willkommen bei NETI
            </p>
            <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-espresso sm:text-3xl lg:text-4xl">
              Ihre Balkan Bäckerei in der Nachbarschaft
            </h2>
            <p className="mt-6 text-base leading-relaxed text-stone-600" data-testid="about-text">
              {settings?.about_text ||
                "Die NETI Balkan Bäckerei bringt die Aromen des Balkans in Ihre Nähe – freundlich, unkompliziert und frisch."}
            </p>
          </Reveal>

          <div className="mt-10 space-y-6">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={0.1 + i * 0.1}>
                <div className="flex items-start gap-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-espresso shadow-soft">
                    <f.icon className="h-6 w-6" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-espresso">{f.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-stone-500">{f.text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
