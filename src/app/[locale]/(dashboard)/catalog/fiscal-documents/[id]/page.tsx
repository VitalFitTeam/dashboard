"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import FiscalForm from "../FiscalForm";
import { mockFiscalDocuments, FiscalDocument } from "../data";
import { useRouter } from "@/i18n/navigation";

export default function FiscalDocumentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<FiscalDocument | null>(null);

  useEffect(() => {
    const foundDocument = mockFiscalDocuments.find(d => d.document_id === params.id);
    if (foundDocument) {
      setDocument(foundDocument);
    }
  }, [params.id]);

  if (!document) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="text-center p-10">Documento no encontrado</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="DETALLES DEL DOCUMENTO FISCAL">
        <Button
          onClick={() => router.push(`/catalog/fiscalDocument/${params.id}/edit`)}
          className="flex items-center gap-2"
        >
          Modificar
        </Button>
      </PageHeader>

      <div className="bg-white rounded-lg border">
        <FiscalForm
          document={document}
          mode="view"
        />
      </div>
    </div>
  );
}