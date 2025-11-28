"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";
import { mockMembershipPayments, MembershipPayment } from "../../data";

export default function ManualPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<MembershipPayment | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receiptImage, setReceiptImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    payment_method: "",
    amount: "",
    payment_date: new Date().toISOString().split("T")[0]
  });

  useEffect(() => {
    const foundPayment = mockMembershipPayments.find(p => p.payment_id === params.id);
    if (foundPayment) {
      setPayment(foundPayment);
      setFormData(prev => ({
        ...prev,
        amount: foundPayment.original_amount?.replace("$", "").replace(" USD", "") || ""
      }));
    }
  }, [params.id]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!payment){return;}

    setIsSubmitting(true);

    try {
      console.warn("Registrando pago manual:", { payment, formData });
      router.push("/administrator/membershipManagement");
    } catch (error) {
      console.error("Error registrando pago:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  if (!payment) {
    return (
      <div className="flex-1 space-y-8 p-8 pt-6">
        <div className="text-center p-10">Pago no encontrado</div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader
        title="REGISTRO MANUAL DE PAGO"
        subtitle={`Aplicando pago para la Membresía ${payment.invoice} de ${payment.client}`}
      />

      <div className="bg-white rounded-lg border p-6 space-y-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">INFORMACIÓN DEL CLIENTE</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Nombre Completo</label>
              <Input value={payment.client} disabled />
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium mb-2">Correo electrónico</label>
              <Input value={payment.client_email || ""} disabled />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Membresía Adquirida</label>
            <Select disabled>
              <SelectTrigger>
                <SelectValue placeholder={payment.membership_name || "Select an Item"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={payment.membership_name || ""}>
                  {payment.membership_name}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Método de Pago</label>
            <Select
              value={formData.payment_method}
              onValueChange={(value) => handleChange("payment_method", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona el método" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Efectivo</SelectItem>
                <SelectItem value="card">Tarjeta</SelectItem>
                <SelectItem value="transfer">Transferencia</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Monto a Pagar $</label>
            <Input
              type="number"
              value={formData.amount}
              onChange={(e) => handleChange("amount", e.target.value)}
              placeholder="0.00"
            />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Monto Proporcionado</label>
            <Input value="VES 3550.00" disabled />
          </div>

          <div className="flex flex-col">
            <label className="text-sm font-medium mb-2">Fecha de Pago</label>
            <Input
              type="date"
              value={formData.payment_date}
              onChange={(e) => handleChange("payment_date", e.target.value)}
            />
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm">
            <strong>Nota Importante:</strong><br /> Al registrar el pago manual el estatus de la membresía se actualizará automáticamente.
          </p>
        </div>

        <div>
          <p className="text-lg font-semibold mb-3">Comprobante de Pago</p>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-3">
                Comprobante adjunto por el número de transacción que ha presentado y datos colaboran.
              </p>

              <div className="border-2 border-dashed border-orange-400 rounded-lg p-4 text-center">
                {imagePreview ? (
                  <div className="space-y-2">
                    <img
                      src={imagePreview}
                      alt="Comprobante de pago"
                      className="max-h-64 mx-auto object-contain"
                    />
                    <Button
                      className="w-full"
                      size="sm"
                      onClick={() => {
                        setReceiptImage(null);
                        setImagePreview(null);
                      }}
                    >
                      Cambiar
                    </Button>
                  </div>
                ) : (
                  <div className="py-8 flex flex-col items-center justify-center">
                    <label htmlFor="receipt-upload" className="cursor-pointer flex flex-col items-center">
                      <div className="p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        <DocumentPlusIcon className="h-8 w-8 text-orange-400" />
                      </div>
                      <input
                        id="receipt-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                    <p className="text-sm text-gray-500 mt-2 text-center">
                      Comprobante bancario adjunto por el cliente
                      <br />
                      Verifica que los montos y datos coincidan
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.push("/administrator/membershipManagement")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Confirmando..." : "Confirmar Pago"}
          </Button>
        </div>

      </div>
    </div>
  );
}