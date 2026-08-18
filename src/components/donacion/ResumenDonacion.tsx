import type { ResumenDonacion } from "../../types/donacion";
import {
  ClipboardCheck,
  Eye,
  Handshake,
  PackageCheck,
  Truck,
} from "lucide-react";

interface Props {
  resumen: ResumenDonacion;
}

const tiles: {
  key: keyof ResumenDonacion;
  label: string;
  icon: typeof ClipboardCheck;
  bg: string;
  fg: string;
}[] = [
  {
    key: "total",
    label: "Intenciones totales",
    icon: ClipboardCheck,
    bg: "bg-[#5cb89a]/10",
    fg: "text-[#5cb89a]",
  },
  {
    key: "enEvaluacion",
    label: "En evaluacion",
    icon: Eye,
    bg: "bg-sky-50",
    fg: "text-sky-700",
  },
  {
    key: "enCoordinacion",
    label: "En coordinacion",
    icon: Handshake,
    bg: "bg-violet-50",
    fg: "text-violet-700",
  },
  {
    key: "enOperacion",
    label: "En operacion",
    icon: Truck,
    bg: "bg-amber-50",
    fg: "text-amber-700",
  },
  {
    key: "completados",
    label: "Completados",
    icon: PackageCheck,
    bg: "bg-emerald-50",
    fg: "text-emerald-700",
  },
];

export default function ResumenDonacion({ resumen }: Props) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {tiles.map(({ key, label, icon: Icon, bg, fg }) => {
        const value = resumen[key];
        return (
          <div
            key={key}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className={`mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg ${bg} ${fg}`}>
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs font-medium text-gray-500">{label}</p>
          </div>
        );
      })}
    </div>
  );
}
