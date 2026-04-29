"use client";

import { Bell, Search, Menu, UserCircle } from "lucide-react";

export default function AdminHeader({ onMenuClick }: { onMenuClick?: () => void }) {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <button onClick={onMenuClick} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 px-3 py-2 bg-slate-100 rounded-lg border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200 transition-all w-64">
          <Search className="w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Qidirish..." 
            className="bg-transparent border-none outline-none text-sm w-full font-medium"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-2 pl-4 border-l border-slate-200 cursor-pointer">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-800 leading-tight">Admin</p>
            <p className="text-xs font-medium text-slate-500">Boshqaruvchi</p>
          </div>
          <UserCircle className="w-8 h-8 text-slate-400" />
        </div>
      </div>
    </header>
  );
}
