import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, LogIn } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useSettings } from "@/components/SettingsContext";
import { logoUrl } from "@/lib/api";

function formatApiErrorDetail(detail) {
  if (detail == null) return "Etwas ist schiefgelaufen. Bitte erneut versuchen.";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export default function AdminLogin() {
  const { settings } = useSettings();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/login", { email, password });
      toast.success("Erfolgreich angemeldet");
      navigate("/admin");
    } catch (err) {
      setError(formatApiErrorDetail(err.response?.data?.detail) || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div data-testid="admin-login-page" className="flex min-h-screen items-center justify-center bg-espresso px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md"
      >
        <div className="rounded-3xl bg-white p-8 shadow-lift sm:p-10">
          <div className="flex items-center gap-4">
            <img
              src={logoUrl(settings)}
              alt="Logo der NETI Balkan Bäckerei"
              className="h-14 w-14 rounded-full border-2 border-brand-400 object-cover"
            />
            <div>
              <h1 className="font-display text-2xl font-bold text-espresso">Inhaber-Bereich</h1>
              <p className="text-sm text-stone-500">NETI Balkan Bäckerei</p>
            </div>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="admin-email" className="mb-1.5 block text-sm font-semibold text-espresso">
                E-Mail
              </label>
              <input
                id="admin-email"
                data-testid="admin-login-email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-cream px-4 text-base text-espresso transition-colors focus:border-brand-500"
              />
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-sm font-semibold text-espresso">
                Passwort
              </label>
              <input
                id="admin-password"
                data-testid="admin-login-password"
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="min-h-[48px] w-full rounded-xl border border-stone-300 bg-cream px-4 text-base text-espresso transition-colors focus:border-brand-500"
              />
            </div>

            {error && (
              <p data-testid="admin-login-error" role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              data-testid="admin-login-submit"
              disabled={loading}
              className="inline-flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-base font-bold text-espresso transition-[transform,background-color] duration-300 hover:bg-brand-400 active:scale-[0.98] disabled:opacity-60"
            >
              <LogIn className="h-5 w-5" aria-hidden="true" />
              {loading ? "Wird angemeldet …" : "Anmelden"}
            </button>
          </form>

          <Link
            to="/"
            data-testid="admin-login-back-link"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-stone-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Zurück zur Website
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
