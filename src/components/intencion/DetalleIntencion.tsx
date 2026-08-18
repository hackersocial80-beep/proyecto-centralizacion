import { FileText, Image as ImageIcon, Download, X } from "lucide-react";
import type {
  CompromisoIdoneidad,
  CondicionAlmacenamiento,
  DocumentoAdjunto,
  FotoAdjunta,
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
  compromisoIdoneidad: CompromisoIdoneidad | "";
  condicionAlmacenamiento: CondicionAlmacenamiento | "";
  fechaEstimadaEntrega: string;
  descripcionGeneralDonacion: string;
  incluyeProductosSensibles: ProductoSensible | "";
  recomendacionesConsumo: string;
  condicionProducto: string;
  declaracionProducto: string;
  documentos: DocumentoAdjunto[];
  fotos: FotoAdjunta[];
  editable?: boolean;
  onChange?: (patch: {
    motivoDonacion?: MotivoDonacion;
    compromisoIdoneidad?: CompromisoIdoneidad;
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
  editable,
  onChange,
  onAddDocumentos,
  onAddFotos,
  onRemoveDocumento,
  onRemoveFoto,
}: Props) {
  return (
    <div className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
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
          <label className="mb-1.5 block text-sm font-medium text-gray-800">
            Compromiso de idoneidad del producto
          </label>
          {editable ? (
            <select
              value={compromisoIdoneidad}
              onChange={(e) =>
                onChange?.({
                  compromisoIdoneidad: e.target.value as CompromisoIdoneidad,
                })
              }
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 focus:border-[#5cb89a] focus:outline-none focus:ring-2 focus:ring-[#5cb89a]/20"
            >
              <option value="">Seleccionar compromiso</option>
              {CENTROS_ACOPIO.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800">
              {compromisoIdoneidad || "Sin asignar"}
            </div>
          )}
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

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-800">
          Descripcion general de la donacion
        </label>
        {editable ? (
          <textarea
            value={descripcionGeneralDonacion}
            onChange={(e) =>
              onChange?.({ descripcionGeneralDonacion: e.target.value })
            }
            rows={3}
            placeholder="Describe de forma general la donacion, su alcance y finalidad..."
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
          Condicion del producto (estado fisico, apariencia, etiquetado, empaque o envase)
        </label>
        {editable ? (
          <textarea
            value={condicionProducto}
            onChange={(e) => onChange?.({ condicionProducto: e.target.value })}
            rows={4}
            placeholder="Describe el estado fisico y apariencia del producto, etiquetado, empaque o envase..."
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
          Declaracion del producto
        </label>
        {editable ? (
          <textarea
            value={declaracionProducto}
            onChange={(e) => onChange?.({ declaracionProducto: e.target.value })}
            rows={4}
            placeholder="Describe el estado, condiciones y consideraciones de los productos..."
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
    </div>
  );
}
