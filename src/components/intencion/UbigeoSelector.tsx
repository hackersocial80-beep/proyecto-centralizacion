import { useState, useEffect } from "react";
import {
  Select
} from "../ui";
import { fetchDepartments as apiFetchDepartments, fetchProvinces as apiFetchProvinces, fetchDistricts as apiFetchDistricts } from "../../services/catalogService";

// Tipos locales para el manejo de Ubigeo
interface UbigeoItem {
  code: string;
  name: string;
}

interface ProductoForm {
  id: string;
  producto: string;
  descripcion: string;
  cantidad: string;
  unidad: string;
  pesoEstimadoKg: string;
  vidaUtil: string;
  tipoProducto: string;
  procedencia: string;
  tipoLugar: string;
  lugar: string;
  contactoPlanta: string;
  direccion: string;
  referencia: string;
  distrito: string;
  provincia: string;
  departamento: string;
  codigoPostal: string;
  tipoAcceso: string;
  horarioInicio: string;
  horarioFinal: string;
  diasAtencion: string[];
  requiereAutorizacion: "Si" | "No";
  anticipacion: string;
  motivosDonacion: string[];
  compromisosIdoneidad: string[];
  contactoAutorizacion: string;
  numeroContacto: string;
  requisitosIngreso: string[];
  fechaDesde: string;
  fechaHasta: string;
  horarioDisponible: string;
  tiempoEstimadoCarga: string;
  latitud: string;
  longitud: string;
  observacionesAcceso: string;
}

export default function UbigeoSelector({
  productoId,
  initialValues,
  onChange
}: {
  productoId: string;
  initialValues: Partial<ProductoForm>;
  onChange: (id: string, field: string, value: any) => void;
}) {
  const [departments, setDepartments] = useState<UbigeoItem[]>([]);
  const [provinces, setProvinces] = useState<UbigeoItem[]>([]);
  const [districts, setDistricts] = useState<UbigeoItem[]>([]);
  const [isLoading, setIsLoading] = useState({ dept: false, prov: false, dist: false });

  const loadDepartments = async () => {
    setIsLoading(prev => ({ ...prev, dept: true }));
    try {
      const data = await apiFetchDepartments();
      const normalized = (data || []).map((item: any) => ({
        code: String(item.code || item.id || ""),
        name: item.name || item.descripcion || "Sin nombre"
      }));
      setDepartments(normalized);
    } catch (e) {
      console.error("Error fetching departments", e);
    } finally {
      setIsLoading(prev => ({ ...prev, dept: false }));
    }
  };

  const loadProvinces = async (deptCode: string) => {
    setIsLoading(prev => ({ ...prev, prov: true }));
    try {
      const data = await apiFetchProvinces(deptCode);
      const normalized = (data || []).map((item: any) => ({
        code: String(item.code || item.id || ""),
        name: item.name || item.descripcion || "Sin nombre"
      }));
      setProvinces(normalized);
    } catch (e) {
      console.error("Error fetching provinces", e);
    } finally {
      setIsLoading(prev => ({ ...prev, prov: false }));
    }
  };

  const loadDistricts = async (provCode: string) => {
    setIsLoading(prev => ({ ...prev, dist: true }));
    try {
      const data = await apiFetchDistricts(provCode);
      const normalized = (data || []).map((item: any) => ({
        code: String(item.code || item.id || ""),
        name: item.name || item.descripcion || "Sin nombre"
      }));
      setDistricts(normalized);
    } catch (e) {
      console.error("Error fetching districts", e);
    } finally {
      setIsLoading(prev => ({ ...prev, dist: false }));
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleDeptChange = (val: string) => {
    onChange(productoId, "departamento", val);
    setProvinces([]);
    setDistricts([]);
    if (val) loadProvinces(val);
  };

  const handleProvChange = (val: string) => {
    onChange(productoId, "provincia", val);
    setDistricts([]);
    if (val) loadDistricts(val);
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-3">
      <Select
        label="Departamento"
        value={initialValues.departamento || ""}
        onChange={(e) => handleDeptChange(e.target.value)}
      >
        <option value="">Seleccionar Departamento</option>
        {departments.map((d, idx) => (
          <option key={`dept-${d.code}-${idx}`} value={d.code}>
            {d.name}
          </option>
        ))}
        {isLoading.dept && <option disabled>Cargando...</option>}
      </Select>

      <Select
        label="Provincia"
        value={initialValues.provincia || ""}
        onChange={(e) => handleProvChange(e.target.value)}
        disabled={!initialValues.departamento || isLoading.prov}
      >
        <option value="">Seleccionar Provincia</option>
        {provinces.map((p, idx) => (
          <option key={`prov-${p.code}-${idx}`} value={p.code}>
            {p.name}
          </option>
        ))}
      </Select>

      <Select
        label="Distrito"
        value={initialValues.distrito || ""}
        onChange={(e) => onChange(productoId, "distrito", e.target.value)}
        disabled={!initialValues.provincia || isLoading.dist}
      >
        <option value="">Seleccionar Distrito</option>
        {districts.map((d, idx) => (
          <option key={`dist-${d.code}-${idx}`} value={d.code}>
            {d.name}
          </option>
        ))}
      </Select>
    </div>
  );
}