import LegalPage from "@/pages/LegalPage";

export default function Datenschutz() {
  return (
    <LegalPage
      title="Datenschutzerklärung"
      field="datenschutz_text"
      testid="datenschutz"
      intro="Informationen zur Verarbeitung personenbezogener Daten auf dieser Website."
    />
  );
}
