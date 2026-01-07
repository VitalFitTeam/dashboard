"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import FiscalTable from "./FiscalTable";
import { useEffect, useState, useCallback } from "react";
import { mockFiscalDocuments, type FiscalDocument } from "./data";
import { useRouter } from "@/i18n/navigation";

export default function FiscalDocument() {
  const router = useRouter();

  const [documentsData, setDocumentsData] = useState<FiscalDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [filters, setFilters] = useState({
    search: "",
  });

  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const loadDocumentsData = useCallback(async () => {
    setIsLoading(true);
    
    setTimeout(() => {
      let filteredData = [...mockFiscalDocuments];
      
      if (filters.search) {
        filteredData = filteredData.filter(document => 
          document.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          document.prefix.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setDocumentsData(filteredData);
      setTotalItems(filteredData.length);
      setIsLoading(false);
    }, 500);
  }, [page, pageSize, filters]);

  useEffect(() => {
    loadDocumentsData();
  }, [loadDocumentsData]);

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleFilterChange = (newFilters: {
    search?: string;
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader subtitle="Listado del catálogo de documentos Fiscales " title="DOCUMENTOS FISCALES">
        <Button
          className="bg-transparent text-black border border-gray-100"
          onClick={() => router.push("/catalog/fiscalDocument/new")}
        >
          <PlusIcon className="h-5 w-5" />
          Agregar Documento
        </Button>
      </PageHeader>

      {isLoading ? (
        <div className="text-center p-10">Cargando documentos...</div>
      ) : (
        <FiscalTable
          data={documentsData}
          onReload={loadDocumentsData}
          page={page}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          totalPages={totalPages}
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      )}
    </div>
  );
}