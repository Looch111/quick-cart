"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, ArrowRightLeft, History, Gift } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Wallet", icon: Wallet },
  { href: "/swap", label: "Trade", icon: ArrowRightLeft },
  { href: "/sell", label: "Sell", icon: Gift },
  { href: "/history", label: "History", icon: History },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 border-t border-border bg-background/80 backdrop-blur-sm">
      <div className="grid h-full grid-cols-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex flex-col items-center justify-center gap-1 text-sm font-medium transition-colors group"
            >
              <item.icon
                className={cn(
                  "w-6 h-6",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span
                className={cn(
                    "text-xs",
                    isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
