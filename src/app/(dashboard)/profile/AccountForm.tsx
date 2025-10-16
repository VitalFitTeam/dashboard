"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import InputField from "@/components/InputField";

interface AccountFormProps {
  user: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    identity_document?: string;
    birth_date?: string;
  };
}

export const AccountForm: React.FC<AccountFormProps> = ({ user }) => {
  return (
    <form className="p-6 bg-white space-y-8 rounded-xl shadow-sm">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <InputField
          label="Nombre*"
          type="text"
          value={user.first_name}
          disabled
        />

        <InputField
          label="Apellido*"
          type="text"
          value={user.last_name}
          disabled
        />

        <InputField
          label="Número de teléfono*"
          type="text"
          value={user.phone || ""}
          disabled
        />

        <InputField
          label="Documento de identidad*"
          type="text"
          value={user.identity_document || ""}
          disabled
        />

        <InputField
          label="Fecha de nacimiento*"
          type="date"
          value={user.birth_date ? user.birth_date.split("T")[0] : ""}
          disabled
        />

        <InputField
          label="Correo electrónico*"
          type="email"
          value={user.email}
          disabled
        />
      </div>

      <div className="pt-4">
        <Button fullWidth variant="primary" disabled>
          Actualizar datos
        </Button>
      </div>
    </form>
  );
};
