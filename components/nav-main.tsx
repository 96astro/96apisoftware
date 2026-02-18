"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { useSidebarCollapsed } from "@/hooks/useSidebarCollapsed";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ChevronRight, Pencil, Power, Share2, type LucideIcon } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

interface SidebarItem {
  title?: string;
  url?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  details?: string[];
  profileCard?: {
    plan: string;
    phone: string;
    editUrl?: string;
  };
  items?: {
    title: string;
    url: string;
    circleColor?: string;
  }[];
  label?: string;
};

export function NavMain({ items }: { items: SidebarItem[] }) {
  const pathname = usePathname();
  const isCollapsed = useSidebarCollapsed();
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const activeGroupTitle = useMemo(() => {
    const activeGroup = items.find(
      (item) =>
        item.title &&
        item.items?.some(
          (subItem) =>
            pathname === subItem.url || pathname.startsWith(subItem.url)
        )
    );
    return activeGroup?.title ?? null;
  }, [items, pathname]);

  useEffect(() => {
    if (!openGroup && activeGroupTitle) {
      setOpenGroup(activeGroupTitle);
    }
  }, [activeGroupTitle, openGroup]);

  const handleToggleGroup = (title?: string) => {
    if (!title) return;
    setOpenGroup((prev) => (prev === title ? null : title));
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/auth/login" });
  };

  return (
    <SidebarGroup className={`${isCollapsed ? "px-1.5" : ""}`}>
      <SidebarMenu>
        {items.map((item) => {
          const isGroupActive = item.items?.some(
            (subItem) =>
              pathname === subItem.url || pathname.startsWith(subItem.url)
          );

          if ((item.items && item.items.length > 0) || (item.details && item.details.length > 0) || item.profileCard) {
            const isOpen = openGroup === item.title;

            return (
              <Collapsible
                key={item.title}
                asChild
                open={isOpen}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      onClick={() => handleToggleGroup(item.title)}
                      className={cn(
                        "cursor-pointer py-5.5 px-3 text-base text-[#4b5563] dark:text-white data-[state=open]:bg-primary data-[state=open]:text-white hover:data-[state=open]:bg-primary dark:hover:data-[state=open]:bg-primary hover:data-[state=open]:text-white hover:bg-primary/10 active:bg-primary/10 dark:hover:bg-slate-700",
                        isOpen
                          ? "bg-primary text-white hover:bg-primary hover:text-white dark:bg-primary dark:hover:bg-primary"
                          : ""
                      )}
                    >
                      {item.icon && <item.icon className="!w-4.5 !h-4.5" />}
                      <span>{item.title}</span>
                      <ChevronRight className="ms-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {item.items && item.items.length > 0 ? (
                      <SidebarMenuSub className="gap-0 mt-2 space-y-1">
                        {item.items.map((subItem) => {
                          const isSubActive =
                            pathname === subItem.url ||
                            pathname.startsWith(subItem.url);
                          return (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton
                                asChild
                                className={cn(
                                  "py-5.5 px-3 text-base text-[#4b5563] dark:text-white hover:bg-primary/10 active:bg-primary/10 dark:hover:bg-slate-700",
                                  isSubActive
                                    ? "bg-primary/10 font-bold dark:bg-slate-600"
                                    : ""
                                )}
                              >
                                <Link
                                  href={subItem.url}
                                  className="flex items-center gap-3.5"
                                >
                                  {subItem.circleColor ? (
                                    <span
                                      className={`w-2 h-2 rounded-[50%] ${subItem.circleColor}`}
                                    ></span>
                                  ) : (
                                    <ChevronRight className="size-4" />
                                  )}
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          );
                        })}
                      </SidebarMenuSub>
                    ) : null}
                    {item.details && item.details.length > 0 ? (
                      <div className="px-3 py-2 space-y-1.5 text-sm text-[#4b5563] dark:text-white">
                        {item.details.map((detail) => (
                          <p key={detail}>{detail}</p>
                        ))}
                      </div>
                    ) : null}
                    {item.profileCard ? (
                      <div className="px-3 py-3">
                        <div className="mb-3 flex justify-center">
                          <Avatar className="size-16">
                            <AvatarFallback className="bg-primary/20 text-primary">
                              {item.profileCard.plan?.slice(0, 1) || "B"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="mb-4 flex items-center justify-between text-sm font-semibold text-[#4b5563] dark:text-white">
                          <span>{item.profileCard.plan}</span>
                          <span>{item.profileCard.phone}</span>
                        </div>
                        <div className="flex items-center justify-center gap-6 text-[#4b5563] dark:text-white">
                          <Link href={item.profileCard.editUrl ?? "/view-profile?tab=editProfile"}>
                            <Pencil className="size-4" />
                          </Link>
                          <Share2 className="size-4" />
                          <button type="button" onClick={handleLogout} className="cursor-pointer">
                            <Power className="size-4" />
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          if (item.label) {
            return (
              <SidebarGroupLabel key={`label-${item.label}`}>
                {item.label}
              </SidebarGroupLabel>
            );
          }

          if (item.url && item.title) {
            const isMenuActive =
              pathname === item.url || pathname.startsWith(item.url);

            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  className={cn(
                    "cursor-pointer py-5.5 px-3 text-base text-[#4b5563] dark:text-white hover:bg-primary/10 active:bg-primary/10 dark:hover:bg-slate-700",
                    isMenuActive
                      ? "bg-primary hover:bg-primary text-white dark:hover:bg-primary hover:text-white"
                      : ""
                  )}
                >
                  <Link href={item.url} className="flex items-center gap-2">
                    {item.icon && <item.icon className="!w-4.5 !h-4.5" />}
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          return null;
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
