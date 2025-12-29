"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import InputField from "@/components/ui/InputField";
import StepNotification from "../../StepNotification";

type StepProps = {
  formData: any; // Considera usar un tipo más específico
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleCustomChange: (field: string, value: string) => void;
  formErrors?: Record<string, string>;
};

import { useTranslations } from "next-intl";

export default function Step1({
  formData,
  handleChange,
  handleCustomChange,
  formErrors = {},
}: StepProps) {
  const t = useTranslations("branches");
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
        {t("create.form.basic_info.title")}
      </h3>
      <p className="text-sm text-gray-600 -mt-4">
        {t("create.form.basic_info.subtitle")}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="name"
          name="name"
          label={t("create.form.basic_info.name")}
          type="text"
          value={formData.name || ""}
          onChange={handleChange}
          placeholder={t("create.form.basic_info.name_placeholder")}
          error={formErrors["name"]}
        />

        <InputField
          id="taxId"
          name="taxId"
          label={t("create.form.basic_info.tax_id")}
          type="text"
          value={formData.taxId || ""}
          onChange={handleChange}
          placeholder={t("create.form.basic_info.tax_id_placeholder")}
          error={formErrors["taxId"]}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <InputField
          id="phone"
          name="phone"
          label={t("create.form.basic_info.phone")}
          type="tel"
          value={formData.phone || ""}
          onChange={handleChange}
          placeholder={t("create.form.basic_info.phone_placeholder")}
          error={formErrors["phone"]}
        />

        <div>
          <label htmlFor="status">{t("create.form.basic_info.status")}</label>
          <Select
            value={formData.status || "active"}
            onValueChange={(value) => handleCustomChange("status", value)}
          >
            <SelectTrigger id="status" className="mt-1 w-full">
              <SelectValue placeholder={t("create.form.basic_info.status_placeholder")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">{t("table.status.active")}</SelectItem>
              <SelectItem value="inactive">{t("table.status.inactive")}</SelectItem>
              <SelectItem value="maintenance">{t("table.status.maintenance")}</SelectItem>
            </SelectContent>
          </Select>
          {formErrors["status"] && (
            <p className="text-sm text-red-500 mt-1">{formErrors["status"]}</p>
          )}
        </div>
      </div>
      <StepNotification
        title={t("create.form.basic_info.next_steps.title")}
        description={t("create.form.basic_info.next_steps.description")}
      />
    </div>
  );
}
