const ITEMS = [
  "Täglich frisch gebacken",
  "Burek & Pite",
  "Pizza",
  "Burger",
  "Brot & Brötchen",
  "Ćevapčići & Grill",
];

const Row = () => (
  <div className="flex shrink-0 items-center" aria-hidden="true">
    {ITEMS.map((item, i) => (
      <span key={i} className="flex items-center">
        <span className="px-6 font-display text-lg italic text-espresso/80 sm:px-10 sm:text-xl">
          {item}
        </span>
        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-espresso/40" fill="currentColor" aria-hidden="true">
          <path d="M12 2c1.5 3 1.5 6 0 9-1.5-3-1.5-6 0-9zm0 20c-1.5-3-1.5-6 0-9 1.5 3 1.5 6 0 9zM2 12c3-1.5 6-1.5 9 0-3 1.5-6 1.5-9 0zm20 0c-3 1.5-6 1.5-9 0 3-1.5 6-1.5 9 0z" />
        </svg>
      </span>
    ))}
  </div>
);

export default function Marquee() {
  return (
    <div
      data-testid="editorial-marquee"
      className="overflow-hidden border-y border-brand-600/20 bg-brand-400 py-4"
      role="presentation"
    >
      <div className="marquee-track flex w-max">
        <Row />
        <Row />
      </div>
    </div>
  );
}
