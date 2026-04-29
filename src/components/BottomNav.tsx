"use client";

import { Home, Search, Heart, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Asosiy", href: "/" },
  { icon: Search, label: "Qidirish", href: "/search" },
  { icon: Heart, label: "Saqlangan", href: "/saved" },
  { icon: User, label: "Profil", href: "/profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 w-full max-w-[430px] mx-auto left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-slate-100 dark:border-slate-800 pb-safe pt-2 px-6 z-50 transition-colors duration-200">
      <div className="flex justify-between items-center mb-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 p-2 interactive"
            >
              <div
                className={cn(
                  "p-1.5 rounded-2xl transition-all duration-300",
                  isActive ? "bg-blue-50 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400" : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                )}
              >
                <Icon
                  className={cn("w-6 h-6", isActive && "fill-blue-100 dark:fill-blue-500/20")}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"
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
