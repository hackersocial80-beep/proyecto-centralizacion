import { useEffect, useState } from "react";
import LoginPage from "./pages/LoginPage";
import MenuPrincipal from "./pages/MenuPrincipal";
import IntencionPage from "./pages/Intencion";
import NuevaIntencion from "./pages/NuevaIntencion";
import DonacionPage from "./pages/Donacion";
import DonantesPage from "./pages/Donantes";
import SeguimientoPage from "./pages/Seguimiento";
import AprobacionGerenciaPage from "./components/seguimiento/AprobacionGerenciaPage";
import AppShell, { type ModuloKey } from "./components/AppShell";
import { clearAuthSession, type LoginUser } from "./services/authService";
import { ToastProvider } from "./components/ui/Toast";

const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000;
const LAST_ACTIVITY_KEY = "authLastActivityAt";

type Screen = ModuloKey | "login" | "nuevaIntencion";

export default function App() {
  const [screen, setScreen] = useState<Screen>(() => {
    if (typeof window === "undefined") return "login";
    const hasUser = Boolean(localStorage.getItem("authUser"));
    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    if (hasUser && Number.isFinite(lastActivity) && lastActivity > 0 && Date.now() - lastActivity >= INACTIVITY_TIMEOUT_MS) {
      clearAuthSession();
      return "login";
    }
    if (hasUser && (!Number.isFinite(lastActivity) || lastActivity <= 0)) {
      localStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
    }
    return hasUser ? "menu" : "login";
  });

  const goToLogin = () => {
    clearAuthSession();
    setScreen("login");
  };

  useEffect(() => {
    if (screen === "login") return;
    let timeout: number | undefined;
    let lastActivityWrite = 0;

    const scheduleLogout = () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();
      const remainingMs = INACTIVITY_TIMEOUT_MS - (Date.now() - lastActivity);
      if (remainingMs <= 0) {
        goToLogin();
        return;
      }
      timeout = window.setTimeout(scheduleLogout, remainingMs);
    };

    const recordActivity = () => {
      const now = Date.now();
      // Pointer movement can fire frequently; persist it at most once per second.
      if (now - lastActivityWrite < 1000) return;
      lastActivityWrite = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      scheduleLogout();
    };

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "authUser" && !event.newValue) {
        goToLogin();
      } else if (event.key === LAST_ACTIVITY_KEY) {
        scheduleLogout();
      }
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") scheduleLogout();
    };

    scheduleLogout();
    window.addEventListener("pointerdown", recordActivity, { passive: true });
    window.addEventListener("pointermove", recordActivity, { passive: true });
    window.addEventListener("keydown", recordActivity);
    window.addEventListener("scroll", recordActivity, { passive: true });
    window.addEventListener("touchstart", recordActivity, { passive: true });
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timeout !== undefined) window.clearTimeout(timeout);
      window.removeEventListener("pointerdown", recordActivity);
      window.removeEventListener("pointermove", recordActivity);
      window.removeEventListener("keydown", recordActivity);
      window.removeEventListener("scroll", recordActivity);
      window.removeEventListener("touchstart", recordActivity);
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [screen]);

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
        onDonantes={() => setScreen("donantes")}
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
  } else if (screen === "donantes") {
    contenido = <DonantesPage onAgregar={() => setScreen("nuevoDonante")} />;
  } else if (screen === "nuevoDonante") {
    contenido = <DonantesPage mode="create" onVolverListado={() => setScreen("donantes")} />;
  } else if (screen === "gerencia") {
    contenido = <AprobacionGerenciaPage onVolver={() => setScreen("seguimiento")} />;
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
        onDonantes={() => setScreen("donantes")}
        onNuevoDonante={() => setScreen("nuevoDonante")}
        onIntencion={() => setScreen("intencion")}
        onDonacion={() => setScreen("donacion")}
        onSeguimiento={() => setScreen("seguimiento")}
        onGerencia={() => setScreen("gerencia")}
        onCerrarSesion={goToLogin}
      >
        {contenido}
      </AppShell>
    </ToastProvider>
  );
}

