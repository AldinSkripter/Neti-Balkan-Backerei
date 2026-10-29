import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MapPin, Croissant, ChevronDown, Flame } from "lucide-react";
import { useSettings } from "@/components/SettingsContext";
import { MaskedLine } from "@/components/Reveal";
import { logoUrl } from "@/lib/api";
import { scrollToId } from "@/components/SmoothScroll";

export default function Hero() {
  const { settings } = useSettings();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const bgScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.14]);
  const cardY = useTransform(scrollYProgress, [0, 1], ["0%", "-30%"]);

  return (
    <section id="start" ref={ref} data-testid="hero-section" className="relative flex min-h-[100svh] items-center overflow-hidden bg-espresso">
      <motion.div className="absolute inset-0" style={{ y: bgY, scale: bgScale }}>
        <img
          src="/assets/store-dusk.webp"
          alt="Beleuchteter Laden der NETI Balkan Bäckerei am Abend"
          className="h-full w-full object-cover object-[center_38%]"
          data-testid="hero-image"
          fetchpriority="high"
        />
      </motion.div>
      <div
        className="absolute inset-0 bg-gradient-to-r from-espresso/90 via-espresso/45 to-espresso/15"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-espresso/85 via-transparent to-espresso/30"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl items-center gap-14 px-4 pb-24 pt-36 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10 lg:px-8">
        <div>
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
              className="h-20 w-20 rounded-full border-4 border-brand-400 object-cover shadow-lift sm:h-24 sm:w-24"
              width={96}
              height={96}
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

          <h1 className="max-w-2xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-cream sm:text-5xl lg:text-6xl">
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

        <motion.div
          initial={{ opacity: 0, y: 48, rotate: 4 }}
          animate={{ opacity: 1, y: 0, rotate: 2 }}
          transition={{ duration: 1, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
          style={{ y: cardY }}
          className="relative mx-auto mt-2 w-full max-w-md lg:mt-0 lg:max-w-none"
        >
          <div
            className="absolute -inset-3 rounded-[2.25rem] border-2 border-brand-400/70"
            aria-hidden="true"
          />
          <figure className="relative overflow-hidden rounded-[2rem] shadow-lift">
            <img
              src="/assets/hero-burek.webp"
              alt="Frisch gebackener, knuspriger Burek aus der NETI Balkan Bäckerei"
              data-testid="hero-burek-image"
              loading="lazy"
              className="aspect-[4/3] max-h-[44vh] w-full object-cover object-[center_80%] sm:max-h-[50vh] lg:aspect-[4/5] lg:max-h-none lg:object-[center_78%]"
            />
            <figcaption className="absolute inset-x-4 bottom-4 flex items-center gap-2 rounded-2xl bg-espresso/80 px-4 py-3 backdrop-blur-md">
              <Flame className="h-5 w-5 shrink-0 text-brand-400" aria-hidden="true" />
              <span className="text-sm font-semibold text-cream">
                Unser Burek – täglich frisch aus dem Ofen
              </span>
            </figcaption>
          </figure>
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
