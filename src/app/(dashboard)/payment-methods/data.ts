import { PaymentMethod } from "@/models/paymentMethod";

export const PaymentMethodData: PaymentMethod[] = [
  {
    id: "001",
    name: "Visa Platinum",
    type: "Tarjeta de Credito",
    description: "Personal (**** 4567, Exp. 12/26",
  },
  {
    id: "002",
    name: "Paypal",
    type: "Billetera Digital",
    description: "Cuenta principal (usu...o@email.com)",
  },
  {
    id: "003",
    name: "Mancuernas Hexagonales 10kg",
    type: "Efectivo",
    description: "Par de mancuernas recubiertas en goma",
  },
  {
    id: "004",
    name: "Pago Movil",
    type: "Transferencia",
    description: "Banco de Venezuela (CI ...678)",
  },
  {
    id: "005",
    name: "Efectivo",
    type: "Efectivo",
    description: "Solo para pagos en taquilla física",
  },
];
