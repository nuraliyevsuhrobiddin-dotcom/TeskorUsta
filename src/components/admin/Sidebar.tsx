"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, UserPlus, Star, Settings, LogOut, Wrench, ShieldCheck, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "E'lonlar", href: "/admin/listings", icon: ListChecks },
  { name: "Yangi qo'shish", href: "/admin/add", icon: UserPlus },
  { name: "VIP E'lonlar", href: "/admin/listings?filter=vip", icon: ShieldCheck },
  { name: "Sharhlar", href: "/admin/reviews", icon: Star },
  { name: "Foydalanuvchilar", href: "/admin/users", icon: Users },
  { name: "Sozlamalar", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Tizimdan chiqildi");
    router.push("/admin/login");
    router.refresh();
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0">
      <div className="p-6">
        <Link href="/admin/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
            <Wrench className="w-4 h-4 text-white" />
          </div>
          <span className="font-outfit font-bold text-xl text-slate-800 tracking-tight">Admin<span className="text-blue-600">Panel</span></span>
        </Link>
      </div>

      <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/admin/dashboard" && pathname.startsWith(item.href) && !item.href.includes("?"));
          const Icon = item.icon;
          const isPlaceholder = item.href === "/admin/reviews" || item.href === "/admin/users";

          return (
            <Link
              key={item.name}
              href={isPlaceholder ? "#" : item.href}
              onClick={(e) => {
                if (isPlaceholder) {
                  e.preventDefault();
                  toast.success("Ushbu bo'lim tez kunda qo'shiladi", { icon: "🚧" });
                }
              }}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all group",
                isActive 
                  ? "bg-blue-50 text-blue-700" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 mt-auto">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Tizimdan chiqish
        </button>
      </div>
    </aside>
  );
}
