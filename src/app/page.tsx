import Button from "@/components/button";
import Input from "@/components/input";
import { Sidebar } from "@/components/sidebar";

export default function Home() {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-8">
        <h1 className="text-3xl font-bold">Bienvenido al Dashboard</h1>
        <p className="mt-4 text-muted-foreground">prueba sidebar</p>
        
      </main>
    </div>
  );
}
