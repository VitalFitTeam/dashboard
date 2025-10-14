"use client";
import React from "react";
import Input from "./Input";
import Button from "./Button";

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
    <div className="p-6 bg-white space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input
          label="Nombre*"
          type="text"
          defaultValue={user.first_name}
          disabled
        />
        <Input
          label="Apellido*"
          type="text"
          defaultValue={user.last_name}
          disabled
        />
        <Input
          label="Número de telefono*"
          type="text"
          defaultValue={user.phone || ""}
          disabled
        />
        <Input
          label="Documento de identidad*"
          type="text"
          defaultValue={user.identity_document || ""}
          disabled
        />
        <Input
          label="Fecha de nacimiento*"
          type="date"
          defaultValue={user.birth_date ? user.birth_date.split("T")[0] : ""}
          disabled
        />
        <Input
          label="Correo electrónico*"
          type="email"
          defaultValue={user.email}
          disabled
        />
      </div>
      <div className="pt-4">
        <Button width="w-full" variant="primary" disabled>
          Actualizar datos
        </Button>
      </div>
    </div>
  );
};
