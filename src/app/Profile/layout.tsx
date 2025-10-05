import LoginFields from "@/components/LoginFields";
import UserCard from "@/components/userCard";

export default function ProfileLayout() {
  return (
    <div className="flex flex-col gap-1 border items-center">
      <UserCard name="Albani Barragan" role="Super Usuario" />
      <LoginFields />
    </div>
  );
}
