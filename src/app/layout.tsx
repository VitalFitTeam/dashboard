import type { Metadata } from "next";
import "../styles/globals.css";
import { AuthProvider } from "@/context/AuthContext";
import ToasterProvider from "@/components/ToasterProvider";

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
    <html lang="es">
      <body>
        <AuthProvider>
          {children}
          <ToasterProvider />
        </AuthProvider>
      </body>
    </html>
  );
}
