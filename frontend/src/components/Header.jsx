import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, MapPin, Phone } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { logoUrl, mapsUrl, isPlaceholder } from "@/lib/api";
import { scrollToId } from "@/components/SmoothScroll";

const NAV = [
  { hash: "#sortiment", label: "Sortiment", testid: "nav-link-sortiment" },
  { hash: "#ueber-uns", label: "Über uns", testid: "nav-link-ueber-uns" },
  { hash: "#galerie", label: "Galerie", testid: "nav-link-galerie" },
  { hash: "#kontakt", label: "Kontakt", testid: "nav-link-kontakt" },
];

export default function Header() {
  const { settings } = useSettings();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const onDark = location.pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const goTo = (hash) => {
    setOpen(false);
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: hash } });
    } else {
      scrollToId(hash);
    }
  };

  const phone = settings?.contact?.phone;
  const hasPhone = phone && !isPlaceholder(phone);

  return (
    <header
      data-testid="site-header"
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-xl transition-[background-color,box-shadow] duration-300 ${
        scrolled || !onDark
          ? "border-stone-200/80 bg-white/90 shadow-soft"
          : "border-white/10 bg-espresso/40"
      }`}
    >
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          data-testid="header-logo-link"
          onClick={() => goTo("#start")}
          className="flex items-center gap-3"
          aria-label="Zur Startseite"
        >
          <img
            src={logoUrl(settings)}
            alt="Logo der NETI Balkan Bäckerei"
            className="h-11 w-11 rounded-full border-2 border-brand-400 bg-brand-500 object-cover"
            width={44}
            height={44}
          />
          <span
            className={`text-left font-display text-lg font-bold leading-tight transition-colors ${
              scrolled || !onDark ? "text-espresso" : "text-cream"
            }`}
          >
            NETI
            <span className="block text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">
              Balkan Bäckerei
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Hauptnavigation">
          {NAV.map((item) => (
            <button
              key={item.hash}
              type="button"
              data-testid={item.testid}
              onClick={() => goTo(item.hash)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                scrolled || !onDark
                  ? "text-stone-700 hover:bg-brand-100 hover:text-espresso"
                  : "text-cream/90 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
          <a
            data-testid="header-route-button"
            href={mapsUrl(settings)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 inline-flex items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-espresso shadow-soft transition-[transform,background-color] duration-300 hover:scale-[1.03] hover:bg-brand-400 active:scale-[0.98]"
          >
            <MapPin className="h-4 w-4" aria-hidden="true" />
            Route planen
          </a>
        </nav>

        <button
          type="button"
          data-testid="mobile-menu-button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Menü schließen" : "Menü öffnen"}
          className={`flex h-11 w-11 items-center justify-center rounded-full transition-colors lg:hidden ${
            scrolled || !onDark ? "text-espresso hover:bg-brand-100" : "text-cream hover:bg-white/10"
          }`}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-stone-200 bg-cream px-4 pb-6 pt-3 shadow-soft lg:hidden" data-testid="mobile-menu">
          <nav className="flex flex-col" aria-label="Mobile Navigation">
            {NAV.map((item) => (
              <button
                key={item.hash}
                type="button"
                data-testid={`mobile-${item.testid}`}
                onClick={() => goTo(item.hash)}
                className="rounded-xl px-4 py-3.5 text-left text-base font-semibold text-espresso transition-colors hover:bg-brand-100"
              >
                {item.label}
              </button>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 px-1">
            <a
              data-testid="mobile-route-button"
              href={mapsUrl(settings)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-brand-500 px-5 py-3 text-base font-bold text-espresso transition-colors hover:bg-brand-400"
            >
              <MapPin className="h-5 w-5" aria-hidden="true" />
              Route planen
            </a>
            {hasPhone && (
              <a
                data-testid="mobile-call-button"
                href={`tel:${phone.replace(/\s+/g, "")}`}
                className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full border-2 border-espresso/15 bg-white px-5 py-3 text-base font-bold text-espresso transition-colors hover:border-brand-500"
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                Jetzt anrufen
              </a>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
