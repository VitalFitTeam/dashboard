"use client";

import { useState, useEffect } from "react";
import type { UpdateMembershipType } from "@vitalfit/sdk";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import MembershipForm from "../../MembershipForm";
import { api } from "@/lib/sdk-config";
import { Notification } from "@/components/ui/Notification";
import { useAuth } from "@/context/AuthContext";
import { MembershipType } from "@vitalfit/sdk";
import { useRouter, useParams } from "next/navigation";
import { membershipSchema } from "@/lib/validation/membershipSchema";

export default function EditMembership() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params?.id as string | undefined;

  const [loading, setLoading] = useState(true);
  const [membership, setMembership] = useState<MembershipType | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  const [formData, setFormData] = useState<MembershipType>({
    membership_type_id: "",
    name: "",
    description: "",
    duration_days: 0,
    is_active: true,
    price: 0,
  });

  useEffect(() => {
    if (!id) {
      router.replace("/memberships");
      return;
    }
    if (!token) {
      return;
    }

    let mounted = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const membershipData = await api.membership.getMembershipTypeByID(
          id,
          token,
        );
        if (!mounted) {
          return;
        }
        setMembership(membershipData.data);
      } catch (err: any) {
        if (!mounted) {
          return;
        }
        const status = err?.response?.status ?? err?.status ?? null;
        if (status === 404) {
          router.replace("/memberships");
        } else {
          console.error("Error cargando membresia:", err);
          setError("No se pudo cargar la información de la membresía.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id, token, router]);

  useEffect(() => {
    if (membership) {
      setFormData({
        membership_type_id: membership.membership_type_id,
        name: membership.name ?? "",
        description: membership.description ?? "",
        duration_days: membership.duration_days ?? "",
        is_active: membership.is_active ?? true,
        price: membership.price ?? 0,
      });
    }
  }, [membership]);

  const handleChange = (field: keyof MembershipType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (
    formData: MembershipType,
    setErrors: (errors: Partial<Record<keyof MembershipType, string>>) => void,
  ): boolean => {
    const result = membershipSchema.safeParse(formData);

    if (!result.success) {
      const zodErrors = result.error.flatten().fieldErrors;

      const formattedErrors = Object.entries(zodErrors).reduce(
        (acc, [key, messages]) => {
          if (messages && messages.length > 0) {
            acc[key as keyof MembershipType] = messages[0];
          }
          return acc;
        },
        {} as Partial<Record<keyof MembershipType, string>>,
      );

      setErrors(formattedErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowServerError({ visible: false, message: "" });
    setShowConnectionError(false);

    const isValid = validate(formData, setErrors);
    if (!isValid) {
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

    const payload: UpdateMembershipType = {
      name: formData.name,
      description: formData.description ?? "",
      duration_days: formData.duration_days,
      is_active: formData.is_active,
      price: formData.price,
    };

    setIsLoading(true);
    try {
      await api.membership.updateMembershipType(
        formData.membership_type_id,
        payload,
        token,
      );
      setShowSuccess(true);
      setTimeout(() => router.push("/memberships"), 1500);
    } catch (err: any) {
      console.error("Error al actualizar membresia:", err);
      if (err?.response?.data?.error) {
        setShowServerError({ visible: true, message: err.response.data.error });
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
        <PageHeader title="MODIFICAR MEMBRESÍA">
          <Button
            variant="secondary"
            onClick={() => router.push("/memberships")}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="default" disabled={isLoading}>
            {isLoading ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </PageHeader>
        <p className="text-sm text-muted-foreground">
          Modifica la información de la membresía {membership?.name}
        </p>

        {!loading && (
          <MembershipForm
            formData={formData}
            onChange={handleChange}
            mode="edit"
            errors={errors}
          />
        )}
      </form>

      {showSuccess && (
        <Notification
          variant="success"
          description="Membresía actualizado exitosamente!"
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
          title="Error al actualizar membresia"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
