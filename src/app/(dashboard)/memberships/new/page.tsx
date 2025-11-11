"use client";

import { useState } from "react";
import type { MembershipType } from "@vitalfit/sdk";
import type { CreateMembershipType } from "@vitalfit/sdk";
import { membershipSchema } from "@/lib/validation/membershipSchema";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import MembershipForm from "../MembershipForm";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { useRouter } from "next/navigation";
import { z } from "zod";

type ValidationResult = {
  success: boolean;
  data: CreateMembershipType | null;
  errors: Partial<Record<keyof MembershipType, string>> | null;
};

type MembershipFormData = Omit<MembershipType, "duration_days" | "price"> & {
  duration_days: number | string;
  price: number | string;
};

export default function CreateMembership() {
  const router = useRouter();

  const [formData, setFormData] = useState<MembershipFormData>({
    membership_type_id: "",
    name: "",
    description: "",
    duration_days: "",
    price: "",
    is_active: true,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof MembershipType, string>>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showServerError, setShowServerError] = useState({
    visible: false,
    message: "",
  });
  const [showConnectionError, setShowConnectionError] = useState(false);

  const handleChange = (field: keyof MembershipType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validateMembership = (data: MembershipFormData): ValidationResult => {
    try {
      // Convertir campos numéricos de string a number para validación
      const dataToValidate = {
        ...data,
        duration_days:
          data.duration_days === "" ? 0 : Number(data.duration_days),
        price: data.price === "" ? 0 : Number(data.price),
      };

      const validatedData = membershipSchema.parse(dataToValidate);
      return {
        success: true,
        data: validatedData,
        errors: null,
      };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: Partial<Record<keyof MembershipType, string>> =
          {};

        error.issues.forEach((issue) => {
          const fieldName = issue.path[0] as keyof MembershipType;
          if (fieldName) {
            validationErrors[fieldName] = issue.message;
          }
        });

        return {
          success: false,
          data: null,
          errors: validationErrors,
        };
      }

      return {
        success: false,
        data: null,
        errors: {
          name: "Error de validación inesperado",
        },
      };
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowServerError({ visible: false, message: "" });
    setShowConnectionError(false);

    // Validación con Zod
    const validation = validateMembership(formData);
    if (!validation.success) {
      setErrors(validation.errors || {});
      console.log("error al validar", validation.errors);
      return;
    }

    // Validación adicional para asegurar que data no es null
    if (!validation.data) {
      setErrors({
        name: "Error de validación: datos inválidos",
      });
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token || typeof token !== "string" || token.length < 10) {
      setShowServerError({
        visible: true,
        message: "Token de autenticación no encontrado.",
      });
      return;
    }

    const payload: CreateMembershipType = {
      name: validation.data.name,
      description: validation.data.description,
      duration_days: validation.data.duration_days,
      is_active: validation.data.is_active,
      price: validation.data.price,
    };

    setIsLoading(true);
    try {
      await api.membership.createMembershipType(payload, token);
      setShowSuccess(true);
      setTimeout(() => {
        router.push("/memberships");
      }, 1500);
    } catch (err: unknown) {
      console.error("Error al crear membresía:", err);

      if (err && typeof err === "object" && "response" in err) {
        const errorWithResponse = err as {
          response?: { data?: { error?: string } };
        };
        if (errorWithResponse.response?.data?.error) {
          setShowServerError({
            visible: true,
            message: errorWithResponse.response.data.error,
          });
        } else {
          setShowConnectionError(true);
        }
      } else {
        setShowConnectionError(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-2">
        <PageHeader title="CREAR MEMBRESÍA"></PageHeader>
        <p className="text-sm text-muted-foreground">
          Agrega la información de la membresía
        </p>

        <MembershipForm
          formData={formData}
          onChange={handleChange}
          edit={false}
          errors={errors}
        />
        <Button
          type="submit"
          className="w-full"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? "Guardando..." : "Crear"}
        </Button>
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="Membresía creada exitosamente!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      {showConnectionError && (
        <Notification
          variant="destructive"
          title="Error de conexión"
          description="No se pudo conectar con el servidor. Intenta más tarde."
          onClose={() => setShowConnectionError(false)}
        />
      )}
      {showServerError.visible && (
        <Notification
          variant="destructive"
          title="Error al crear membresía"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
