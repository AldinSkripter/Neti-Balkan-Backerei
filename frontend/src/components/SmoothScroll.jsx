import { useEffect } from "react";
import Lenis from "lenis";

let lenis = null;

export const scrollToId = (hash) => {
  const el = document.querySelector(hash);
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -88, duration: 1.2 });
  } else {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

export default function SmoothScroll() {
  useEffect(() => {
    lenis = new Lenis({ duration: 1.15, smoothWheel: true });
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      lenis = null;
    };
  }, []);
  return null;
}
