import { MousePointer2 } from "lucide-react";

export default function SelectionPlaceholder() {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-dashed border-[#b9d4c3] bg-gradient-to-br from-white via-[#fbfdfb] to-[#edf6f0] px-6 py-12 text-center shadow-inner sm:min-h-[500px]">
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e2f2e8] text-[#327c58] shadow-sm ring-8 ring-white/80">
        <MousePointer2 className="h-7 w-7" />
        <span className="absolute -right-1 -top-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-[#5bb27d]" />
      </div>
      <span className="mt-6 rounded-full bg-[#e7f3eb] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#4b8060]">Selección requerida</span>
      <h2 className="mt-3 text-xl font-bold tracking-tight text-[#1d3f2d]">Ninguna intención seleccionada</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#6b7c70]">Selecciona una intención del panel izquierdo para consultar sus datos y continuar con este paso.</p>
      <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#4d8060]"><span className="h-px w-8 bg-[#c7ddce]" /> El detalle aparecerá aquí <span className="h-px w-8 bg-[#c7ddce]" /></div>
    </div>
  );
}