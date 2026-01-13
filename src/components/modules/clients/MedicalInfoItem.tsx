import { Badge } from "@/components/ui/badge";

export const  MedicalInfoItem = ({
  label,
  value,
  isCritical,
  isBadge,
  icon,
  fullWidth,
}: any) => (
  <div className={`space-y-1.5 ${fullWidth ? "sm:col-span-2" : ""}`}>
    <p
      className={`text-[10px] font-bold uppercase tracking-widest ${isCritical ? "text-red-500" : "text-muted-foreground/70"}`}
    >
      {label}
    </p>

    {isBadge && value ? (
      <Badge
        variant="outline"
        className="border-primary text-primary font-black italic px-4 py-1 bg-primary/5"
      >
        {value}
      </Badge>
    ) : (
      <div
        className={`flex items-start gap-2.5 p-3 rounded-md border ${
          value
            ? "bg-muted/40 border-muted-foreground/10"
            : "border-dashed border-muted-foreground/20"
        }`}
      >
        {icon && <span className="mt-0.5">{icon}</span>}
        <p
          className={`text-sm leading-relaxed ${!value ? "italic text-muted-foreground/30 font-normal" : "font-medium text-foreground"}`}
        >
          {value || "No se han registrado datos"}
        </p>
      </div>
    )}
  </div>
);