"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { mockMembershipPayments, MembershipPayment } from "../data";
import { Input } from "@/components/ui/Input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DocumentPlusIcon } from "@heroicons/react/24/outline";

export default function PaymentDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [payment, setPayment] = useState<MembershipPayment | null>(null);
    const [receiptImage, setReceiptImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        const foundPayment = mockMembershipPayments.find(p => p.payment_id === params.id);
        if (foundPayment) {
            setPayment(foundPayment);
        }
    }, [params.id]);

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

    const handleCancel = () => {
        router.push("/administrator/membershipManagement");
    };

    const handleDecline = () => {
        console.warn("Rechazar Pago");
    };

    const handleConfirm = () => {
        console.warn("Pago confirmado");
    };

    if (!payment) {
        return (
            <div className="flex-1 space-y-8 p-8 pt-6">
                <div className="text-center p-10">Pago no encontrado</div>
            </div>
        );
    }

    const getStatusLabel = (status: MembershipPayment["status"]) => {
        const labels = {
            completed: "Completado",
            failed: "Fallido",
            refunded: "Reembolsado",
            pending: "Pendiente"
        };
        return labels[status];
    };

    return (
        <div className="flex-1 space-y-8 p-8 pt-6">
            <PageHeader title="DETALLES DEL PAGO"/>

            <div className="bg-white rounded-lg border p-6 space-y-6">
                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-3">Información del Cliente</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Nombre</label>
                            <Input
                                value={payment.client}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Correo electrónico</label>
                            <Input
                                value={payment.client_email || "maria.gonzalez@gmail.com"}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Tipo de membresía</label>
                            <Input
                                value={payment.membership_name || "Premium Mensual"}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Estado</label>
                            <Select disabled value={payment.status}>
                                <SelectTrigger className="bg-gray-50">
                                    <SelectValue>{getStatusLabel(payment.status)}</SelectValue>
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pendiente</SelectItem>
                                    <SelectItem value="completed">Completado</SelectItem>
                                    <SelectItem value="failed">Fallido</SelectItem>
                                    <SelectItem value="refunded">Reembolsado</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-3">DATOS DE FACTURA</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">ID Fiscal</label>
                            <Input
                                value="ES4155"
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Monto a facturar</label>
                            <Input
                                value={`$ ${payment.amount_paid || "300.00"}`}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                <div className="border-b pb-4">
                    <h2 className="text-lg font-semibold mb-3">DETALLES DEL PAGO</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Monto Pagado</label>
                            <Input
                                value={`VES ${payment.amount_paid || "3550.00"}`}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Tasa de Cambio Aplicada</label>
                            <Input
                                value="95.5 VES1/U$D"
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Fecha de Reporte</label>
                            <Input
                                value={payment.payment_date || "5025-11-23 09:46:32"}
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-500">Valor en Moneda Base (USD)</label>
                            <Input
                                value="$100.00"
                                disabled
                                className="bg-gray-50"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <p className="text-lg font-semibold mb-3">Comprobante de Pago</p>
                    <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-3">
                                Comprobante adjunto por el número de transacción que ha presentado y datos colaboran.
                            </p>

                            <div className="border-2 border-dashed border-orange-300 rounded-lg p-4 text-center">
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

                <div className="flex justify-end gap-4 pt-4">
                    <Button variant="outline" onClick={handleCancel}>
                        Cancelar
                    </Button>
                    <Button onClick={handleDecline}>
                        Rechazar
                    </Button>
                    <Button className="bg-green-500" onClick={handleConfirm}>
                        Confirmar
                    </Button>
                </div>
            </div>
        </div>
    );
}