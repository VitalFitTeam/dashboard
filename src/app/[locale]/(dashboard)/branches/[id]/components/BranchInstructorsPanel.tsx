"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/sdk-config";
import { useAuth } from "@/context/AuthContext";
import { BranchInstructorInfo, InstructorDataList } from "@vitalfit/sdk";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import EntityItem from "@/components/layout/EntityItem";

interface BranchInstructorPanelProps {
  branchId: string;
  mode?: "view" | "edit";
}

import { useTranslations } from "next-intl";

export default function BranchInstructorPanel({
  branchId,
  mode = "edit",
}: BranchInstructorPanelProps) {
  const t = useTranslations("branches");
  const { token } = useAuth();
  const isViewMode = mode === "view";

  const [branchInstructors, setBranchInstructors] = useState<
    BranchInstructorInfo[]
  >([]);
  const [allInstructors, setAllInstructors] = useState<InstructorDataList[]>(
    [],
  );
  const [selectedInstructorId, setSelectedInstructorId] = useState<
    string | null
  >(null);
  const [newInstructors, setNewInstructors] = useState<string[]>([]);

  const [loadingData, setLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreInstructors, setHasMoreInstructors] = useState(true);

  const fetchedRef = useRef(false);

  const fetchBranchInstructors = useCallback(async () => {
    if (!token || !branchId) { return; }

    try {
      setLoadingData(true);
      const res = await api.instructor.getBranchInstructors(
        branchId,
        {},
        token,
      );

      const mapped = (res.data || []).map((i: any) => ({
        instructorID: i.instructor_id,
        instructorName: i.instructor_name,
        email: i.email,
        phone: i.phone,
      }));

      setBranchInstructors(mapped);
    } catch (err) {
      console.error("Error cargando instructores:", err);
      toast.error(t("details.instructors.error_loading"));
    } finally {
      setLoadingData(false);
    }
  }, [token, branchId, t]);

  const fetchAllInstructors = useCallback(
    async (page = 1) => {
      if (!token || !hasMoreInstructors) { return; }

      try {
        setLoadingData(true);
        const res = await api.instructor.getInstructors({ page }, token);

        if (res.data?.length) {
          setAllInstructors((prev) => {
            const merged = [...prev, ...res.data];
            const unique = merged.filter(
              (v, i, a) =>
                a.findIndex((t) => t.instructor_id === v.instructor_id) === i,
            );
            return unique;
          });
        } else {
          setHasMoreInstructors(false);
        }
      } catch (err) {
        console.error("Error cargando instructores:", err);
        toast.error(t("details.instructors.error_loading"));
      } finally {
        setLoadingData(false);
      }
    },
    [token, hasMoreInstructors, t],
  );

  useEffect(() => {
    if (fetchedRef.current) { return; }
    fetchedRef.current = true;

    fetchBranchInstructors();

    if (!isViewMode) { fetchAllInstructors(); }
  }, [fetchBranchInstructors, fetchAllInstructors, isViewMode]);

  useEffect(() => {
    if (allInstructors.length > 50) {
      toast.info(t("details.instructors.info_scroll"));
    }
  }, [allInstructors, t]);

  const handleAddInstructor = () => {
    if (isViewMode || !selectedInstructorId) { return; }

    if (
      branchInstructors.some((i) => i.instructorID === selectedInstructorId)
    ) {
      toast.error(t("details.instructors.already_assigned"));
      return;
    }

    const instructor = allInstructors.find(
      (i) => i.instructor_id === selectedInstructorId,
    );
    if (!instructor) { return; }

    setBranchInstructors((prev) => [
      ...prev,
      {
        instructorID: instructor.instructor_id,
        instructorName: `${instructor.first_name} ${instructor.last_name}`,
        email: instructor.email ?? "",
        phone: instructor.phone ?? "",
      },
    ]);

    setNewInstructors((prev) => [...prev, selectedInstructorId]);
    setDirty(true);
    setSelectedInstructorId(null);

    toast.success(t("details.instructors.success_added_pending"));
  };

  const handleRemoveInstructor = async (instructorId: string) => {
    if (isViewMode) { return; }
    if (!token) { return; }

    if (newInstructors.includes(instructorId)) {
      setBranchInstructors((prev) =>
        prev.filter((i) => i.instructorID !== instructorId),
      );
      setNewInstructors((prev) => prev.filter((id) => id !== instructorId));
      setDirty(newInstructors.length > 1);
      toast.success(t("details.instructors.success_removed_local"));
      return;
    }

    try {
      setLoadingData(true);
      await api.instructor.removeBranchInstructor(
        branchId,
        instructorId,
        token,
      );

      setBranchInstructors((prev) =>
        prev.filter((i) => i.instructorID !== instructorId),
      );

      toast.success(t("details.instructors.success_removed"));
    } catch (err) {
      console.error("Error eliminando instructor:", err);
      toast.error(t("details.instructors.error_removing"));
    } finally {
      setLoadingData(false);
    }
  };

  const handleSave = async () => {
    if (!token || !branchId || newInstructors.length === 0) {
      toast.error(t("details.instructors.no_changes"));
      return;
    }

    setIsSaving(true);
    try {
      await api.instructor.addBranchInstructor(branchId, newInstructors, token);
      setNewInstructors([]);
      await fetchBranchInstructors();
      setDirty(false);

      toast.success(t("details.instructors.success_save"));
    } catch (err) {
      console.error("Error guardando cambios:", err);
      toast.error(t("details.instructors.error_save"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {!isViewMode && (
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-grow">
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              {t("details.instructors.add_label")}
            </label>

            <Select
              value={selectedInstructorId ?? ""}
              onValueChange={setSelectedInstructorId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("details.instructors.select_placeholder")} />
              </SelectTrigger>

              <SelectContent
                onScroll={(e) => {
                  const target = e.target as HTMLElement;
                  if (
                    target.scrollTop + target.clientHeight >=
                    target.scrollHeight - 10 &&
                    hasMoreInstructors
                  ) {
                    const nextPage = currentPage + 1;
                    setCurrentPage(nextPage);
                    fetchAllInstructors(nextPage);
                  }
                }}
              >
                {allInstructors.map((instr) => (
                  <SelectItem
                    key={instr.instructor_id}
                    value={instr.instructor_id}
                  >
                    {`${instr.first_name} ${instr.last_name}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="button"
            onClick={handleAddInstructor}
            disabled={!selectedInstructorId || loadingData || isSaving}
          >
            {t("details.instructors.add_button")}
          </Button>

          <Button
            type="button"
            onClick={handleSave}
            disabled={!dirty || isSaving}
          >
            {isSaving ? t("create.form.buttons.saving") : t("create.form.buttons.save")}
          </Button>
        </div>
      )}

      <div className="space-y-2">
        {loadingData ? (
          <p className="text-sm text-gray-500">{t("details.instructors.loading")}</p>
        ) : branchInstructors.length === 0 ? (
          <p className="text-sm text-gray-500">
            {t("details.instructors.empty")}
          </p>
        ) : (
          branchInstructors.map((instr) => (
            <EntityItem
              key={instr.instructorID}
              initials={
                instr.instructorName
                  ?.split(" ")
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join("") ?? "?"
              }
              title={instr.instructorName ?? "Sin nombre"}
              description={instr.email}
              action={
                !isViewMode ? (
                  <button
                    className="text-sm text-red-500 hover:underline"
                    onClick={() => handleRemoveInstructor(instr.instructorID)}
                  >
                    {t("details.instructors.remove")}
                  </button>
                ) : undefined
              }
            />
          ))
        )}
      </div>
    </div>
  );
}
