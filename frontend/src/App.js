import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { SettingsProvider } from "@/components/SettingsContext";
import SmoothScroll from "@/components/SmoothScroll";
import Home from "@/pages/Home";
import Impressum from "@/pages/Impressum";
import Datenschutz from "@/pages/Datenschutz";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <div className="App">
      <SettingsProvider>
        <BrowserRouter>
          <SmoothScroll />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/impressum" element={<Impressum />} />
            <Route path="/datenschutz" element={<Datenschutz />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </BrowserRouter>
        <Toaster position="top-center" richColors />
      </SettingsProvider>
    </div>
  );
}

export default App;
