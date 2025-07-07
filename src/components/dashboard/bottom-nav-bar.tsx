"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wallet, ArrowRightLeft, History, ShoppingCart } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Wallet", icon: Wallet },
  { href: "/swap", label: "Swap", icon: ArrowRightLeft },
  { href: "/buy", label: "Buy", icon: ShoppingCart },
  { href: "/history", label: "History", icon: History },
];

export default function BottomNavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 border-t border-border bg-background/80 backdrop-blur-sm md:hidden">
      <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex flex-col items-center justify-center px-5 group"
            >
              <item.icon
                className={cn(
                  "w-6 h-6 mb-1",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span
                className={cn(
                    "text-sm",
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
