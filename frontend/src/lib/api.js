import axios from "axios";

export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API,
  withCredentials: true,
});

export const fileUrl = (u) => {
  if (!u) return u;
  if (u.startsWith("/api/")) return `${BACKEND_URL}${u}`;
  return u;
};

const PLACEHOLDER = "Wird in Kürze ergänzt";
export const isPlaceholder = (v) => !v || v === PLACEHOLDER;

export const mapsUrl = (settings) => {
  const m = settings?.contact?.maps_url;
  if (m && !isPlaceholder(m)) return m;
  const q = [settings?.contact?.address_street, settings?.contact?.address_city]
    .filter((v) => v && !isPlaceholder(v))
    .join(", ");
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q || "NETI Balkan Bäckerei")}`;
};

export const logoUrl = (settings) =>
  settings?.logo_storage_path ? `${API}/files/${settings.logo_storage_path}` : "/assets/logo.png";
