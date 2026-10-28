import { useEffect, useState } from "react";
import { Filter, Loader2, RotateCcw, Search } from "lucide-react";
import { fetchSuppliers } from "../../services/catalogService";
import {
  FILTROS_VACIOS,
  RESPONSABLES,
  type FiltrosIntencion,
} from "../../types/intencion";
import { getLocalDateISO } from "../../utils/date";

interface Props {
  filtros: FiltrosIntencion;
  origins: Array<{ id: string; name: string }>;
  suppliers: Array<{ id: string; name: string }>;
  selectedSupplier: { id: string; name: string } | null;
  onSupplierSelected: (supplier: { id: string; name: string } | null) => void;
  intentionTypes: Array<{ id: string; name: string }>;
  onChange: (f: FiltrosIntencion) => void;
  onNuevaIntencion: () => void;
}

export default function FiltrosIntencionBar({
  filtros,
  origins,
  suppliers,
  selectedSupplier,
  onSupplierSelected,
  intentionTypes,
  onChange,
  onNuevaIntencion,
}: Props) {
  const [supplierQuery, setSupplierQuery] = useState("");
  const [supplierOptions, setSupplierOptions] = useState(suppliers);
  const [supplierSearchLoading, setSupplierSearchLoading] = useState(false);
  const [showSupplierOptions, setShowSupplierOptions] = useState(false);

  useEffect(() => {
    const query = supplierQuery.trim();
    const localResults = query
      ? suppliers.filter((supplier) => `${supplier.name} ${supplier.id}`.toLowerCase().includes(query.toLowerCase()))
      : suppliers;
    setSupplierOptions(localResults);
    setSupplierSearchLoading(false);
    if (query.length < 2) return;

    let active = true;
    const timer = window.setTimeout(() => {
      setSupplierSearchLoading(true);
      fetchSuppliers(query)
        .then((items) => {
          if (!active) return;
          const matches = items.map((item: any) => {
            const id = item?.supplierId ?? item?.supplierID ?? item?.idSupplier ?? item?.id ?? item?.code;
            const name = item?.supplierName ?? item?.supplier_name ?? item?.businessName ?? item?.companyName ?? item?.razonSocial ?? item?.tradeName ?? item?.name ?? item?.description;
            return { id: String(id ?? ""), name: String(name ?? "") };
          }).filter((supplier: { id: string; name: string }) => supplier.id && supplier.name && `${supplier.name} ${supplier.id}`.toLowerCase().includes(query.toLowerCase()));
          setSupplierOptions(matches.length > 0 ? matches : localResults);
        })
        .catch(() => { if (active) setSupplierOptions(localResults); })
        .finally(() => { if (active) setSupplierSearchLoading(false); });
    }, 300);

    return () => { active = false; window.clearTimeout(timer); };
  }, [supplierQuery, suppliers]);

  const setField = <K extends keyof FiltrosIntencion>(
    key: K,
    value: FiltrosIntencion[K]
  ) => onChange({ ...filtros, [key]: value });

  const limpiar = () => {
    onChange(FILTROS_VACIOS);
    onSupplierSelected(null);
    setSupplierQuery("");
  };

  const inputBase =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 transition-all focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20";

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-[#5cb89a]" />
          <h3 className="text-sm font-semibold text-gray-800">Filtros</h3>
        </div>

        <button
          type="button"
          onClick={onNuevaIntencion}
          className="inline-flex items-center justify-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 hover:shadow-md active:scale-[0.98]"
          style={{
            background:
              "linear-gradient(90deg, #5cb89a 0%, #7dc8ad 50%, #a0d8c0 100%)",
          }}
        >
          + Nueva intencion
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div className="relative">
          <label className="mb-1 block text-xs font-medium text-gray-600">Filtrar donante</label>
          <button type="button" role="combobox" aria-expanded={showSupplierOptions} aria-controls="filtro-donantes" onClick={() => { const open = !showSupplierOptions; setShowSupplierOptions(open); if (open) { setSupplierQuery(""); setSupplierOptions(suppliers); } }} className={inputBase + " flex items-center justify-between text-left"}>
            <span className={selectedSupplier ? "truncate text-gray-800" : "text-gray-400"}>{selectedSupplier?.name ?? "Todos"}</span>
            <Search className="ml-2 h-4 w-4 shrink-0 text-gray-400" />
          </button>
          {showSupplierOptions && <div className="absolute z-30 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center gap-2 border-b border-gray-100 px-3 py-2"><Search className="h-4 w-4 shrink-0 text-gray-400" /><input autoFocus value={supplierQuery} onChange={(event) => setSupplierQuery(event.target.value)} onKeyDown={(event) => { if (event.key === "Escape") setShowSupplierOptions(false); }} placeholder="Buscar donante por nombre o RUC..." className="min-w-0 flex-1 text-sm outline-none placeholder:text-gray-400" />{supplierSearchLoading && <Loader2 className="h-4 w-4 animate-spin text-gray-400" />}</div>
            <div id="filtro-donantes" role="listbox" className="max-h-56 overflow-y-auto py-1">
              <button type="button" role="option" aria-selected={!filtros.donante} onClick={() => { setField("donante", ""); onSupplierSelected(null); setShowSupplierOptions(false); }} className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50">Todos</button>
              {supplierOptions.map((supplier) => <button key={supplier.id} type="button" role="option" aria-selected={supplier.id === filtros.donante} onClick={() => { setField("donante", supplier.id); onSupplierSelected(supplier); setShowSupplierOptions(false); }} className="block w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-[#5cb89a]/10 hover:text-[#32876d]">{supplier.name}</button>)}
              {supplierOptions.length === 0 && <p className="px-3 py-3 text-sm text-gray-500">{supplierSearchLoading ? "Buscando donantes..." : "No se encontraron donantes."}</p>}
              {supplierSearchLoading && supplierOptions.length > 0 && <p className="px-3 py-2 text-xs text-gray-400">Buscando en el catálogo completo...</p>}
            </div>
          </div>}
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Contacto
          </label>
          <input
            type="text"
            value={filtros.contacto}
            onChange={(e) => setField("contacto", e.target.value)}
            placeholder="Correo o telefono"
            className={inputBase}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Fecha de intencion
          </label>
          <input
            type="date"
            value={filtros.fechaIntencion}
            onChange={(e) => setField("fechaIntencion", e.target.value)}
            className={inputBase}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Canal
          </label>
          <select
            value={filtros.canal}
            onChange={(e) => setField("canal", e.target.value)}
            className={inputBase}
          >
            <option value="">Todos</option>
            {origins.map((origin) => (
              <option key={origin.id} value={origin.id}>
                {origin.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Responsable
          </label>
          <select
            value={filtros.responsable}
            onChange={(e) => setField("responsable", e.target.value)}
            className={inputBase}
          >
            <option value="">Todos</option>
            {RESPONSABLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-gray-600">
            Tipo de intencion
          </label>
          <div className="flex gap-2">
            <select
              value={filtros.tipoIntencion}
              onChange={(e) =>
                setField(
                  "tipoIntencion",
                  e.target.value as FiltrosIntencion["tipoIntencion"]
                )
              }
              className={inputBase}
            >
              <option value="">Todos</option>
              {intentionTypes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={limpiar}
              className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50"
              title="Limpiar filtros"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Limpiar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
