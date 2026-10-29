import { Link } from "react-router-dom";
import { useSettings } from "@/components/SettingsContext";
import { logoUrl, isPlaceholder } from "@/lib/api";

export default function Footer() {
  const { settings } = useSettings();
  const c = settings?.contact || {};
  const year = new Date().getFullYear();

  return (
    <footer data-testid="site-footer" className="border-t border-white/10 bg-espresso pb-10 pt-14 text-cream">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="flex items-center gap-4">
            <img
              src={logoUrl(settings)}
              alt="Logo der NETI Balkan Bäckerei"
              className="h-14 w-14 rounded-full border-2 border-brand-400 object-cover"
              width={56}
              height={56}
              loading="lazy"
            />
            <div>
              <p className="font-display text-xl font-bold">NETI Balkan Bäckerei</p>
              <p className="mt-1 text-sm text-stone-400">
                {isPlaceholder(c.address_street) ? (
                  <span className="italic">Adresse folgt in Kürze</span>
                ) : (
                  <>
                    {c.address_street}
                    {!isPlaceholder(c.address_city) && `, ${c.address_city}`}
                  </>
                )}
              </p>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-x-8 gap-y-3" aria-label="Fußzeilen-Navigation">
            <Link
              to="/impressum"
              data-testid="footer-impressum-link"
              className="text-sm font-semibold text-stone-300 transition-colors hover:text-brand-300"
            >
              Impressum
            </Link>
            <Link
              to="/datenschutz"
              data-testid="footer-datenschutz-link"
              className="text-sm font-semibold text-stone-300 transition-colors hover:text-brand-300"
            >
              Datenschutzerklärung
            </Link>
            <Link
              to="/admin/login"
              data-testid="footer-admin-link"
              className="text-sm font-semibold text-stone-500 transition-colors hover:text-brand-300"
            >
              Inhaber-Login
            </Link>
          </nav>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-sm text-stone-500">
          © {year} NETI Balkan Bäckerei. Alle Rechte vorbehalten.
        </div>
      </div>
    </footer>
  );
}
