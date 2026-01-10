"use client";

import * as React from "react";
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  MapPinIcon, 
  PlusIcon 
} from "@heroicons/react/24/outline";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations, useLocale } from "next-intl";

interface Branch {
  branch_id: string;
  name: string;
}

interface CalendarToolbarProps {
  currentDate: Date;
  currentView: string;
  branches: Branch[];
  selectedBranchId: string;
  onBranchChange: (id: string) => void;
  onNavigate: {
    next: () => void;
    prev: () => void;
    today: () => void;
    changeView: (view: string) => void;
  };
  onCreateClick: () => void; 
  isLoading?: boolean;
}

export function CalendarToolbar({ 
  currentDate, 
  currentView,
  branches,
  selectedBranchId,
  onBranchChange,
  onNavigate,
  onCreateClick,
  isLoading 
}: CalendarToolbarProps) {
  
  // Adjusted namespace to match common patterns (calendar.toolbar)
  const t = useTranslations("calendar.toolbar");
  const locale = useLocale();

  // Dynamic formatting based on current language
  const month = currentDate.toLocaleString(locale, { month: "long" });
  const year = currentDate.getFullYear();

  const currentBranch = React.useMemo(() => {
    return branches.find(b => b.branch_id === selectedBranchId);
  }, [branches, selectedBranchId]);

  return (
    <div className="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-50 select-none">
      
      {/* Left Side: Title and View Switcher */}
      <div className="flex items-center gap-8">
        <div className="flex items-baseline gap-2">
          <h1 className="text-2xl font-bold text-gray-900 capitalize tracking-tight">
            {month}
          </h1>
          <span className="text-xl font-medium text-gray-400">{year}</span>
          {isLoading && (
            <div className="ml-4 animate-spin h-4 w-4 border-2 border-orange-500 border-t-transparent rounded-full" />
          )}
        </div>

        <div className="flex bg-gray-100/80 p-1 rounded-lg border border-gray-200/50">
          <ViewButton 
            active={currentView.includes("timeGrid")} 
            onClick={() => onNavigate.changeView("timeGridWeek")}
            label={t("week")}
          />
          <ViewButton 
            active={currentView.includes("dayGrid")} 
            onClick={() => onNavigate.changeView("dayGridMonth")}
            label={t("month")}
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        
        {/* Branch Selector Logic */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic mr-1">
            {t("branch")}
          </span>
          
          {branches.length === 1 ? (
            <div className="flex items-center gap-2 text-xs font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-100 transition-all">
              <MapPinIcon className="h-3.5 w-3.5 shrink-0" />
              <span>{currentBranch?.name || t("loading")}</span>
            </div>
          ) : (
            <Select 
              value={selectedBranchId || "all"} 
              onValueChange={onBranchChange}
            >
              <SelectTrigger className="w-fit min-w-[140px] border-none bg-slate-50 px-3 py-1.5 rounded-lg shadow-none focus:ring-0 text-xs font-bold text-gray-600 hover:text-orange-500 transition-colors flex gap-2 h-8">
                <MapPinIcon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                <SelectValue placeholder={t("loading")} />
              </SelectTrigger>
              <SelectContent>
                {branches.map((b) => (
                  <SelectItem key={b.branch_id} value={b.branch_id} className="text-xs">
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="h-8 w-[1px] bg-gray-100" />

        <button
          onClick={onCreateClick}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <PlusIcon className="h-4 w-4 stroke-[3px]" />
          {t("createClass")}
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={onNavigate.today} 
            className="px-4 py-1.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-all border border-gray-200 shadow-sm active:scale-95"
          >
            {t("today")}
          </button>
          
          <div className="flex items-center bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden text-gray-500">
            <NavButton onClick={onNavigate.prev} icon={<ChevronLeftIcon className="h-4 w-4 stroke-[2.5px]" />} />
            <NavButton onClick={onNavigate.next} icon={<ChevronRightIcon className="h-4 w-4 stroke-[2.5px]" />} />
          </div>
        </div>
      </div>
    </div>
  );
}

const ViewButton = ({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) => (
  <button
    onClick={onClick}
    className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-all duration-200 ${
      active ? "bg-white text-orange-600 shadow-sm ring-1 ring-black/5" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
    }`}
  >
    {label}
  </button>
);

const NavButton = ({ onClick, icon }: { onClick: () => void, icon: React.ReactNode }) => (
  <button onClick={onClick} className="p-1.5 hover:bg-gray-50 border-r last:border-r-0 border-gray-200 active:bg-gray-100">
    {icon}
  </button>
);