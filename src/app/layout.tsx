import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ToasterProvider from "@/components/ToasterProvider";

import { Montserrat, Bebas_Neue } from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-heading",
  display: "swap",
});

export const metadata: Metadata = {
  title: "GymApp Dashboard",
  description: "Administra tus reservas, entrenadores y sucursales de gimnasio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${montserrat.variable} ${bebas.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
