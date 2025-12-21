"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { CancellationReason, CreateCancellationReason } from "@vitalfit/sdk";
import { Loader2 } from "lucide-react";
import CancellationForm from "./cancellationForm";

interface CancellationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  cancellation: CancellationReason | CreateCancellationReason;
  onChange: (field: any, value: any) => void;
  mode: "create" | "edit" | "view";
  isLoading?: boolean;
  errors?: any;
}

export function CancellationModal({
  isOpen,
  onClose,
  onSave,
  cancellation,
  onChange,
  mode,
  isLoading,
  errors,
}: CancellationModalProps) {

  const t = useTranslations("catalog.cancellationReason");

  const getTitle = () => {
    if (mode === "create"){
         return t("addButton");
    }
    if (mode === "edit"){
         return t("CausesTable.actions.edit");
    }
    return t("CausesTable.actions.view");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold border-b pb-4 uppercase">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2">
          <CancellationForm
            cancellation={cancellation}
            onChange={onChange}
            mode={mode}
            errors={errors}
          />
        </div>

        <DialogFooter className="gap-2 sm:gap-0 pt-4">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isLoading}
          >
            {t("CausesTable.deleteModal.cancel")}
          </Button>

          {mode !== "view" && (
            <Button 
              onClick={onSave} 
              disabled={isLoading}
              className="min-w-[120px] bg-[#FF6600] hover:bg-[#E65C00] text-white" 
            >
              {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              
              {mode === "create" 
                ? t("CausesTable.actions.save") 
                : t("CausesTable.actions.edit")       
              }
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}