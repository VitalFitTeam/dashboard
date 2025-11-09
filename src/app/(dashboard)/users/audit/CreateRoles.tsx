"use client";
import { Roles } from "@/models/roles";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/sdk-config";
import RolesForm from "./RolesForm";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Notification } from "@/components/ui/Notification";

interface CreateRolesProps {
  onBack: () => void;
}

interface CreateRoleData {
  description: string;
  name: string;
  permissionsID: string[];
}

export default function CreateRole({ onBack }: CreateRolesProps) {
  const { token } = useAuth();

  const [formData, setFormData] = useState<Roles>({
    id: "",
    name: "",
    description: "",
  });

  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);

  const handleChange = (field: keyof Roles, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionChange = (permissionId: string, isChecked: boolean) => {
    setSelectedPermissions(prev => {
      if (isChecked) {
        return [...prev, permissionId];
      } else {
        return prev.filter(id => id !== permissionId);
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!formData.name.trim()) {
      setError("El nombre del rol es requerido");
      setIsLoading(false);
      return;
    }

    if (!token) {
      setError("No hay token de autenticación disponible");
      setIsLoading(false);
      return;
    }

    try {
      const createRoleData: CreateRoleData = {
        name: formData.name,
        description: formData.description,
        permissionsID: selectedPermissions
      };

      const roleResponse = await api.RBAC.createRole(createRoleData, token);      

      console.warn("respuesta",roleResponse);

      setShowSuccessNotification(true);
      
      setFormData({
        id: "",
        name: "",
        description: "",
      });
      setSelectedPermissions([]);

      setTimeout(() => {
        onBack();
      }, 2000);

    } catch (error) {
      console.error("Error al crear rol:", error);
      setError(
        error instanceof Error 
          ? error.message 
          : "Error desconocido al crear el rol"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-white rounded shadow">
      <form onSubmit={handleSubmit} className="space-y-6">
        <PageHeader title="CREAR NUEVO ROL"></PageHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <RolesForm 
          formData={formData} 
          onChange={handleChange}
          selectedPermissions={selectedPermissions}
          onPermissionChange={handlePermissionChange}
        />

        <div className="flex gap-4 pt-4">
          <Button 
            type="button"
            className="w-full" 
            variant="secondary" 
            onClick={onBack}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            type="submit"
            className="w-full" 
            variant="primary"
            disabled={isLoading || !formData.name.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creando...
              </>
            ) : (
              "Crear Rol"
            )}
          </Button>
        </div>
      </form>

      {showSuccessNotification && (
        <Notification
          variant="success"
          title="¡Éxito!"
          description="El rol ha sido creado correctamente"
          onClose={() => setShowSuccessNotification(false)}
          autoCloseDuration={2000}
        />
      )}
    </div>
  );
}