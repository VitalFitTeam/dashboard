"use client";
import { useAuth } from "@/context/AuthContext";
import { ClassCalendar } from "@/components/modules/calendar/ClassCalendar";


export default function ClassesMethodsPage() {
  const { token,  } = useAuth();

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

 return (
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <ClassCalendar />
      </div>
  );
}