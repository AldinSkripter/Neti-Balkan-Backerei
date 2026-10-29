import { useSettings } from "@/components/SettingsContext";
import { Reveal } from "@/components/Reveal";
import { fileUrl } from "@/lib/api";

export default function Sortiment() {
  const { settings } = useSettings();
  const categories = settings?.categories?.length ? settings.categories : [];
  const withItems = categories.filter((c) => c.items?.length > 0);

  return (
    <section id="sortiment" data-testid="sortiment-section" className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="inline-block rounded-full border border-brand-300 bg-brand-100/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-800">
            Unser Sortiment
          </p>
          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-espresso sm:text-3xl lg:text-4xl">
            Für jeden Geschmack etwas dabei
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-600">
            Von knusprigem Burek über frische Pizza bis zu Ćevapčići vom Grill –
            entdecken Sie unsere fünf Bereiche.
          </p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {categories.map((cat, i) => (
            <Reveal
              key={cat.id}
              delay={i * 0.08}
              className={i === 0 ? "md:col-span-2 lg:col-span-2" : ""}
            >
              <article
                data-testid={`category-card-${cat.id}`}
                className={`group relative overflow-hidden rounded-3xl shadow-soft transition-[transform,box-shadow] duration-500 ease-out hover:-translate-y-1.5 hover:shadow-lift ${
                  i === 0 ? "h-80 sm:h-96" : "h-72 sm:h-80"
                }`}
              >
                <img
                  src={fileUrl(cat.image) || "/assets/hero-burek.webp"}
                  alt={`${cat.name} bei der NETI Balkan Bäckerei`}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/30 to-transparent"
                  aria-hidden="true"
                />
                <div className="absolute inset-x-0 bottom-0 p-6 lg:p-8">
                  <span className="mb-3 inline-block h-1 w-10 rounded-full bg-brand-400" aria-hidden="true" />
                  <h3 className="font-display text-xl font-bold text-cream sm:text-2xl">{cat.name}</h3>
                  {cat.tagline && (
                    <p className="mt-1.5 text-sm text-stone-200">{cat.tagline}</p>
                  )}
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {withItems.length > 0 && (
          <Reveal className="mt-16">
            <div
              data-testid="menu-list"
              className="rounded-3xl border border-brand-200 bg-brand-50 p-6 sm:p-10"
            >
              <h3 className="font-display text-xl font-bold text-espresso sm:text-2xl">
                Aus unserer Theke
              </h3>
              <div className="mt-8 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
                {withItems.map((cat) => (
                  <div key={cat.id}>
                    <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-brand-700">
                      {cat.name}
                    </h4>
                    <ul className="mt-4 space-y-4">
                      {cat.items.map((item, idx) => (
                        <li
                          key={idx}
                          data-testid={`menu-item-${cat.id}-${idx}`}
                          className="border-b border-brand-200/70 pb-3"
                        >
                          <div className="flex items-baseline justify-between gap-3">
                            <span className="font-semibold text-espresso">{item.name}</span>
                            {item.price && (
                              <span className="shrink-0 font-mono text-sm font-bold text-brand-700">
                                {item.price}
                              </span>
                            )}
                          </div>
                          {item.description && (
                            <p className="mt-1 text-sm text-stone-500">{item.description}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
