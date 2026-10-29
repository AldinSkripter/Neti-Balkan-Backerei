import LegalPage from "@/pages/LegalPage";

export default function Impressum() {
  return (
    <LegalPage
      title="Impressum"
      field="impressum_text"
      testid="impressum"
      intro="Angaben gemäß § 5 TMG und § 18 Abs. 2 MStV."
    />
  );
}
