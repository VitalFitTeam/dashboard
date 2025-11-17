// app/lib/validation/class.ts
import { z } from "zod";

export const ClassFormSchema = z
  .object({
    service_id: z.string().min(1, "El servicio es requerido"),
    branch_id: z.string().min(1, "La sucursal es requerida"),
    instructor_id: z.string().min(1, "El instructor es requerido"),
    max_capacity: z.string().min(1, "La capacidad máxima es requerida"),
    start_date: z.string().min(1, "La fecha de inicio es requerida"),
    start_time: z.string().min(1, "La hora de inicio es requerida"),
    end_date: z.string().min(1, "La fecha de fin es requerida"),
    end_time: z.string().min(1, "La hora de fin es requerida"),
  })
  .refine(
    (data) => {
      const startDateTime = new Date(`${data.start_date}T${data.start_time}`);
      const endDateTime = new Date(`${data.end_date}T${data.end_time}`);
      return endDateTime > startDateTime;
    },
    {
      message:
        "La fecha/hora de fin debe ser posterior a la fecha/hora de inicio",
      path: ["end_time"],
    },
  );

export type ClassFormData = z.infer<typeof ClassFormSchema>;
