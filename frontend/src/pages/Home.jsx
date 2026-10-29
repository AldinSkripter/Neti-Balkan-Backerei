import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import About from "@/components/About";
import Sortiment from "@/components/Sortiment";
import Gallery from "@/components/Gallery";
import Location from "@/components/Location";
import Footer from "@/components/Footer";
import { useSettings } from "@/components/SettingsContext";
import { scrollToId } from "@/components/SmoothScroll";
import { isPlaceholder } from "@/lib/api";

export default function Home() {
  const location = useLocation();
  const { settings } = useSettings();

  useEffect(() => {
    if (location.state?.scrollTo) {
      const t = setTimeout(() => scrollToId(location.state.scrollTo), 150);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  useEffect(() => {
    if (!settings) return;
    const c = settings.contact || {};
    const data = { "@context": "https://schema.org", "@type": "Bakery", name: "NETI Balkan Bäckerei" };
    if (c.address_street && !isPlaceholder(c.address_street)) {
      data.address = {
        "@type": "PostalAddress",
        streetAddress: c.address_street,
        ...(c.address_city && !isPlaceholder(c.address_city) ? { addressLocality: c.address_city } : {}),
        addressCountry: "DE",
      };
    }
    if (c.phone && !isPlaceholder(c.phone)) data.telephone = c.phone;
    if (c.email && !isPlaceholder(c.email)) data.email = c.email;
    const el = document.createElement("script");
    el.type = "application/ld+json";
    el.text = JSON.stringify(data);
    document.head.appendChild(el);
    return () => el.remove();
  }, [settings]);

  return (
    <div data-testid="home-page">
      <Header />
      <main>
        <Hero />
        <Marquee />
        <Sortiment />
        <About />
        <Gallery />
        <Location />
      </main>
      <Footer />
    </div>
  );
}
