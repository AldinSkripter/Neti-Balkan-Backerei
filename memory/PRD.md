# PRD — NETI Balkan Bäckerei Website

## Original problem statement
> Please build me a landing page for a bakery that should include:
> 1) Hero section with name, call-to-action buttons, background image
> 2) About us section with story and core values
> 3) Product assortment with categories and images
> 4) Contact section (address, phone, opening hours, Google Maps link)
> 5) Admin section where the owner can change opening hours, contact details, images, texts
> 6) Mobile-first design (most visitors come via phone)
> 7) Impressum & Datenschutzerklärung pages
> 8) Multilingual-ready (German default, Serbian/Croatian/Bosnian later)

## User persona
Owner of a small Balkan bakery (NETI Balkan Bäckerei). Non-technical, edits content via a simple admin panel. Visitors are mostly on mobile and want opening hours, directions, and the product range.

## Design
- Warm bakery look: cream (#FAF8F2), espresso (#1C1712), bakery amber (#F5B301). Fraunces (display serif) + Manrope (body). Asymmetric, generous spacing. Rounded-3xl cards, pill buttons, custom food icons (no emojis).

## Implemented (2026-10-29)
- Landing page: Hero (real bakery photo, CTAs), Sortiment (4 categories), Über uns (story + values), Galerie (3 photos + lightbox), Kontakt (address, hours, phone, email, Google Maps link), Impressum & Datenschutz pages, Footer
- Admin panel at /admin/login with tabs: Kontakt & Zeiten, Logo & Favicon (upload), Sortiment (categories + items CRUD), Texte (Hero/About), Impressum & Datenschutz — all persisted via backend API
- Backend: JWT owner auth (owner@neti-balkan.de), file upload to object storage, public settings endpoint, seeded default content
- Verified: login works, settings save works, mobile menu works, all sections render at 375/768/1366px

## Known gaps / not yet done
- Opening hours defaults are placeholders; owner must enter real data in admin
- Menu category images use placeholder Pexels photos (owner should upload real ones)
- PWA icons/manifest not yet set
- Multilingual (SR/HR/BS) not yet implemented

## Backlog
- P1: Contact form with email delivery (Resend managed) or WhatsApp click-to-chat
- P1: Opening hours "Jetzt geöffnet" status badge
- P2: Google Maps embed + reviews section
- P3: Language switcher (DE/SR/HR)
