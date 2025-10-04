import type { Metadata } from "next";
import "../styles/globals.css";
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
      <body
        className='antialiased bg-gray-50 text-gray-900 border-none '
      >
        {children}
      </body>
    </html>
  );
}
