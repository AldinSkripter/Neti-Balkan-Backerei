import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { Reveal } from "@/components/Reveal";
import { fileUrl } from "@/lib/api";

export default function Gallery() {
  const { settings } = useSettings();
  const images = settings?.gallery_images?.length
    ? settings.gallery_images
    : [];
  const [active, setActive] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="galerie" data-testid="gallery-section" className="bg-cream py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="max-w-2xl">
          <p className="inline-block rounded-full border border-brand-300 bg-brand-100/70 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-800">
            Galerie
          </p>
          <h2 className="mt-6 font-display text-2xl font-bold tracking-tight text-espresso sm:text-3xl lg:text-4xl">
            Einblicke in unsere Bäckerei
          </h2>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
          {images.map((img, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <button
                type="button"
                data-testid={`gallery-image-${i}`}
                onClick={() => setActive(img)}
                className="group block w-full overflow-hidden rounded-3xl shadow-soft transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-lift"
                aria-label={`Bild vergrößern: ${img.alt || "Galeriebild"}`}
              >
                <img
                  src={fileUrl(img.src)}
                  alt={img.alt || "Impression aus der NETI Balkan Bäckerei"}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
              </button>
            </Reveal>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {active && (
          <motion.div
            data-testid="gallery-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={active.alt || "Vergrößertes Bild"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-espresso/90 p-4 backdrop-blur-sm sm:p-10"
            onClick={() => setActive(null)}
          >
            <motion.img
              src={fileUrl(active.src)}
              alt={active.alt || "Impression aus der NETI Balkan Bäckerei"}
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-full max-w-full rounded-2xl object-contain shadow-lift"
            />
            <button
              type="button"
              data-testid="lightbox-close-button"
              onClick={() => setActive(null)}
              aria-label="Schließen"
              className="absolute right-5 top-5 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-cream transition-colors hover:bg-brand-500 hover:text-espresso"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
