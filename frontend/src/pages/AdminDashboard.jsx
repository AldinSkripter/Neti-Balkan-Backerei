import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LogOut, Save, ExternalLink, Upload, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { api, API } from "@/lib/api";
import { useSettings } from "@/components/SettingsContext";
import { logoUrl } from "@/lib/api";

const TABS = [
  { id: "kontakt", label: "Kontakt & Zeiten" },
  { id: "branding", label: "Logo & Favicon" },
  { id: "sortiment", label: "Sortiment" },
  { id: "texte", label: "Texte" },
  { id: "recht", label: "Impressum & Datenschutz" },
];

const Field = ({ label, testid, ...props }) => (
  <div>
    <label className="mb-1.5 block text-sm font-semibold text-espresso">{label}</label>
    <input
      data-testid={testid}
      {...props}
      className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-white px-4 text-base text-espresso transition-colors focus:border-brand-500"
    />
  </div>
);

export default function AdminDashboard() {
  const { settings, refresh } = useSettings();
  const navigate = useNavigate();
  const [tab, setTab] = useState("kontakt");
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.get("/auth/me").catch(() => navigate("/admin/login")).finally(() => setChecking(false));
  }, [navigate]);

  useEffect(() => {
    if (settings && !form) {
      setForm(JSON.parse(JSON.stringify(settings)));
    }
  }, [settings, form]);

  if (checking || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <p className="text-stone-500">Wird geladen …</p>
      </div>
    );
  }

  const set = (path, value) => {
    setForm((prev) => {
      const next = JSON.parse(JSON.stringify(prev));
      const keys = path.split(".");
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
      obj[keys[keys.length - 1]] = value;
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        hero_image: form.hero_image,
        gallery_images: form.gallery_images,
        contact: form.contact,
        opening_hours: form.opening_hours,
        categories: form.categories,
        about_text: form.about_text,
        impressum_text: form.impressum_text,
        datenschutz_text: form.datenschutz_text,
      };
      await api.put("/settings", payload);
      await refresh();
      toast.success("Änderungen gespeichert");
    } catch (err) {
      if (err.response?.status === 401) {
        navigate("/admin/login");
        return;
      }
      toast.error("Speichern fehlgeschlagen. Bitte erneut versuchen.");
    } finally {
      setSaving(false);
    }
  };

  const upload = async (kind, file, onDone) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    try {
      const { data } = await api.post(`/upload?kind=${kind}`, fd);
      toast.success("Bild hochgeladen");
      await refresh();
      if (onDone) onDone(data.url);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Upload fehlgeschlagen");
    }
  };

  const logout = async () => {
    await api.post("/auth/logout").catch(() => {});
    navigate("/admin/login");
  };

  return (
    <div data-testid="admin-dashboard" className="min-h-screen bg-cream">
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <img src={logoUrl(settings)} alt="" className="h-10 w-10 rounded-full border-2 border-brand-400 object-cover" />
            <div>
              <p className="font-display text-lg font-bold leading-tight text-espresso">Inhaber-Bereich</p>
              <p className="text-xs text-stone-500">NETI Balkan Bäckerei</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/"
              data-testid="admin-view-site-link"
              className="hidden items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold text-stone-600 transition-colors hover:bg-brand-100 sm:inline-flex"
            >
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
              Website ansehen
            </Link>
            <button
              type="button"
              data-testid="admin-save-button"
              onClick={save}
              disabled={saving}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-brand-500 px-5 py-2.5 text-sm font-bold text-espresso transition-colors hover:bg-brand-400 disabled:opacity-60"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? "Speichert …" : "Speichern"}
            </button>
            <button
              type="button"
              data-testid="admin-logout-button"
              onClick={logout}
              aria-label="Abmelden"
              className="flex h-11 w-11 items-center justify-center rounded-full text-stone-500 transition-colors hover:bg-red-50 hover:text-red-600"
            >
              <LogOut className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6" aria-label="Bereiche">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              data-testid={`admin-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                tab === t.id ? "bg-espresso text-cream" : "text-stone-600 hover:bg-brand-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {tab === "kontakt" && (
          <div className="space-y-8" data-testid="admin-kontakt-panel">
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-espresso">Adresse &amp; Kontakt</h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field label="Straße und Hausnummer" testid="admin-input-street" value={form.contact.address_street} onChange={(e) => set("contact.address_street", e.target.value)} placeholder="z. B. Musterstraße 12" />
                <Field label="PLZ und Ort" testid="admin-input-city" value={form.contact.address_city} onChange={(e) => set("contact.address_city", e.target.value)} placeholder="z. B. 12345 Musterstadt" />
                <Field label="Telefon" testid="admin-input-phone" value={form.contact.phone} onChange={(e) => set("contact.phone", e.target.value)} placeholder="z. B. 0123 456789" />
                <Field label="E-Mail" testid="admin-input-email" value={form.contact.email} onChange={(e) => set("contact.email", e.target.value)} placeholder="z. B. info@neti-balkan.de" />
                <div className="sm:col-span-2">
                  <Field label="Google-Maps-Link (optional)" testid="admin-input-maps" value={form.contact.maps_url} onChange={(e) => set("contact.maps_url", e.target.value)} placeholder="Leer lassen: Link wird aus der Adresse erzeugt" />
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-espresso">Öffnungszeiten</h2>
              <div className="mt-6 space-y-4">
                {form.opening_hours.map((h, i) => (
                  <div key={i} className="grid gap-4 sm:grid-cols-2">
                    <Field label="Tage" testid={`admin-hours-days-${i}`} value={h.days} onChange={(e) => set(`opening_hours.${i}.days`, e.target.value)} />
                    <Field label="Zeiten" testid={`admin-hours-time-${i}`} value={h.hours} onChange={(e) => set(`opening_hours.${i}.hours`, e.target.value)} placeholder="z. B. 06:00 – 18:00 Uhr" />
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === "branding" && (
          <div className="grid gap-8 sm:grid-cols-2" data-testid="admin-branding-panel">
            {[
              { kind: "logo", title: "Logo", desc: "Wird im Kopfbereich, Hero und in der Fußzeile angezeigt.", path: form.logo_storage_path ? `${API}/files/${form.logo_storage_path}` : "/assets/logo.png" },
              { kind: "favicon", title: "Favicon", desc: "Kleines Symbol im Browser-Tab.", path: form.favicon_storage_path ? `${API}/files/${form.favicon_storage_path}` : "/assets/favicon-512.png" },
            ].map((b) => (
              <section key={b.kind} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
                <h2 className="font-display text-xl font-bold text-espresso">{b.title}</h2>
                <p className="mt-1 text-sm text-stone-500">{b.desc}</p>
                <div className="mt-6 flex items-center gap-5">
                  <img src={b.path} alt={`Aktuelles ${b.title}`} className="h-20 w-20 rounded-2xl border border-stone-200 bg-brand-100 object-cover" />
                  <label
                    data-testid={`admin-upload-${b.kind}`}
                    className="inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-full border-2 border-brand-500 px-5 py-2.5 text-sm font-bold text-espresso transition-colors hover:bg-brand-100"
                  >
                    <Upload className="h-4 w-4" aria-hidden="true" />
                    Neues Bild wählen
                    <input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml,image/x-icon" className="sr-only" onChange={(e) => upload(b.kind, e.target.files?.[0])} />
                  </label>
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === "sortiment" && (
          <div className="space-y-8" data-testid="admin-sortiment-panel">
            {form.categories.map((cat, ci) => (
              <section key={cat.id} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Kategorie" testid={`admin-cat-name-${ci}`} value={cat.name} onChange={(e) => set(`categories.${ci}.name`, e.target.value)} />
                  <Field label="Kurzbeschreibung" testid={`admin-cat-tagline-${ci}`} value={cat.tagline} onChange={(e) => set(`categories.${ci}.tagline`, e.target.value)} />
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-brand-700">Produkte</h3>
                    <button
                      type="button"
                      data-testid={`admin-cat-add-item-${ci}`}
                      onClick={() => set(`categories.${ci}.items`, [...cat.items, { name: "", description: "", price: "" }])}
                      className="inline-flex min-h-[44px] items-center gap-1.5 rounded-full bg-brand-100 px-4 py-2 text-sm font-bold text-brand-800 transition-colors hover:bg-brand-200"
                    >
                      <Plus className="h-4 w-4" aria-hidden="true" />
                      Produkt hinzufügen
                    </button>
                  </div>

                  {cat.items.length === 0 && (
                    <p className="mt-4 rounded-xl bg-cream px-4 py-3 text-sm italic text-stone-500">
                      Noch keine Produkte eingetragen – auf der Website wird nur die Kategorie angezeigt.
                    </p>
                  )}

                  <div className="mt-4 space-y-4">
                    {cat.items.map((item, ii) => (
                      <div key={ii} className="rounded-2xl border border-stone-200 bg-cream p-4">
                        <div className="grid gap-4 sm:grid-cols-[2fr_2fr_1fr_auto]">
                          <Field label="Name" testid={`admin-item-name-${ci}-${ii}`} value={item.name} onChange={(e) => set(`categories.${ci}.items.${ii}.name`, e.target.value)} placeholder="z. B. Burek mit Käse" />
                          <Field label="Beschreibung (optional)" testid={`admin-item-desc-${ci}-${ii}`} value={item.description} onChange={(e) => set(`categories.${ci}.items.${ii}.description`, e.target.value)} />
                          <Field label="Preis (optional)" testid={`admin-item-price-${ci}-${ii}`} value={item.price} onChange={(e) => set(`categories.${ci}.items.${ii}.price`, e.target.value)} placeholder="z. B. 3,50 €" />
                          <button
                            type="button"
                            data-testid={`admin-item-delete-${ci}-${ii}`}
                            onClick={() => set(`categories.${ci}.items`, cat.items.filter((_, x) => x !== ii))}
                            aria-label="Produkt entfernen"
                            className="mt-7 flex h-11 w-11 items-center justify-center rounded-full text-stone-400 transition-colors hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        )}

        {tab === "texte" && (
          <div className="space-y-8" data-testid="admin-texte-panel">
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-espresso">Vorstellung („Über uns“)</h2>
              <p className="mt-1 text-sm text-stone-500">Kurzer Text über die Bäckerei auf der Startseite.</p>
              <textarea
                data-testid="admin-about-text"
                rows={5}
                value={form.about_text}
                onChange={(e) => set("about_text", e.target.value)}
                className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base leading-relaxed text-espresso transition-colors focus:border-brand-500"
              />
            </section>
          </div>
        )}

        {tab === "recht" && (
          <div className="space-y-8" data-testid="admin-recht-panel">
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-espresso">Impressum</h2>
              <p className="mt-1 text-sm text-stone-500">
                Tragen Sie hier die offiziellen Angaben ein (registrierter Name, Rechtsform, Inhaber, Adresse, Kontakt, USt-IdNr. falls vorhanden).
              </p>
              <textarea
                data-testid="admin-impressum-text"
                rows={14}
                value={form.impressum_text}
                onChange={(e) => set("impressum_text", e.target.value)}
                className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-espresso transition-colors focus:border-brand-500"
              />
            </section>
            <section className="rounded-3xl border border-stone-200 bg-white p-6 shadow-soft sm:p-8">
              <h2 className="font-display text-xl font-bold text-espresso">Datenschutzerklärung</h2>
              <p className="mt-1 text-sm text-stone-500">
                Die Vorlage beschreibt die tatsächliche Datenverarbeitung dieser Website (Hosting/Server-Logs, Kontakt per Telefon/E-Mail, keine Tracker). Ergänzen Sie die Firmendaten und den Hosting-Anbieter.
              </p>
              <textarea
                data-testid="admin-datenschutz-text"
                rows={18}
                value={form.datenschutz_text}
                onChange={(e) => set("datenschutz_text", e.target.value)}
                className="mt-4 w-full rounded-xl border border-stone-300 bg-white px-4 py-3 font-mono text-sm leading-relaxed text-espresso transition-colors focus:border-brand-500"
              />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
