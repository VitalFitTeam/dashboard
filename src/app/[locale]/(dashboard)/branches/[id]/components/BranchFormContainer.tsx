"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TabSelector } from "@/components/ui/TabSelector";
import { Button } from "@/components/ui/button";

import BranchBasicDataPanel from "./BranchBasicDataPanel";
import BranchServicePanel from "./BranchServicesPanel";
import BranchInstructorPanel from "./BranchInstructorsPanel";
import BranchEquipmentPanel from "./BranchEquipmentPanel";
import BranchPaymentMethodPanel from "./BranchPaymentMethodsPanel";

import { BranchDetails, ServiceFullDetail } from "@vitalfit/sdk";

interface BranchFormContainerProps {
  mode?: "view" | "edit";
  branch: BranchDetails;
}

import { useTranslations } from "next-intl";

export default function BranchFormContainer({
  mode = "edit",
  branch,
}: BranchFormContainerProps) {
  const t = useTranslations("branches");
  const router = useRouter();
  const [formData, setFormData] = useState<BranchDetails>({ ...branch });
  const [allServicesFromApi, setAllServicesFromApi] = useState<
    ServiceFullDetail[]
  >([]);

  const tabs = [
    {
      value: "basic",
      label: t("details.tabs.basic"),
      content: (
        <BranchBasicDataPanel
          mode={mode}
          formData={formData}
          setFormData={setFormData}
        />
      ),
    },
    {
      value: "payment",
      label: t("details.tabs.payment"),
      content: (
        <BranchPaymentMethodPanel mode={mode} branchId={branch.branch_id} />
      ),
    },
    {
      value: "services",
      label: t("details.tabs.services"),
      content: <BranchServicePanel branchId={branch.branch_id} mode={mode} />,
    },
    {
      value: "instructors",
      label: t("details.tabs.instructors"),
      content: (
        <BranchInstructorPanel mode={mode} branchId={branch.branch_id} />
      ),
    },
    {
      value: "equipment",
      label: t("details.tabs.equipment"),
      content: <BranchEquipmentPanel mode={mode} branchId={branch.branch_id} />,
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">
            {mode === "edit" ? t("details.edit_title") : t("details.title")}
          </h1>
          <p className="text-gray-500">
            {t("details.info_of", { name: formData.name })}
          </p>
        </div>

        <div className="flex gap-2">
          {mode === "view" && (
            <Button
              onClick={() => router.push(`/branches/${branch.branch_id}/edit`)}
            >
              {t("table.actions.edit")}
            </Button>
          )}
        </div>
      </div>

      <TabSelector tabs={tabs} defaultValue="basic" />
    </div>
  );
}
