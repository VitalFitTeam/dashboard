import React from "react";
import Input from "./Input";
import Button from "./Button";

export const PasswordForm: React.FC = () => {
  return (
    <div className="p-6 bg-white space-y-6">
      <div className="space-y-4">
        <Input
          label="Contraseña Actual*"
          type="password"
          placeholder="Ingresa tu contraseña actual"
        />
        <Input
          label="Nueva Contraseña*"
          type="password"
          placeholder="Ingresa una nueva contraseña"
        />
        <Input
          label="Confirmar Nueva Contraseña*"
          type="password"
          placeholder="Confirma la nueva contraseña"
        />
      </div>

      <div className="pt-4">
        <Button width="w-full" variant="primary">
          Actualizar Contraseña
        </Button>
      </div>
    </div>
  );
};
