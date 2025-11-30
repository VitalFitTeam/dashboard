"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { typography } from "@/styles/styles";
import { Notification } from "@/components/ui/Notification";
import { recoverSchema } from "@/lib/validation/recoverSchema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/sdk-config";

export default function ForgotPassword() {
  const [formData, setFormData] = useState({ usuario: "" });
  const [error, setError] = useState<{ usuario?: string[] }>({});
  const [showAlert, setShowAlert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [showServerError, setShowServerError] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowServerError({ visible: false, message: "" });

    const result = recoverSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};
      const flattened = result.error.flatten();

      if (flattened.fieldErrors.usuario) {
        fieldErrors.usuario = flattened.fieldErrors.usuario;
      }

      setError(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      await api.auth.forgotPassword(formData.usuario);
      localStorage.setItem("email", formData.usuario);
      setShowAlert(true);
      setError({});
      setFormData({ usuario: "" });
    } catch (error) {
      console.error("Error al conectar con la API:", error);
      setShowConnectionError(true);
    }

    setIsLoading(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ usuario: e.target.value });
    if (error.usuario) {
      setError({});
    }
  };

  const handleSuccessClose = () => {
    setShowAlert(false);
    router.replace("/confirmEmail?flow=recover");
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-5 py-4">
      {showAlert && (
        <Notification
          variant="success"
          title="Revisa tu Correo"
          description="Hemos enviado instrucciones para restablecer tu contraseña a tu correo electrónico. "
          onClose={handleSuccessClose}
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
          title="Error del Servidor"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}

      <div className="flex justify-center w-full">
        <div className="max-w-sm w-full">
          <Card className="w-full">
            <CardHeader className="text-center space-y-4">
              <div className="flex justify-center">
                <Image
                  src="/images/isotipo.png" // Ajusta la ruta según tu estructura
                  alt="Logo"
                  width={80}
                  height={80}
                  className="object-contain"
                />
              </div>
              <h2 className={typography.h3}>RECUPERAR CONTRASEÑA</h2>
              <div className="text-center">
                <span className="text-sm text-muted-foreground">
                  Ingresa el correo electrónico asociado a la cuenta para recuperar tu contraseña
                </span>
              </div>
            </CardHeader>

            <CardContent>
              <form className="w-full space-y-4" onSubmit={handleSubmit} noValidate>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <label
                      htmlFor="usuario"
                      className="text-sm font-medium leading-none"
                    >
                      Correo Electrónico
                    </label>
                    <Input
                      id="usuario"
                      name="usuario"
                      type="email"
                      placeholder="Ingresa tu correo electrónico"
                      value={formData.usuario}
                      onChange={handleInputChange}
                      className="bg-background"
                      disabled={isLoading}
                    />
                    {error.usuario?.map((msg, i) => (
                      <p key={i} className="text-destructive text-sm mt-1">
                        {msg}
                      </p>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Procesando..." : "Enviar Código"}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="flex justify-center">
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  ¿Recuerdas tu contraseña?{" "}
                </span>
                <Button
                  variant="link"
                  className="p-0 h-auto font-medium"
                  onClick={() => router.replace("/login")}
                >
                  Iniciar Sesión
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}