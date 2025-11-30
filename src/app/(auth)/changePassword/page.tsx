"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { typography } from "@/styles/styles";
import { passwordSchema } from "@/lib/validation/passwordSchema";
import { Notification } from "@/components/ui/Notification";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/sdk-config";

export default function ChangePassword() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const [showServerError, setShowServerError] = useState<{
    visible: boolean;
    message: string;
  }>({ visible: false, message: "" });

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  const handleInputChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setShowServerError({ visible: false, message: "" });

    const result = passwordSchema.safeParse(formData);

    if (!result.success) {
      const fieldErrors: typeof errors = {};

      result.error.issues.forEach((err) => {
        const field = err.path[0] as keyof typeof errors;
        if (field in formData) {
          fieldErrors[field] = err.message;
        }
      });

      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      const tokenCode = localStorage.getItem("code");

      if (!tokenCode) {
        setShowServerError({
          visible: true,
          message:
            "Error en obtener el código de confirmación. Por favor, solicita nuevamente el restablecimiento de contraseña.",
        });
        setIsLoading(false);
        return;
      }

      await api.auth.verifyStaff(
        tokenCode,
        formData.password,
        formData.confirmPassword
      );

      setErrors({});
      setFormData({ password: "", confirmPassword: "" });
      setShowAlert(true);

    } catch (error: any) {
      console.error("Error al cambiar contraseña:", error);

      if (error.name === "NetworkError" || error.message?.includes("network") || error.message?.includes("conectar")) {
        setShowConnectionError(true);
      } else {
        setShowServerError({
          visible: true,
          message: error.message || "Error al cambiar contraseña. Por favor, intenta nuevamente.",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowAlert(false);
    localStorage.removeItem("code");
    localStorage.removeItem("email");
    router.replace("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-5 py-4">
      {showAlert && (
        <Notification
          variant="success"
          description="¡Contraseña restablecida exitosamente!"
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
          title="Error al Restablecer Contraseña"
          description={showServerError.message}
          onClose={() => setShowServerError({ visible: false, message: "" })}
        />
      )}

      <div className="w-full max-w-sm">
        <Card className="w-full">
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <Image
                src="/images/isotipo.png"
                alt="Logo"
                width={80}
                height={80}
                className="object-contain"
              />
            </div>
            <h2 className={typography.h3}>CAMBIA TU CONTRASEÑA</h2>
            <div className="text-left">
              <span className="text-sm text-muted-foreground">
                Ingrese su nueva contraseña.
              </span>
            </div>
          </CardHeader>

          <CardContent>
            <form className="w-full space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-4">
                {/* Campo Nueva Contraseña */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="text-sm font-medium leading-none"
                  >
                    Nueva Contraseña
                  </label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Nueva contraseña"
                    value={formData.password}
                    onChange={handleInputChange("password")}
                    className="bg-background"
                    disabled={isLoading}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Campo Confirmar Contraseña */}
                <div className="space-y-2">
                  <label
                    htmlFor="confirmPassword"
                    className="text-sm font-medium leading-none"
                  >
                    Confirmar Contraseña
                  </label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirmar contraseña"
                    value={formData.confirmPassword}
                    onChange={handleInputChange("confirmPassword")}
                    className="bg-background"
                    disabled={isLoading}
                  />
                  {errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Procesando..." : "Continuar"}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              <span className="text-muted-foreground">
                ¿Recuerdas tu Contraseña?{" "}
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
  );
}