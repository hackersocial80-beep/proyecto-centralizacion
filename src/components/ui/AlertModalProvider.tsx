import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";

export default function AlertModalProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<string[]>([]);
  const message = messages[0] ?? "";
  const normalized = message.toLocaleLowerCase();
  const isSuccess = /(aprobada|aprobado|exitosamente|guardado correctamente|enviada|confirmad|disponible para)/.test(normalized);
  const isError = /(error|no se puede|no se pudo|falta|debe contar|debe estar|no puede|inválid|invalido|no hay)/.test(normalized);
  const Icon = isSuccess ? CheckCircle2 : isError ? AlertTriangle : Info;
  const dismiss = () => setMessages((current) => current.slice(1));

  useEffect(() => {
    const originalAlert = window.alert;
    window.alert = (value?: unknown) => {
      setMessages((current) => [...current, String(value ?? "")]);
    };
    return () => { window.alert = originalAlert; };
  }, []);

  useEffect(() => {
    if (!message) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [message]);

  return (
    <>
      {children}
      {message && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center bg-gray-950/60 p-4 backdrop-blur-sm" onClick={dismiss}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="system-alert-title" aria-describedby="system-alert-message" className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 duration-200" onClick={(event) => event.stopPropagation()}>
            <div className="p-6 text-center sm:p-8">
              <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ring-8 ${isSuccess ? "bg-emerald-50 text-emerald-600 ring-emerald-50/60" : isError ? "bg-amber-50 text-amber-600 ring-amber-50/60" : "bg-[#eaf4ee] text-[#315747] ring-[#f3f8f5]"}`}><Icon className="h-7 w-7" /></div>
              <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#5b8c70]">Sistema de Donaciones</p>
              <h2 id="system-alert-title" className="mt-2 text-xl font-bold text-gray-900">{isSuccess ? "Operación completada" : isError ? "Revisa la solicitud" : "Aviso del sistema"}</h2>
              <p id="system-alert-message" className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{message}</p>
              <button type="button" autoFocus onClick={dismiss} className="mt-6 inline-flex min-w-32 items-center justify-center gap-2 rounded-xl bg-[#315747] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#244536]"><CheckCircle2 className="h-4 w-4" /> Entendido</button>
            </div>
            <div className={`h-1 ${isSuccess ? "bg-emerald-500" : isError ? "bg-amber-500" : "bg-[#5cb89a]"}`} />
          </section>
        </div>
      )}
    </>
  );
}