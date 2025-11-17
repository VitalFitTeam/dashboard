"use client";

import { useAuth } from "@/context/AuthContext";
import InstructorForm from "../InstructorForm";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { InstructorData, DataResponse } from "@vitalfit/sdk";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";

export default function InstructorDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [instructor, setInstructor] = useState<InstructorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      router.replace("/instructors");
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
        const InstructorData: DataResponse<InstructorData> =
          await api.instructor.getInstructorById(id, token);

        if (!mounted) {
          return;
        }
        setInstructor(InstructorData.data);
      } catch (err: any) {
        if (!mounted) {
          return;
        }

        const status = err?.response?.status ?? err?.status ?? null;
        if (status === 404) {
          router.replace("/instructors");
        } else {
          console.error("Error cargando instructor:", err);
          setError("No se pudo cargar la información del instructor.");
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

  if (loading) {
    return <div className="p-6">Cargando Instructores...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!instructor) {
    return null;
  }
  return (
    <>
      <PageHeader title="DETALLES DE INSTRUCTOR">
        <Button
          variant="primary"
          onClick={() => {
            router.push(`/instructors/${id}/edit`);
          }}
        >
          Modificar
        </Button>
      </PageHeader>
      <InstructorForm
        mode="view"
        formData={instructor}
        onChange={(field, value) =>
          setInstructor((prev) => (prev ? { ...prev, [field]: value } : prev))
        }
      />
    </>
  );
}
