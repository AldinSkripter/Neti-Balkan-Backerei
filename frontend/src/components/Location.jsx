import { MapPin, Phone, Mail, Clock, ExternalLink } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { Reveal } from "@/components/Reveal";
import { mapsUrl, isPlaceholder } from "@/lib/api";

const Value = ({ v, muted = false }) =>
  isPlaceholder(v) ? (
    <span className="italic text-stone-400">Wird in Kürze ergänzt</span>
  ) : (
    <span className={muted ? "text-stone-300" : ""}>{v}</span>
  );

export default function Location() {
  const { settings } = useSettings();
  const c = settings?.contact || {};
  const hours = settings?.opening_hours || [];
  const hasPhone = c.phone && !isPlaceholder(c.phone);
  const hasEmail = c.email && !isPlaceholder(c.email);

  return (
    <section id="kontakt" data-testid="location-section" className="bg-espresso py-20 text-cream lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="inline-block rounded-full border border-brand-500/50 bg-brand-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-300">
            Standort &amp; Kontakt
          </p>
          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
            So finden Sie uns
          </h2>
          <p className="mt-4 text-base leading-relaxed text-stone-300">
            Schauen Sie vorbei – wir freuen uns auf Ihren Besuch.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="grid h-full gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <MapPin className="h-6 w-6 text-brand-400" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">Adresse</h3>
                <p className="mt-2 leading-relaxed text-stone-300" data-testid="contact-address">
                  <Value v={c.address_street} muted />
                  <br />
                  <Value v={c.address_city} muted />
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <Clock className="h-6 w-6 text-brand-400" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">Öffnungszeiten</h3>
                <ul className="mt-2 space-y-2" data-testid="opening-hours-list">
                  {hours.map((h, i) => (
                    <li key={i} className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="text-stone-300">{h.days}</span>
                      <span className="text-right font-mono text-brand-200">
                        {isPlaceholder(h.hours) ? (
                          <span className="font-sans italic text-stone-400">folgt</span>
                        ) : (
                          h.hours
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <Phone className="h-6 w-6 text-brand-400" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">Telefon</h3>
                <p className="mt-2">
                  {hasPhone ? (
                    <a
                      data-testid="contact-phone-link"
                      href={`tel:${c.phone.replace(/\s+/g, "")}`}
                      className="text-stone-200 underline decoration-brand-500 decoration-2 underline-offset-4 transition-colors hover:text-brand-300"
                    >
                      {c.phone}
                    </a>
                  ) : (
                    <span className="italic text-stone-400">Wird in Kürze ergänzt</span>
                  )}
                </p>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
                <Mail className="h-6 w-6 text-brand-400" aria-hidden="true" />
                <h3 className="mt-4 text-lg font-semibold">E-Mail</h3>
                <p className="mt-2 break-all">
                  {hasEmail ? (
                    <a
                      data-testid="contact-email-link"
                      href={`mailto:${c.email}`}
                      className="text-stone-200 underline decoration-brand-500 decoration-2 underline-offset-4 transition-colors hover:text-brand-300"
                    >
                      {c.email}
                    </a>
                  ) : (
                    <span className="italic text-stone-400">Wird in Kürze ergänzt</span>
                  )}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between gap-8 rounded-3xl bg-brand-500 p-8 text-espresso lg:p-10">
              <div>
                <h3 className="font-display text-2xl font-bold sm:text-3xl">Auf dem Weg zu uns?</h3>
                <p className="mt-3 text-base leading-relaxed text-espresso/80">
                  Planen Sie Ihre Route bequem über Google Maps – der Link öffnet sich in
                  einem neuen Tab.
                </p>
              </div>
              <div className="space-y-3">
                <a
                  data-testid="location-route-button"
                  href={mapsUrl(settings)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-espresso px-8 py-3.5 text-base font-bold text-cream transition-[transform,background-color] duration-300 hover:scale-[1.02] hover:bg-stone-800 active:scale-[0.98]"
                >
                  <MapPin className="h-5 w-5" aria-hidden="true" />
                  Route planen
                  <ExternalLink className="h-4 w-4 opacity-70" aria-hidden="true" />
                </a>
                {hasPhone && (
                  <a
                    data-testid="location-call-button"
                    href={`tel:${c.phone.replace(/\s+/g, "")}`}
                    className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full border-2 border-espresso/25 px-8 py-3.5 text-base font-bold text-espresso transition-colors hover:border-espresso active:scale-[0.98]"
                  >
                    <Phone className="h-5 w-5" aria-hidden="true" />
                    Jetzt anrufen
                  </a>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
