import Button from "@/components/button";
import Input from "@/components/input";
import TabSelector from "@/components/TabSelector";
import UserCard from "@/components/userCard";

export default function ProfilePage() {
  return (
    <section className="flex flex-col items-center justify-start  bg-white rounded-xl shadow-sm p-6 mt-8">
      <UserCard name="Albani Barragan" role="Super Administrador" />
      <TabSelector />
    </section>
  );
}
