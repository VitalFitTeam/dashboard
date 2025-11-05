"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { typography } from "@/styles/styles";
import Image from "next/image";
import { Notification } from "@/components/ui/Notification";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import InputField from "@/components/ui/InputField";

export default function ActivateInstructor() {
  const router = useRouter();
  const { token } = useParams();

  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [showServerError, setShowServerError] = useState({
    visible: false,
    message: "",
  });

  const [formData, setFormData] = useState({
    password: "",
  });

  const [errors, setErrors] = useState<{
    password?: string;
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowServerError({ visible: false, message: "" });

    if (!token || typeof token !== "string" || token.length < 10) {
      console.warn("aqui el fetch de activacion en futuro...");
      setShowServerError({
        visible: true,
        message: "Token inválido o faltante. Verifica el enlace.",
      });
      setIsLoading(false);
      return;
    }

    console.warn("aqui el fetch de activacion en futuro...");
  };

  return (
    <div className="flex flex-col items-center justify-center px-5 py-4">
      {/* Formulario */}
      <div className="flex justify-center w-full">
        <div className="max-w-sm w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="justify-content-center">
                <Image
                  src="/logo/logovitalfit.png"
                  alt="VitalFit Logo"
                  width={228}
                  height={200}
                  className="w-full rounded-full"
                />
              </div>
              <h2 className={typography.h3}>CONFIRMA TU CONTRASEÑA</h2>
            </CardHeader>
            <CardContent>
              <div className="text-left mb-4">
                <span>Ingrese su nueva contraseña.</span>
              </div>

              <form className="w-full" onSubmit={handleSubmit} noValidate>
                <div className="space-y-3 w-full">
                  <InputField
                    label="Contraseña"
                    type="password"
                    placeholder="Ingrese su contraseña"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    error={errors.password}
                  />
                </div>

                <div className="mt-4 w-full">
                  <Button fullWidth type="submit" disabled={isLoading}>
                    {isLoading ? "Procesando..." : "Confirmar"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Notificaciones */}
      {showAlert && (
        <Notification
          variant="success"
          description="¡Contraseña Confirmada exitosamente!"
          onClose={() => {
            setShowAlert(false);
            router.replace("/login");
          }}
        />
      )}
      {showConnectionError && (
        <Notification
          variant="destructive"
          title="Error de Conexión"
          description="No se pudo conectar con el servidor. Por favor, inténtalo de nuevo más tarde."
          onClose={() => setShowConnectionError(false)}
        />
      )}
      {showServerError.visible && (
        <Notification
          variant="destructive"
          title="Error al Restablecer Contraseña"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}
    </div>
  );
}
