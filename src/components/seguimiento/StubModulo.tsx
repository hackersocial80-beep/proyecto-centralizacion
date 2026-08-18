import { ArrowLeft } from "lucide-react";

interface Props {
  titulo: string;
  descripcion: string;
  onVolver: () => void;
}

// Stub minimo: pantalla placeholder para validar la navegacion.
// El contenido real se completara cuando se definan los campos.
export default function StubModulo({ titulo, descripcion, onVolver }: Props) {
  return (
    <div className="space-y-6 px-6 py-6 lg:px-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-[#5cb89a]">
            Modulo de seguimiento
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{titulo}</h1>
        </div>
        <button
          onClick={onVolver}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a seguimiento
        </button>
      </div>

      <div className="rounded-xl border border-dashed border-[#5cb89a]/40 bg-white p-10 text-center shadow-sm">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#5cb89a]">
          En construccion
        </p>
        <h2 className="mb-3 text-xl font-bold text-gray-900">{titulo}</h2>
        <p className="mx-auto max-w-2xl text-sm text-gray-600">{descripcion}</p>
        <p className="mx-auto mt-4 max-w-2xl text-xs text-gray-400">
          Pantalla inicial. Se completara con los campos especificos cuando el
          area correspondiente defina los indicadores y formularios
          necesarios.
        </p>
      </div>
    </div>
  );
}
