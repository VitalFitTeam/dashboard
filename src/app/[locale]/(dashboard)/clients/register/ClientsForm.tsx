"use client";

import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/Label";
import { PhoneInput } from "@/components/ui/phone-input";
import { useTranslations } from "next-intl";

export interface ClientData {
  client_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  gender: string;
  identity_document: string;
  phone: string;
  category: string;
  status: string;
}

interface ClientsFormProps {
  client: ClientData;
  onChange: (field: keyof ClientData, value: any) => void;
  mode?: "view" | "edit" | "create";
  errors?: Partial<Record<keyof ClientData, string>>;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function ClientsForm({
  client,
  errors = {},
  onChange,
  mode = "view",
  onSave,
  onCancel,
}: ClientsFormProps) {
  const t = useTranslations("clients.form");
  const tStatus = useTranslations("clients.table.status");
  const disabled = mode === "view";

  const handleChange = (field: keyof ClientData, value: any) => {
    onChange(field, value);
  };

  return (
    <div className="space-y-8 p-6">
      <div className="space-y-6">
        <p className="text-lg font-semibold">{t("sections.basic")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="first_name">{t("labels.first_name")}</Label>
            <Input
              id="first_name"
              value={client.first_name}
              onChange={(e) => handleChange("first_name", e.target.value)}
              disabled={disabled}
            />
            {errors.first_name && <p className="text-sm text-red-500">{errors.first_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="last_name">{t("labels.last_name")}</Label>
            <Input
              id="last_name"
              value={client.last_name}
              onChange={(e) => handleChange("last_name", e.target.value)}
              disabled={disabled}
            />
            {errors.last_name && <p className="text-sm text-red-500">{errors.last_name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{t("labels.email")}</Label>
            <Input
              id="email"
              value={client.email}
              onChange={(e) => handleChange("email", e.target.value)}
              disabled={disabled}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">{t("labels.birth_date")}</Label>
            <Input
              id="birth_date"
              type="date"
              value={client.birth_date}
              onChange={(e) => handleChange("birth_date", e.target.value)}
              disabled={disabled}
            />
            {errors.birth_date && <p className="text-sm text-red-500">{errors.birth_date}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("labels.gender")}</Label>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="female"
                name="gender"
                value="female"
                checked={client.gender === "female"}
                onChange={(e) => handleChange("gender", e.target.value)}
                disabled={disabled}
                className="h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <Label htmlFor="female" className="font-normal">{t("gender.female")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="male"
                name="gender"
                value="male"
                checked={client.gender === "male"}
                onChange={(e) => handleChange("gender", e.target.value)}
                disabled={disabled}
                className="h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <Label htmlFor="male" className="font-normal">{t("gender.male")}</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="radio"
                id="other"
                name="gender"
                value="prefer-not-to-say"
                checked={client.gender === "prefer-not-to-say"}
                onChange={(e) => handleChange("gender", e.target.value)}
                disabled={disabled}
                className="h-4 w-4 border-gray-300 text-orange-600 focus:ring-orange-500"
              />
              <Label htmlFor="other" className="font-normal">{t("gender.other")}</Label>
            </div>
          </div>
          {errors.gender && <p className="text-sm text-red-500">{errors.gender}</p>}
        </div>

        <p className="text-lg font-semibold pt-4">{t("sections.identity")}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="identity_document">{t("labels.identity_document")}</Label>
            <Input
              id="identity_document"
              value={client.identity_document}
              onChange={(e) => handleChange("identity_document", e.target.value)}
              disabled={disabled}
            />
            {errors.identity_document && <p className="text-sm text-red-500">{errors.identity_document}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">{t("labels.phone")}</Label>
            <PhoneInput
              id="phone"
              value={client.phone}
              onChange={(value) => handleChange("phone", value)}
              disabled={disabled}
              defaultCountry="VE"
            />
            {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">{t("labels.category")}</Label>
            <Select
              value={client.category}
              onValueChange={(val) => handleChange("category", val)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("placeholder.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="VIP">{t("categories.vip")}</SelectItem>
                <SelectItem value="Regular">{t("categories.regular")}</SelectItem>
                <SelectItem value="Nuevo">{t("categories.new")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="status">{t("labels.status")}</Label>
            <Select
              value={client.status}
              onValueChange={(val) => handleChange("status", val)}
              disabled={disabled}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("placeholder.select")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">{tStatus("active")}</SelectItem>
                <SelectItem value="inactive">{tStatus("inactive")}</SelectItem>
                <SelectItem value="blocked">{tStatus("blocked")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && <p className="text-sm text-red-500">{errors.status}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}