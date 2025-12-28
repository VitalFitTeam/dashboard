"use client";

import StepNotification from "../../StepNotification";
import { Checkbox } from "@/components/ui/checkbox";
import * as React from "react";

type StepProps = {
  formData: any;
  formErrors?: Record<string, string>;
};

import { useTranslations } from "next-intl";

export default function Step4({ formData }: StepProps) {
  const t = useTranslations("branches");

  const defaultPolicies = [
    { id: "p1", text: t("create.form.confirm.policies.p1") },
    { id: "p2", text: t("create.form.confirm.policies.p2") },
    { id: "p3", text: t("create.form.confirm.policies.p3") },
    { id: "p4", text: t("create.form.confirm.policies.p4") },
    { id: "p5", text: t("create.form.confirm.policies.p5") },
    { id: "p6", text: t("create.form.confirm.policies.p6") },
    { id: "p7", text: t("create.form.confirm.policies.p7") },
    { id: "p8", text: t("create.form.confirm.policies.p8") },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-1">
          {t("create.form.confirm.title")}
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          {t("create.form.confirm.subtitle")}
        </p>

        <div className="space-y-4">
          <p className="text-sm font-semibold text-gray-700">
            {t("create.form.confirm.checkbox_label")}
          </p>
          {defaultPolicies.map((policy) => (
            <div key={policy.id} className="flex items-start space-x-3">
              <Checkbox
                id={policy.id}
                className="mt-1 data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
              />
              <label
                htmlFor={policy.id}
                className="text-sm font-normal leading-tight text-gray-700 cursor-pointer"
              >
                {policy.text}
              </label>
            </div>
          ))}
        </div>

        <p className="text-xs text-gray-500 mt-4">
          {t("create.form.confirm.footer_hint")}
        </p>
      </div>

      <StepNotification
        title={t("create.form.confirm.next_steps.title")}
        description={t("create.form.confirm.next_steps.description")}
      />
    </div>
  );
}
