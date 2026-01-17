"use client";

import { useIdleTimer } from "@/hooks/auth/useIdleTimer";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";
import { ShieldAlert } from "lucide-react";

export function IdleLogoutManager() {

  const IDLE_TIMEOUT = 15 * 60 * 1000; 
  const WARNING_THRESHOLD = 60 * 1000;

  const { showWarning, setShowWarning } = useIdleTimer({
    idleTime: IDLE_TIMEOUT, 
    warningTime: WARNING_THRESHOLD 
  });

  return (
    <AlertDialog open={showWarning}>
      <AlertDialogContent className="max-w-md border-2 border-orange-100 shadow-2xl animate-in fade-in zoom-in duration-300">
        <AlertDialogHeader className="flex flex-col items-center text-center">
          <div className="h-14 w-14 rounded-full bg-orange-50 flex items-center justify-center mb-4 ring-8 ring-orange-50/50">
            <ShieldAlert className="h-7 w-7 text-orange-600 animate-pulse" />
          </div>
          
          <AlertDialogTitle className="text-2xl font-black text-gray-900 tracking-tight">
            ¿Sigues ahí?
          </AlertDialogTitle>
          
          <AlertDialogDescription className="text-base text-muted-foreground leading-relaxed">
            Tu sesión en **VitalFit** está a punto de expirar debido a la inactividad. 
            Por seguridad, cerraremos tu cuenta automáticamente si no detectamos actividad pronto.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter className="sm:justify-center mt-6">
          <AlertDialogAction 
            onClick={() => setShowWarning(false)}
            className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-10 py-6 rounded-xl shadow-lg shadow-orange-200 transition-all active:scale-95"
          >
            Mantener mi sesión activa
          </AlertDialogAction>
        </AlertDialogFooter>
        
        <p className="text-[10px] text-center text-muted-foreground/60 mt-4 uppercase tracking-widest font-medium">
          Protocolo de Seguridad HU-ADMIN-09
        </p>
      </AlertDialogContent>
    </AlertDialog>
  );
}