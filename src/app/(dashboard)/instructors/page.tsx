"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { Instructor } from "@/models/instructor";
import EditInstructor from "./EditInstructor";
import InstructorTable from "./InstructorTable";
import ViewDetailsInstructor from "./ViewDetailsInstructor";
import { StatCard } from "@/components/ui/StatCard";
import CreateInstructor from "./CreateInstructor";
import { api } from "@/lib/sdk-config";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

export default function Instructor() {
  type InstructorDataList = {
    biography: string;
    birth_date: string;
    email: string;
    first_name: string;
    gender: string;
    identity_document: string;
    instructor_id: string;
    last_name: string;
    phone: string;
    profile_picture_url: string;
    user_id: string;
  };

  type DataResponse<T> = {
    data: T;
    message?: string;
    success?: boolean;
    count?: number;
  };

  const { token } = useAuth();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState<Instructor | null>(
    null,
  );
  const [viewInstructor, setViewInstructor] = useState<Instructor | null>(null);

  const [isLoadingInstructor, setIsLoadingInstructor] = useState(true);
  const [InstructorData, setInstructorData] = useState<Instructor[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const [filters, setFilters] = useState<Record<string, string | undefined>>(
    {},
  );

  const [page, setPage] = useState(2);
  const [pageSize, setPageSize] = useState(10);
  const [sort, setSort] = useState<"asc" | "desc">("desc");
  const [totalInstructor, setTotalInstructor] = useState(0);

  useEffect(() => {
    async function loadInstructorData() {
      setIsLoadingInstructor(true);
      try {
        const searchTerms = filters.name || filters.tax_id;
        const response: DataResponse<InstructorDataList[]> =
          await api.instructor.getInstructors(
            {
              limit: pageSize,
              page,
              sort,
              search: searchTerms,
            },
            token || "",
          );

        const mapped: Instructor[] = response.data.map((item) => ({
          id: item.instructor_id,
          instructor_id: item.instructor_id,
          user_id: item.user_id,
          first_name: item.first_name,
          last_name: item.last_name,
          email: item.email,
          phone: item.phone,
          birth_date: item.birth_date,
          gender: item.gender,
          identity_document: item.identity_document,
          biography: item.biography,
          profile_picture_url: item.profile_picture_url,
        }));

        setInstructorData(mapped);
        setTotalInstructor(response.count ?? mapped.length);
        console.log(mapped);
      } catch (error) {
        console.error("Error cargando instructores:", error);
      } finally {
        setIsLoadingInstructor(false);
      }
    }

    loadInstructorData();
  }, [page, pageSize, sort, filters, refreshKey, token]);

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      {showCreateForm ? (
        <CreateInstructor
          onBack={() => {
            setShowCreateForm(false);
            setFilters({}); // limpia filtros
            setPage(1); // vuelve a la primera página
            setRefreshKey((prev) => prev + 1); // recarga datos
          }}
        />
      ) : editingInstructor ? (
        <EditInstructor
          instructor={editingInstructor}
          onBack={() => setEditingInstructor(null)}
        />
      ) : viewInstructor ? (
        <ViewDetailsInstructor
          instructor={viewInstructor}
          onBack={() => setViewInstructor(null)}
        />
      ) : (
        <>
          <PageHeader title="INSTRUCTORES">
            <Button variant="primary" onClick={() => setShowCreateForm(true)}>
              <PlusIcon className="h-5 w-5" />
              Agregar Instructor
            </Button>
          </PageHeader>
          {/* <InstructorTable
            data={InstructorData}
            isLoading={isLoadingInstructor}
            onView={(instructor) => setViewInstructor(instructor)}
            onEdit={(instructor) => setEditingInstructor(instructor)}
          /> */}
          <InstructorTable
            data={InstructorData}
            isLoading={isLoadingInstructor}
            onView={(instructor) => setViewInstructor(instructor)}
            onEdit={(instructor) => setEditingInstructor(instructor)}
            filters={filters}
            setFilters={setFilters}
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            sort={sort}
            setSort={setSort}
            totalInstructor={totalInstructor}
            refreshKey={refreshKey}
            setRefreshKey={setRefreshKey}
          />
        </>
      )}
    </div>
  );
}
