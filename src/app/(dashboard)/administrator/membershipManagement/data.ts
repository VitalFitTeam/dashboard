export interface MembershipPayment {
  payment_id: string;
  invoice: string;
  client: string;
  payment_date: string;
  amount_paid: string;
  currency_paid: string;
  payment_method: "paypal" | "cash" | "card" | "transfer";
  status: "completed" | "failed" | "refunded" | "pending";
  client_email?: string;
  membership_name?: string;
  original_amount?: string;
}

export const mockMembershipPayments: MembershipPayment[] = [
  {
    payment_id: "1",
    invoice: "INV-001",
    client: "María González Pérez",
    payment_date: "2024-01-15",
    amount_paid: "$150.00 USD",
    currency_paid: "$150.00 USD",
    payment_method: "paypal",
    status: "completed",
    client_email: "maria.gonzalez@email.com",
    membership_name: "Premium Anual",
    original_amount: "$150.00"
  },
  {
    payment_id: "2",
    invoice: "INV-002",
    client: "Carlos López",
    payment_date: "2024-01-14",
    amount_paid: "$100.00 USD",
    currency_paid: "$100.00 USD",
    payment_method: "cash",
    status: "failed",
    client_email: "carlos.lopez@email.com",
    membership_name: "Básico Mensual",
    original_amount: "$100.00"
  },
  {
    payment_id: "3",
    invoice: "INV-003",
    client: "Ana Martínez",
    payment_date: "2024-01-13",
    amount_paid: "$200.00 USD",
    currency_paid: "$200.00 USD",
    payment_method: "card",
    status: "refunded",
    client_email: "ana.martinez@email.com",
    membership_name: "VIP Trimestral",
    original_amount: "$200.00"
  },
  {
    payment_id: "4",
    invoice: "INV-004",
    client: "Juan Pérez",
    payment_date: "2024-01-12",
    amount_paid: "$75.00 USD",
    currency_paid: "$75.00 USD",
    payment_method: "transfer",
    status: "pending",
    client_email: "juan.perez@email.com",
    membership_name: "Básico Mensual",
    original_amount: "$75.00"
  }
];