"use client";

import { useAuth } from "@/context/AuthContext";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { DataResponse, PackageDetail } from "@vitalfit/sdk";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import PackageForm from "../PackageForm";

export default function PackageDetailPage() {
  const params = useParams();
  const { token } = useAuth();
  const router = useRouter();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [packageD, setPackageD] = useState<PackageDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      router.replace("/packages");
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
        const PackageData: DataResponse<PackageDetail> =
          await api.packages.getPackageByID(id, token);

        if (!mounted) {
          return;
        }
        setPackageD(PackageData.data);
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

  if (!packageD) {
    return null;
  }
  return (
    <>
      <PageHeader title="DETALLES DEL PAQUETE">
        <Button
          variant="default"
          onClick={() => {
            router.push(`/packages/${id}/edit`);
          }}
        >
          Modificar
        </Button>
      </PageHeader>
      <PackageForm
        formData={packageD}
        mode="view"
        services={packageD.packageItems.map((i) => ({
          id: i.serviceId,
          name: i.name,
        }))}
      />
    </>
  );
}
