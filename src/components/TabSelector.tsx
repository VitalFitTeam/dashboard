"use client";
import React, { useState } from "react";
import { AccountForm } from "./AccountForm";
import { PasswordForm } from "./PasswordForm";

type TabKey = "account" | "password";

interface TabProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

interface UserType {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  identity_document?: string;
  birth_date?: string;
}

interface TabSelectorProps {
  user: UserType;
}

const Tab: React.FC<TabProps> = ({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`flex-1 py-3 px-6 text-center font-semibold text-base transition-colors duration-200 ease-in-out
      ${isActive ? "bg-white text-gray-800" : "bg-transparent text-gray-500 hover:text-gray-700"}`}
  >
    {label}
  </button>
);

const TabSelector: React.FC<TabSelectorProps> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<TabKey>("account");

  const renderTabContent = () => {
    switch (activeTab) {
      case "account":
        return <AccountForm user={user} />;
      case "password":
        return <PasswordForm />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto border border-gray-200 rounded-xl bg-gray-50 overflow-hidden shadow-sm">
      <div className="flex">
        <Tab
          label="Account"
          isActive={activeTab === "account"}
          onClick={() => setActiveTab("account")}
        />
        <Tab
          label="Password"
          isActive={activeTab === "password"}
          onClick={() => setActiveTab("password")}
        />
      </div>
      <div className="bg-white">{renderTabContent()}</div>
    </div>
  );
};

export default TabSelector;
