import { useState } from "react";
import { FileText, Image as ImageIcon, Download, X } from "lucide-react";
import type {
  CompromisoIdoneidad,
  CompromisoIdoneidadFlags,
  CondicionAlmacenamiento,
  DocumentoAdjunto,
  FotoAdjunta,
  LogisticaIntencion,
  MotivoDonacion,
  ProductoSensible,
} from "../../types/intencion";
import {
  CENTROS_ACOPIO,
  CONDICIONES_ALMACENAMIENTO,
  MOTIVOS_DONACION,
  PRODUCTOS_SENSIBLES,
} from "../../types/intencion";

interface Props {
  motivoDonacion: MotivoDonacion | "";
  donanteIntencion: string;
  contactoIntencion: string;
  fechaIntencion: string;
  compromisoIdoneidad: CompromisoIdoneidadFlags | CompromisoIdoneidad[] | CompromisoIdoneidad | "";
  condicionAlmacenamiento: CondicionAlmacenamiento | "";
  fechaEstimadaEntrega: string;
  descripcionGeneralDonacion: string;
  incluyeProductosSensibles: ProductoSensible | "";
  recomendacionesConsumo: string;
  condicionProducto: string;
  declaracionProducto: string;
  documentos: DocumentoAdjunto[];
  fotos: FotoAdjunta[];
  pesoTotalKg?: number;
  logistica?: LogisticaIntencion;
  catalogosLogistica?: {
    tipoLugar: Array<{ id: string; name: string }>;
    tipoAcceso: Array<{ id: string; name: string }>;
    anticipacion: Array<{ id: string; name: string }>;
  };
  editable?: boolean;
  onChange?: (patch: {
    motivoDonacion?: MotivoDonacion;
    compromisoIdoneidad?: CompromisoIdoneidadFlags;
    condicionAlmacenamiento?: CondicionAlmacenamiento;
    fechaEstimadaEntrega?: string;
    descripcionGeneralDonacion?: string;
    incluyeProductosSensibles?: ProductoSensible;
    recomendacionesConsumo?: string;
    condicionProducto?: string;
    declaracionProducto?: string;
  }) => void;
  onAddDocumentos?: (files: FileList) => void;
  onAddFotos?: (files: FileList) => void;
  onRemoveDocumento?: (id: string) => void;
  onRemoveFoto?: (id: string) => void;
}

const formatKb = (kb: number) =>
  kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

