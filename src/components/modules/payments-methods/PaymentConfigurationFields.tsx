import { Input } from "@/components/ui/Input";

interface ConfigProps {
  type: string;
  config: any;
  onChange: (field: string, value: string) => void;
  disabled: boolean;
  errors?: any;
}

export function PaymentConfigurationFields({ type, config, onChange, disabled, errors }: ConfigProps) {
  // 1. ZELLE
  if (type === "Other") { // O si tienes un subtipo para Zelle
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConfigInput label="Email Zelle" value={config?.email} onChange={(v) => onChange("email", v)} disabled={disabled} />
      </div>
    );
  }

  // 2. TRANSFERENCIA BANCARIA
  if (type === "Transfer") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConfigInput label="Banco" value={config?.bank_name} onChange={(v) => onChange("bank_name", v)} disabled={disabled} />
        <ConfigInput label="Número de Cuenta" value={config?.account_number} onChange={(v) => onChange("account_number", v)} disabled={disabled} />
        <ConfigInput label="RIF / Tax ID" value={config?.tax_id} onChange={(v) => onChange("tax_id", v)} disabled={disabled} />
      </div>
    );
  }

  // 3. PAGO MÓVIL
  // Podrías identificarlo por una propiedad extra si el 'type' es genérico
  if (type === "PagoMovil") { 
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConfigInput label="Teléfono" value={config?.phone} onChange={(v) => onChange("phone", v)} disabled={disabled} />
        <ConfigInput label="ID Banco" value={config?.bank_id} onChange={(v) => onChange("bank_id", v)} disabled={disabled} />
        <ConfigInput label="Cédula / RIF" value={config?.tax_id} onChange={(v) => onChange("tax_id", v)} disabled={disabled} />
      </div>
    );
  }

  return <p className="text-xs text-muted-foreground italic">No se requiere configuración adicional para este método.</p>;
}

function ConfigInput({ label, value, onChange, disabled }: any) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-600">{label}</label>
      <Input value={value || ""} onChange={(e) => onChange(e.target.value)} disabled={disabled} size={30} className="h-8 text-sm" />
    </div>
  );
}