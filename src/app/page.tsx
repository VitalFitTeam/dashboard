"use client";

import Button from "@/components/Button";
import PaymentTable from "@/components/tables/PaymentTable";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8">
      <h1 className="text-6xl font-bold text-center">VITALFIT</h1>
      <Button onClick={handleClick} width="small" variant="primary">
        Ir a Login
      </Button>
      <PaymentTable />
    </div>
  );
}
