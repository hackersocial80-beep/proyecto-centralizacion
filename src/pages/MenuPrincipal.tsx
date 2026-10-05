import {
  ArrowRight,
  ClipboardList,
  Gift,
  ReceiptText,
  Route,
  ShoppingCart,
} from "lucide-react";

interface Props {
  onIntencion: () => void;
  onDonacion: () => void;
  onSeguimiento: () => void;
}

export default function MenuPrincipal({
  onIntencion,
  onDonacion,
  onSeguimiento,
}: Props) {
  return (
    <div className="px-6 py-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
          Bienvenido
        </p>
        <h1 className="mb-1 text-3xl font-bold text-gray-900">Menú principal</h1>
        <p className="mb-8 text-sm text-gray-600">
          Accede a cada módulo según el proceso que necesitas gestionar.
        </p>

        <div className="space-y-8">
          <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5cb89a]/10 text-[#5cb89a]">
                <Gift className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Donaciones</h2>
                <p className="text-sm text-gray-500">Intenciones, donaciones registradas y seguimiento.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              <ModuloCard
                titulo="Intención de donación"
                descripcion="Registra y consulta las intenciones de donación."
                icon={<ClipboardList className="h-6 w-6" />}
                onClick={onIntencion}
              />
              <ModuloCard
                titulo="Donaciones"
                descripcion="Consulta el resumen y el estado de las donaciones."
                icon={<Gift className="h-6 w-6" />}
                onClick={onDonacion}
              />
              <ModuloCard
                titulo="Seguimiento"
                descripcion="Revisa el avance operativo de las donaciones."
                icon={<Route className="h-6 w-6" />}
                onClick={onSeguimiento}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gray-200 text-gray-500">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Compras y facturación</h2>
                <p className="text-sm text-gray-500">Módulo previsto para próximos procesos.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <ModuloCard
                titulo="Compras"
                descripcion="Gestión de compras."
                icon={<ShoppingCart className="h-6 w-6" />}
                disabled
              />
              <ModuloCard
                titulo="Facturación"
                descripcion="Gestión de facturación."
                icon={<ReceiptText className="h-6 w-6" />}
                disabled
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ModuloCard({
  titulo,
  descripcion,
  icon,
  onClick,
  disabled = false,
}: {
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all ${disabled ? "cursor-not-allowed opacity-60" : "hover:-translate-y-1 hover:shadow-md"}`}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#5cb89a]/10 text-[#5cb89a] transition-colors group-hover:bg-[#5cb89a] group-hover:text-white">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
      <div className="mt-1 flex items-center justify-between gap-3">
        <p className="text-sm text-gray-600">{descripcion}</p>
        {disabled ? (
          <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wide text-gray-400">Próximamente</span>
        ) : (
          <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 transition-transform group-hover:translate-x-1" />
        )}
      </div>
    </button>
  );
}
