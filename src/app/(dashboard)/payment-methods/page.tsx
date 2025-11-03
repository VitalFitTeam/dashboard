"use client";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@heroicons/react/24/outline";
import type { PaymentMethod } from "@/models/paymentMethod";
import EditPayment from "./EditPayment";
import PaymentTable from "./PaymentTable";
import ViewDetailsPayment from "./ViewDetailsPayment";
import CreatePayment from "./CreatePayment";
import { useState } from "react";

export default function Payment() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(
    null,
  );
  const [viewPayment, setViewPayment] = useState<PaymentMethod | null>(null);

  if (showCreateForm) {
    return <CreatePayment onBack={() => setShowCreateForm(false)} />;
  }

  if (editingPayment) {
    return (
      <EditPayment
        payment={editingPayment}
        onBack={() => setEditingPayment(null)}
      />
    );
  }

  if (viewPayment) {
    return (
      <ViewDetailsPayment
        payment={viewPayment}
        onBack={() => setViewPayment(null)}
      />
    );
  }

  return (
    <div className="flex-1 space-y-8 p-8 pt-6">
      <PageHeader title="METODOS DE PAGO">
        <Button variant="primary" onClick={() => setShowCreateForm(true)}>
          <PlusIcon className="h-5 w-5" />
          Agregar Metodo
        </Button>
      </PageHeader>
      <PaymentTable
        onView={(payment) => setViewPayment(payment)}
        onEdit={(payment) => setEditingPayment(payment)}
      />
    </div>
  );
}
