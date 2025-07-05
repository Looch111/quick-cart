"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Wallet,
  ArrowRightLeft,
  History,
  Settings,
  Bell,
} from "lucide-react";
import { AppLogo } from "@/components/icons/logo";

function DashboardHeader({ pageTitle }: { pageTitle: string }) {
  const { isMobile } = useSidebar();
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center gap-4">
        {isMobile && <SidebarTrigger />}
        <h1 className="font-headline text-xl font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
        <UserNav />
      </div>
    </header>
  );
}

function UserNav() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border">
            <AvatarImage src="https://placehold.co/100x100" alt="@username" data-ai-hint="profile picture" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">John Doe</p>
            <p className="text-xs leading-none text-muted-foreground">
              john.doe@example.com
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Profile</DropdownMenuItem>
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuSeparator />
        <Link href="/login">
            <DropdownMenuItem className="cursor-pointer">
                Log out
            </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default function DashboardLayout({ children, pageTitle }: { children: React.ReactNode, pageTitle: string }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex h-16 items-center px-4">
            <AppLogo className="h-8 w-8" />
            <span className="ml-3 font-headline text-xl font-bold group-data-[collapsible=icon]:hidden">
              Baltom Exchange
            </span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <Link href="/" asChild>
                <SidebarMenuButton isActive={pathname === '/'}>
                  <Wallet />
                  Wallet
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/swap" asChild>
                <SidebarMenuButton isActive={pathname === '/swap'}>
                  <ArrowRightLeft />
                  Trade
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <Link href="/history" asChild>
                <SidebarMenuButton isActive={pathname === '/history'}>
                  <History />
                  History
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings />
                Settings
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <DashboardHeader pageTitle={pageTitle} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
