"use client";

import { useAuth } from "@/context/AuthContext";
import BranchFormContainer from "./components/BranchFormContainer";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/sdk-config";
import { BranchDetails } from "@vitalfit/sdk";

import { useTranslations } from "next-intl";

export default function ViewBranchPage() {
  const t = useTranslations("branches");
  const params = useParams();
  const router = useRouter();
  const { token } = useAuth();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<BranchDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      router.replace("/branches");
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
        const branchData = await api.branch.getBranchById(id, token);

        if (!mounted) {
          return;
        }
        setBranch(branchData);
      } catch (err: any) {
        if (!mounted) {
          return;
        }

        const status = err?.response?.status ?? err?.status ?? null;
        if (status === 404) {
          router.replace("/branches");
        } else {
          console.error("Error cargando sucursal:", err);
          setError(t("details.error_loading"));
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
    return <div className="p-6">{t("details.loading")}</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  if (!branch) {
    return null;
  }
  return <BranchFormContainer mode="view" branch={branch} />;
}
