import { useState } from "react";
import LoginPage from "./pages/LoginPage";
import MenuPrincipal from "./pages/MenuPrincipal";
import IntencionPage from "./pages/Intencion";
import NuevaIntencion from "./pages/NuevaIntencion";
import DonacionPage from "./pages/Donacion";
import SeguimientoPage from "./pages/Seguimiento";
import AppShell, { type ModuloKey } from "./components/AppShell";
import type { LoginUser } from "./services/authService";
import { ToastProvider } from "./components/ui/Toast";

type Screen = ModuloKey | "login" | "nuevaIntencion";

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window === "undefined") return "login";
    return localStorage.getItem("authUser") ? "menu" : "login";
  });

  const goToLogin = () => {
    localStorage.removeItem("authUser");
    localStorage.removeItem("authExpiresAt");
    localStorage.removeItem("authIsDemo");
    setScreen("login");
  };

  if (screen === "login") {
    return (
      <ToastProvider>
        <LoginPage onLoginSuccess={(_user: LoginUser) => setScreen("menu")} />
      </ToastProvider>
    );
  }

  // Pantallas con sidebar persistente: solo se renderiza el contenido
  // AppShell provee el menu lateral unico.
  const moduloActivo: ModuloKey =
    screen === "nuevaIntencion" ? "intencion" : screen;

  let contenido: React.ReactNode;
  if (screen === "menu") {
    contenido = (
      <MenuPrincipal
        onIntencion={() => setScreen("intencion")}
        onDonacion={() => setScreen("donacion")}
        onSeguimiento={() => setScreen("seguimiento")}
      />
    );
  } else if (screen === "intencion") {
    contenido = (
      <IntencionPage onNuevaIntencion={() => setScreen("nuevaIntencion")} />
    );
  } else if (screen === "nuevaIntencion") {
    contenido = (
      <NuevaIntencion
        onCancelar={() => setScreen("intencion")}
        onGuardada={() => setScreen("intencion")}
      />
    );
  } else if (screen === "donacion") {
    contenido = (
      <DonacionPage onNuevaIntencion={() => setScreen("nuevaIntencion")} />
    );
  } else {
    contenido = <SeguimientoPage />;
  }

  return (
    <ToastProvider>
      <AppShell
        moduloActivo={moduloActivo}
        onInicio={() => setScreen("menu")}
        onIntencion={() => setScreen("intencion")}
        onDonacion={() => setScreen("donacion")}
        onSeguimiento={() => setScreen("seguimiento")}
        onCerrarSesion={goToLogin}
      >
        {contenido}
      </AppShell>
    </ToastProvider>
  );
}
