import { createContext, useContext, useEffect, useState } from "react";
import { api, API } from "@/lib/api";

const SettingsContext = createContext({ settings: null, refresh: async () => {} });

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(null);

  const load = async () => {
    try {
      const { data } = await api.get("/settings");
      setSettings(data);
    } catch (e) {
      console.error("Einstellungen konnten nicht geladen werden", e);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!settings?.favicon_storage_path) return;
    const url = `${API}/files/${settings.favicon_storage_path}`;
    document.querySelectorAll("link[rel~='icon']").forEach((l) => {
      l.href = url;
    });
  }, [settings]);

  return (
    <SettingsContext.Provider value={{ settings, refresh: load }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
