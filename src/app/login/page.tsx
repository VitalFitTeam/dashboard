"use client";

import React from "react";
import LoginForm from "../../components/auth/loginForm";

export default function LoginPage() {
  return (
    <main className="h-screen grid place-items-center bg-complementary-black">
      <LoginForm />
    </main>
  );
}
