"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  CreditCard,
  EllipsisVertical,
  LogOut,
  MessageCircle,
  UserIcon,
} from "lucide-react";
import { useAuth, User } from "@/context/AuthContext";
import Image from "next/image";
import Link from "next/link";

interface NavUserProps {
  user: User;
}

export function NavUser({ user }: NavUserProps) {
  const { isMobile } = useSidebar();
  const { logout } = useAuth();

  const handleLogout = () => logout();

  // ✅ Nombre completo y letra inicial
  const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
  const initial = user.first_name?.[0]?.toUpperCase() ?? "U";

  // ✅ Si el backend provee imagen, úsala; si no, genera una dinámica de DiceBear
  const imageSrc = user.profile_picture_url
    ? "/logo/isotipo.png"
    : `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(fullName || initial)}`;

  const UserAvatar = () => (
    <>
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={`${fullName}'s avatar`}
          width={40}
          height={40}
          className="rounded-full object-cover"
          unoptimized
        />
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-700">
          {initial}
        </div>
      )}
    </>
  );

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <UserAvatar />
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-medium">{fullName}</span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
                </span>
              </div>
              <EllipsisVertical className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <UserAvatar />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{fullName}</span>
                  <span className="text-muted-foreground truncate text-xs">
                    {user.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/profile">
                  <UserIcon className="mr-2" />
                  Account
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <CreditCard className="mr-2" />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem disabled>
                <MessageCircle className="mr-2" />
                Notifications
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
