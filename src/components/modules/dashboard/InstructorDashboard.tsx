"use client";
import { SessionUser, useAuth } from "@/context/AuthContext";
import { BranchStaff } from "@vitalfit/sdk";
import useInstructorDashboard from "@/hooks/instructor/useInstructorDashboard";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { TodayClassesList } from "./instructor/TodayClassesList";
import { InstructorStats } from "./instructor/InstructorStats";
import { DashboardHeader } from "./instructor/DashboardHeader";


interface InstructorDashboardProps {
    user: SessionUser;
    activeBranch?: BranchStaff;
}

export default function InstructorDashboard({ user, activeBranch }: InstructorDashboardProps) {
    const { token } = useAuth();
    const { 
        classesToday, monthlyCount, nextClass, studentCount, isLoading 
    } = useInstructorDashboard(token);

    if (isLoading) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="space-y-8 p-2">
            <DashboardHeader user={user} activeBranch={activeBranch} />
            
            <InstructorStats 
                nextClass={nextClass}
                studentCount={studentCount}
                monthlyCount={monthlyCount}
            />

            <div className="grid grid-cols-1 gap-6">
                <TodayClassesList
                    classes={classesToday} 
                    branchName={activeBranch?.name} 
                />
            </div>
        </div>
    );
}