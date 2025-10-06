import React from "react";
import Input from "./input";
import Button from "./button";

export const AccountForm: React.FC = () => {
  // const [accountData, setAccountData] = useState<FormData>(...);

  return (
    <div className="p-6 bg-white space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Input label="Nombre*" type="text" placeholder="Alba" />
        <Input label="Apellido*" type="text" placeholder="Barragán" />
        <Input
          label="Número de telefono*"
          type="text"
          placeholder="+581234567891"
        />
        <Input
          label="Documento de identidad*"
          type="text"
          placeholder="12345678"
        />
        <Input
          label="Fecha de nacimiento*"
          type="date"
          placeholder="10/07/2001"
          defaultValue="2001-07-10"
        />
        <Input
          label="Correo electrónico*"
          type="email"
          placeholder="albanibarragan@gmail.com"
          defaultValue="albanibarragan@gmail.com"
        />
      </div>
      <div className="pt-4">
        <Button width="w-full" variant="primary">
          Actualizar datos
        </Button>
      </div>
    </div>
  );
};
