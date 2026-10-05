import { useEffect, useState } from "react";
import {
  ClipboardList,
  Gift,
  LayoutDashboard,
  LogOut,
  Route,
  ChevronDown,
  ChevronRight,
  ShoppingCart,
  ReceiptText,
} from "lucide-react";
import logo from "../assets/logo.png";
import type { LoginUser } from "../services/authService";

export type ModuloKey = "menu" | "intencion" | "donacion" | "seguimiento";

interface Props {
  moduloActivo: ModuloKey;
  onInicio: () => void;
  onIntencion: () => void;
  onDonacion: () => void;
  onSeguimiento: () => void;
  onCerrarSesion: () => void;
  children: React.ReactNode;
}

// Shell persistente: contiene el sidebar lateral y el area de contenido.
// Garantiza que solo exista UN menu en toda la navegacion post-login.
export default function AppShell({
  moduloActivo,
  onInicio,
  onIntencion,
  onDonacion,
  onSeguimiento,
  onCerrarSesion,
  children,
}: Props) {
  const [user, setUser] = useState<LoginUser | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [donacionesOpen, setDonacionesOpen] = useState(
    moduloActivo === "intencion" || moduloActivo === "donacion" || moduloActivo === "seguimiento"
  );
  const [comprasOpen, setComprasOpen] = useState(false);

  useEffect(() => {
    if (moduloActivo === "intencion" || moduloActivo === "donacion" || moduloActivo === "seguimiento") {
      setDonacionesOpen(true);
    }
  }, [moduloActivo]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("authUser");
      if (raw) setUser(JSON.parse(raw) as LoginUser);
      setIsDemo(localStorage.getItem("authIsDemo") === "1");
    } catch {
      // ignore
    }
  }, []);

  const initials = (user?.fullName ?? "Usuario")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-[#f2f7f3] font-sans">
      <aside className="flex w-64 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-5">
          <img src={logo} alt="BAP" className="h-10 w-auto" />
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[#5cb89a]">
              Sistema
            </p>
            <p className="text-xs font-medium text-gray-700">
              Centralizacion BAP
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
            Modulos
          </p>
          <SidebarItem
            icon={<LayoutDashboard className="h-4 w-4" />}
            label="Inicio"
            active={moduloActivo === "menu"}
            onClick={onInicio}
          />
          <button
            type="button"
            aria-expanded={donacionesOpen}
            onClick={() => setDonacionesOpen((open) => !open)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold transition-colors ${
              moduloActivo === "intencion" || moduloActivo === "donacion" || moduloActivo === "seguimiento"
                ? "bg-[#5cb89a]/10 text-[#32876d]"
                : "text-gray-700 hover:bg-gray-100"
            }`}
          >
            <Gift className="h-4 w-4 text-[#5cb89a]" />
            <span className="flex-1">Donaciones</span>
            {donacionesOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {donacionesOpen && (
            <div className="ml-4 space-y-1 border-l border-gray-200 pl-3">
              <SidebarSubItem
                icon={<ClipboardList className="h-4 w-4" />}
                label="Intención de donación"
                active={moduloActivo === "intencion"}
                onClick={onIntencion}
              />
              <SidebarSubItem
                icon={<Gift className="h-4 w-4" />}
                label="Donaciones"
                active={moduloActivo === "donacion"}
                onClick={onDonacion}
              />
              <SidebarSubItem
                icon={<Route className="h-4 w-4" />}
                label="Seguimiento"
                active={moduloActivo === "seguimiento"}
                onClick={onSeguimiento}
              />
            </div>
          )}

          <button
            type="button"
            aria-expanded={comprasOpen}
            onClick={() => setComprasOpen((open) => !open)}
            className="mt-3 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100"
          >
            <ShoppingCart className="h-4 w-4 text-gray-500" />
            <span className="flex-1">Compras y facturación</span>
            {comprasOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
          {comprasOpen && (
            <div className="ml-4 space-y-1 border-l border-gray-200 pl-3">
              <SidebarSubItem icon={<ShoppingCart className="h-4 w-4" />} label="Compras" disabled />
              <SidebarSubItem icon={<ReceiptText className="h-4 w-4" />} label="Facturación" disabled />
            </div>
          )}
        </nav>

        <div className="border-t border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5cb89a]/10 text-sm font-bold text-[#5cb89a]">
              {initials || "U"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 truncate text-sm font-semibold text-gray-900">
                {user?.fullName ?? "Usuario"}
                {isDemo && (
                  <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-amber-700">
                    Demo
                  </span>
                )}
              </p>
              <p className="truncate text-xs text-gray-500">
                {user?.email ?? "sin correo"}
              </p>
            </div>
          </div>
          <button
            onClick={onCerrarSesion}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-x-hidden">{children}</main>
    </div>
  );
}

function SidebarSubItem({
  icon,
  label,
  active = false,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
        disabled
          ? "cursor-not-allowed text-gray-400"
          : active
            ? "bg-[#5cb89a]/10 font-semibold text-[#32876d]"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span className={active ? "text-[#5cb89a]" : "text-gray-400"}>{icon}</span>
      {label}
      {disabled && <span className="ml-auto text-[10px] uppercase tracking-wide">Próximamente</span>}
    </button>
  );
}

function SidebarItem({
  icon,
  label,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors ${
        active
          ? "bg-[#5cb89a]/10 text-[#5cb89a]"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
      }`}
    >
      <span className={active ? "text-[#5cb89a]" : "text-gray-500"}>{icon}</span>
      {label}
    </button>
  );
}
