import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Croissant, ChevronDown } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { MaskedLine } from "@/components/Reveal";
import { fileUrl, logoUrl } from "@/lib/api";
import { scrollToId } from "@/components/SmoothScroll";

export default function Hero() {
  const { settings } = useSettings();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "22%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.18]);

  const heroImg = fileUrl(settings?.hero_image) || "/assets/hero-burek.webp";

  return (
    <section id="start" ref={ref} data-testid="hero-section" className="relative flex min-h-[100svh] items-end overflow-hidden bg-espresso">
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <img
          src={heroImg}
          alt="Frisch gebackener Burek vor dem Laden der NETI Balkan Bäckerei"
          className="h-full w-full object-cover"
          data-testid="hero-image"
          fetchpriority="high"
        />
      </motion.div>
      <div className="absolute inset-0 bg-espresso/55" aria-hidden="true" />
      <div
        className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/25 to-espresso/30"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-28 pt-40 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <img
            src={logoUrl(settings)}
            alt=""
            aria-hidden="true"
            className="h-24 w-24 rounded-full border-4 border-brand-400 object-cover shadow-lift sm:h-28 sm:w-28"
            width={112}
            height={112}
          />
        </motion.div>

        <p className="hero-mask-line mb-5">
          <motion.span
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-400/60 bg-espresso/50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-brand-300 backdrop-blur-sm"
          >
            <Croissant className="h-3.5 w-3.5" aria-hidden="true" />
            Bäckerei · Grill · Herzlich willkommen
          </motion.span>
        </p>

        <h1 className="max-w-3xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-cream sm:text-5xl lg:text-6xl">
          <MaskedLine delay={0.3}>Frisch gebacken.</MaskedLine>
          <MaskedLine delay={0.45}>
            <em className="text-brand-300">Ehrlich gut.</em>
          </MaskedLine>
        </h1>

        <div className="hero-mask-line mt-6 max-w-xl">
          <motion.p
            initial={{ y: "115%" }}
            animate={{ y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-base leading-relaxed text-stone-200 md:text-lg"
          >
            Burek &amp; Pite, Pizza, Burger, Brot &amp; Brötchen sowie Ćevapčići vom Grill –
            herzhafte Balkan-Spezialitäten und klassische Backwaren an einem Ort.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center"
        >
          <button
            type="button"
            data-testid="hero-sortiment-button"
            onClick={() => scrollToId("#sortiment")}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-base font-bold text-espresso shadow-lift transition-[transform,background-color] duration-300 hover:scale-[1.03] hover:bg-brand-400 active:scale-[0.98]"
          >
            Unser Sortiment
          </button>
          <button
            type="button"
            data-testid="hero-location-button"
            onClick={() => scrollToId("#kontakt")}
            className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-full border-2 border-cream/40 px-8 py-3.5 text-base font-bold text-cream backdrop-blur-sm transition-[background-color,border-color] duration-300 hover:border-brand-300 hover:bg-white/10 active:scale-[0.98]"
          >
            <MapPin className="h-5 w-5" aria-hidden="true" />
            So finden Sie uns
          </button>
        </motion.div>
      </div>

      <motion.button
        type="button"
        onClick={() => scrollToId("#sortiment")}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-1 text-cream/70 transition-colors hover:text-brand-300 md:flex"
        aria-label="Nach unten scrollen"
        data-testid="hero-scroll-cue"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.3em]">Entdecken</span>
        <motion.span animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </motion.span>
      </motion.button>
    </section>
  );
}
