"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  BadgeCheck,
  CreditCard,
  LogOut,
  ChevronsUpDown,
  Settings2,
} from "lucide-react";

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
import { useAuth, SessionUser } from "@/context/AuthContext";
import LocaleSwitcher from "./localeSwitcher/LocaleSwitcher";
import { Link } from "@/i18n/navigation";

interface NavUserProps {
  user: SessionUser;
}

export function NavUser({ user }: NavUserProps) {
  const t = useTranslations("UserNav");
  const { isMobile } = useSidebar();
  const { logout } = useAuth();

  const fullName =
    `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "User";
  const avatarUrl =
    user.profile_picture_url ||
    `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(fullName)}`;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-sidebar-accent/50 transition-all duration-200"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border bg-background overflow-hidden">
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  width={32}
                  height={32}
                  className="aspect-square object-cover"
                  unoptimized
                />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight ml-2">
                <span className="truncate font-semibold tracking-tight">
                  {fullName}
                </span>
                <span className="truncate text-[11px] text-muted-foreground uppercase font-medium">
                  {user.email.split("@")[0]}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4 opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-[240px] rounded-xl p-2 shadow-xl"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={8}
          >
            <DropdownMenuLabel className="font-normal">
              <div className="flex items-center gap-3 px-1 py-2">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border shadow-sm">
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={40}
                    height={40}
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <p className="truncate font-bold text-foreground">
                    {fullName}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuGroup>
              <DropdownMenuItem asChild className="py-2.5 cursor-pointer">
                <Link href="/settings/profile">
                  <BadgeCheck className="mr-2 size-4 text-muted-foreground" />
                  <span className="font-medium">{t("account")}</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuGroup>
              <div className="flex items-center justify-between px-2 py-2">
                <div className="flex items-center text-sm font-medium text-muted-foreground">
                  <Settings2 className="mr-2 size-4" />
                  {t("language")}
                </div>
                <div className="scale-90 origin-right">
                  <LocaleSwitcher />
                </div>
              </div>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={() => logout()}
              className="py-2.5 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-md transition-colors"
            >
              <LogOut className="mr-2 size-4" />
              <span className="font-semibold">{t("logout")}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
