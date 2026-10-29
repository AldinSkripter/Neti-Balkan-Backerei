import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useSettings } from "@/components/SettingsContext";

export default function LegalPage({ title, field, testid, intro }) {
  const { settings } = useSettings();
  const text = settings?.[field] || "";

  return (
    <div data-testid={`${testid}-page`} className="min-h-screen bg-cream">
      <Header />
      <main className="mx-auto max-w-3xl px-4 pb-24 pt-36 sm:px-6 lg:px-8">
        <Link
          to="/"
          data-testid={`${testid}-back-link`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition-colors hover:text-brand-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Zurück zur Startseite
        </Link>
        <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-espresso sm:text-4xl">
          {title}
        </h1>
        {intro && <p className="mt-4 text-sm text-stone-500">{intro}</p>}
        <div
          data-testid={`${testid}-content`}
          className="mt-10 whitespace-pre-line rounded-3xl border border-stone-200 bg-white p-6 text-base leading-relaxed text-stone-700 shadow-soft sm:p-10"
        >
          {text}
        </div>
      </main>
      <Footer />
    </div>
  );
}
