import {
  ClipboardList,
  Gift,
  Route,
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
        <h1 className="mb-1 text-3xl font-bold text-gray-900">Menu principal</h1>
        <p className="mb-8 text-sm text-gray-600">
          Selecciona un modulo para continuar con la gestion.
        </p>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <ModuloCard
            titulo="Intenciones"
            descripcion="Registra, filtra y da seguimiento a las intenciones de donacion."
            icon={<ClipboardList className="h-6 w-6" />}
            onClick={onIntencion}
          />
          <ModuloCard
            titulo="Donaciones"
            descripcion="Resumen, filtros y seguimiento operativo de cada donacion."
            icon={<Gift className="h-6 w-6" />}
            onClick={onDonacion}
          />
          <ModuloCard
            titulo="Seguimiento"
            descripcion="Organizaciones asignadas, mapa de entrega y linea de tiempo."
            icon={<Route className="h-6 w-6" />}
            onClick={onSeguimiento}
          />
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
}: {
  titulo: string;
  descripcion: string;
  icon: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group rounded-xl border border-gray-200 bg-white p-6 text-left shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-[#5cb89a]/10 text-[#5cb89a] transition-colors group-hover:bg-[#5cb89a] group-hover:text-white">
        {icon}
      </div>
      <h2 className="text-lg font-semibold text-gray-900">{titulo}</h2>
      <p className="mt-1 text-sm text-gray-600">{descripcion}</p>
    </button>
  );
}
