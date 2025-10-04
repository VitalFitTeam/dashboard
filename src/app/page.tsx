import Button from "@/components/button";
import Input from "@/components/input";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <h1>Hola</h1>
      <Input
        label="Contraseña"
        type="password"
        placeholder="Ingresa tu contraseña"
        helperText="Debe tener al menos 8 caracteres"
      />
      <Button />
    </div>
  );
}