export default function DetalleIntencion({
  motivoDonacion,
  donanteIntencion,
  contactoIntencion,
  fechaIntencion,
  compromisoIdoneidad,
  condicionAlmacenamiento,
  fechaEstimadaEntrega,
  descripcionGeneralDonacion,
  incluyeProductosSensibles,
  recomendacionesConsumo,
  condicionProducto,
  declaracionProducto,
  documentos,
  fotos,
  pesoTotalKg = 0,
  logistica,
  catalogosLogistica,
  editable,
  onChange,
  onAddDocumentos,
  onAddFotos,
  onRemoveDocumento,
  onRemoveFoto,
}: Props) {
  const [mapaAbierto, setMapaAbierto] = useState(false);
  const catalogLabel = (items: Array<{ id: string; name: string }> = [], value?: string) =>
    items.find((item) => item.id === value || item.name === value)?.name || value || "Sin especificar";
  const requisitosLabels: Record<string, string> = {
    "1": "DNI vigente",
    "2": "Carnet de sanidad",
    "3": "Autorización del donante",
    "4": "Uso obligatorio de EPP",
    "5": "Seguro SCTR",
    "6": "Inducción de seguridad",
    "7": "Vehículo con sello de fumigación",
    "8": "Otros requisitos",
  };
  const isCommitmentSelected = (key: keyof CompromisoIdoneidadFlags) => {
    if (Array.isArray(compromisoIdoneidad)) {
      return compromisoIdoneidad.includes(key as unknown as CompromisoIdoneidad);
    }
    if (typeof compromisoIdoneidad === "string") {
      return compromisoIdoneidad.includes(key);
    }
    return Boolean(compromisoIdoneidad?.[key]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Peso total estimado de productos</p>
        <p className="mt-1 text-2xl font-bold text-emerald-900">{pesoTotalKg.toLocaleString("es-PE", { minimumFractionDigits: 0, maximumFractionDigits: 2 })} kg</p>
      </div>
      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h3 className="mb-4 text-base font-bold text-gray-900">Calidad e información de la intención</h3>
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">Donante</label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
            {donanteIntencion || "Sin especificar"}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">Contacto</label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
            {contactoIntencion || "Sin especificar"}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">Fecha de intención</label>
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
            {fechaIntencion || "Sin especificar"}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Motivo de donacion
          </label>
          {editable ? (
            <select
              value={motivoDonacion}
              onChange={(e) =>
                onChange?.({ motivoDonacion: e.target.value as MotivoDonacion })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
            >
              <option value="">Seleccionar motivo</option>
              {MOTIVOS_DONACION.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
              {motivoDonacion || "Sin especificar"}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Compromiso de idoneidad
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={isCommitmentSelected("envase_integro")}
                readOnly
                className="mt-1 h-4 w-4"
              />

              <span className="text-sm text-gray-700">
                Envase íntegro y sellado (cuando aplique)
              </span>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={isCommitmentSelected("sin_deterioro")}
                readOnly
                className="mt-1 h-4 w-4"
              />

              <span className="text-sm text-gray-700">
                Producto sin signos de deterioro,
                contaminación o descomposición
              </span>
            </div>

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={isCommitmentSelected("conservacion")}
                readOnly
                className="mt-1 h-4 w-4"
              />

              <span className="text-sm text-gray-700">
                Conservado según las condiciones
                establecidas por el fabricante
              </span>
            </div>

          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Condicion de almacenamiento
          </label>
          {editable ? (
            <select
              value={condicionAlmacenamiento}
              onChange={(e) =>
                onChange?.({
                  condicionAlmacenamiento:
                    e.target.value as CondicionAlmacenamiento,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
            >
              <option value="">Seleccionar condicion</option>
              {CONDICIONES_ALMACENAMIENTO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
              {condicionAlmacenamiento || "Sin especificar"}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Fecha estimada de entrega
          </label>
          {editable ? (
            <input
              type="date"
              value={fechaEstimadaEntrega}
              onChange={(e) =>
                onChange?.({ fechaEstimadaEntrega: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
            />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
              {fechaEstimadaEntrega || "Sin fecha estimada"}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            La donacion incluye productos sensibles
          </label>
          {editable ? (
            <select
              value={incluyeProductosSensibles}
              onChange={(e) =>
                onChange?.({
                  incluyeProductosSensibles:
                    e.target.value as ProductoSensible,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
            >
              <option value="">Seleccionar opcion</option>
              {PRODUCTOS_SENSIBLES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
              {incluyeProductosSensibles || "Sin especificar"}
            </div>
          )}
        </div>
      </div>

      </section>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">
          Observaciones del donante
        </label>
        {editable ? (
          <textarea
            value={descripcionGeneralDonacion}
            onChange={(e) =>
              onChange?.({ descripcionGeneralDonacion: e.target.value })
            }
            rows={3}
            placeholder="Escribe las observaciones proporcionadas por el donante sobre la donación..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
          />
        ) : (
          <div className="min-h-[60px] whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
            {descripcionGeneralDonacion || "Sin descripcion registrada."}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">
          Recomendaciones de consumo y especificaciones tecnicas (si aplica)
        </label>
        {editable ? (
          <textarea
            value={recomendacionesConsumo}
            onChange={(e) =>
              onChange?.({ recomendacionesConsumo: e.target.value })
            }
            rows={3}
            placeholder="Indica recomendaciones de consumo, especificaciones tecnicas u observaciones relevantes..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
          />
        ) : (
          <div className="min-h-[60px] whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
            {recomendacionesConsumo || "Sin recomendaciones registradas."}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">
          Comentarios internos (Solo uso interno)
        </label>
        {editable ? (
          <textarea
            value={condicionProducto}
            onChange={(e) => onChange?.({ condicionProducto: e.target.value })}
            rows={4}
            placeholder="Observaciones internas del equipo de BAP sobre la donación..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
          />
        ) : (
          <div className="min-h-[80px] whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
            {condicionProducto || "Sin condicion registrada."}
          </div>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">
          Notas adicionales (Opcional)
        </label>
        {editable ? (
          <textarea
            value={declaracionProducto}
            onChange={(e) => onChange?.({ declaracionProducto: e.target.value })}
            rows={4}
            placeholder="Agregar cualquier nota que consideres importante..."
            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
          />
        ) : (
          <div className="min-h-[80px] whitespace-pre-wrap rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
            {declaracionProducto || "Sin declaracion registrada."}
          </div>
        )}
      </div>

      {/* Documentos */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FileText className="h-4 w-4 text-[#5cb89a]" />
            Documentos adjuntos ({documentos.length})
          </h4>
          {editable && (
            <label className="cursor-pointer rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Subir documentos
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onAddDocumentos?.(e.target.files);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          )}
        </div>

        {documentos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
            No hay documentos cargados.
          </div>
        ) : (
          <ul className="space-y-2">
            {documentos.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-2.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-[#5cb89a]">
                    <FileText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {d.nombre}
                    </p>
                    <p className="text-xs text-gray-500">
                      {d.tipo || "archivo"} - {formatKb(d.tamanoKb)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
                    aria-label="Ver documento"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => onRemoveDocumento?.(d.id)}
                      className="rounded-md p-1.5 text-red-600 transition-colors hover:bg-red-50"
                      aria-label="Eliminar documento"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fotos */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
            <ImageIcon className="h-4 w-4 text-[#5cb89a]" />
            Vista previa de fotos ({fotos.length})
          </h4>
          {editable && (
            <label className="cursor-pointer rounded-md border border-dashed border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50">
              Subir fotos
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    onAddFotos?.(e.target.files);
                    e.target.value = "";
                  }
                }}
              />
            </label>
          )}
        </div>

        {fotos.length === 0 ? (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            Aun no se han cargado fotos del producto.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {fotos.map((f) => (
              <div
                key={f.id}
                className="group relative overflow-hidden rounded-lg border border-gray-200 bg-white"
              >
                <img
                  src={f.url}
                  alt={f.nombre}
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
                {editable && (
                  <button
                    type="button"
                    onClick={() => onRemoveFoto?.(f.id)}
                    className="absolute right-1.5 top-1.5 rounded-full bg-white/95 p-1 text-red-600 shadow-sm hover:bg-red-50"
                    aria-label="Eliminar foto"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <div className="truncate px-2 py-1.5 text-xs text-gray-600">
                  {f.nombre}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {logistica && (
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h3 className="mb-4 text-base font-bold text-gray-900">Logística y recojo</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["Tipo de lugar", catalogLabel(catalogosLogistica?.tipoLugar, String(logistica.tipoLugar || ""))],
              ["Lugar / planta", logistica.lugar],
              ["Contacto en planta", logistica.contactoPlanta],
              ["Dirección", logistica.direccion],
              ["Referencia", logistica.referencia],
              ["Distrito", String(logistica.distrito || "")],
              ["Provincia", String(logistica.provincia || "")],
              ["Departamento", String(logistica.departamento || "")],
              ["Código postal", logistica.codigoPostal],
              ["Tipo de acceso", catalogLabel(catalogosLogistica?.tipoAcceso, String(logistica.tipoAcceso || ""))],
              ["Requiere autorización", logistica.requiereAutorizacion],
              ["Anticipación requerida", catalogLabel(catalogosLogistica?.anticipacion, String(logistica.anticipacion || ""))],
              ["Contacto de autorización", logistica.contactoAutorizacion],
              ["Teléfono de contacto", logistica.numeroContacto],
              ["Horario de atención", [logistica.horarioInicio, logistica.horarioFinal].filter(Boolean).join(" a ")],
              ["Días de atención", logistica.diasAtencion?.join(", ")],
              ["Disponibilidad para recojo", [logistica.fechaDesde, logistica.fechaHasta].filter(Boolean).join(" a ")],
              ["Horario disponible", logistica.horarioDisponible],
              ["Tiempo estimado de carga", logistica.tiempoEstimadoCarga ? `${logistica.tiempoEstimadoCarga} min` : ""],
              ["Latitud", logistica.latitud],
              ["Longitud", logistica.longitud],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs font-medium text-gray-500">{label}</p>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{value || "Sin especificar"}</p>
              </div>
            ))}
          </div>
          {logistica.requisitosIngreso?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs font-medium text-gray-500">Requisitos para ingreso a planta</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {logistica.requisitosIngreso.map((id) => (
                  <li key={id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    {requisitosLabels[id] || id}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {logistica.observacionesAcceso && (
            <div className="mt-4">
              <p className="text-xs font-medium text-gray-500">Otros requisitos / observaciones de acceso</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-900">{logistica.observacionesAcceso}</p>
            </div>
          )}
          {logistica.latitud && logistica.longitud && (
            <button
              type="button"
              className="mt-4 inline-flex text-sm font-medium text-emerald-700 hover:underline"
              onClick={() => setMapaAbierto(true)}
            >
              Ver ubicación en mapa
            </button>
          )}
        </section>
      )}

      {mapaAbierto && logistica && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setMapaAbierto(false);
          }}
        >
          <section
            className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mapa-intencion-titulo"
          >
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <h3 id="mapa-intencion-titulo" className="font-semibold text-gray-900">Ubicación del recojo</h3>
                <p className="text-sm text-gray-500">{logistica.latitud}, {logistica.longitud}</p>
              </div>
              <button
                type="button"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                onClick={() => setMapaAbierto(false)}
                aria-label="Cerrar mapa"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <iframe
              title="Mapa de ubicación del recojo"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(`${logistica.latitud},${logistica.longitud}`)}&z=15&output=embed`}
              className="h-[min(70vh,600px)] w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        </div>
      )}
    </div>
  );
}
