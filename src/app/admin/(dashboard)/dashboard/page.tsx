"use client";

import { Users, FileText, Eye, ShieldCheck, ArrowUpRight, PlusCircle, Settings, List } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardPage() {
  const stats = [
    { name: "Jami e'lonlar", value: "124", change: "+12%", icon: FileText, color: "bg-blue-500" },
    { name: "VIP e'lonlar", value: "45", change: "+5%", icon: ShieldCheck, color: "bg-amber-500" },
    { name: "Bugungi ko'rishlar", value: "2,845", change: "+24%", icon: Eye, color: "bg-emerald-500" },
    { name: "Aktiv ustalar", value: "89", change: "+2%", icon: Users, color: "bg-indigo-500" },
  ];

  const quickActions = [
    { name: "Yangi e'lon", icon: PlusCircle, href: "/admin/add", color: "text-blue-600 bg-blue-50" },
    { name: "VIP boshqaruv", icon: ShieldCheck, href: "/admin/listings?filter=vip", color: "text-amber-600 bg-amber-50" },
    { name: "Barcha e'lonlar", icon: List, href: "/admin/listings", color: "text-emerald-600 bg-emerald-50" },
    { name: "Sozlamalar", icon: Settings, href: "/admin/settings", color: "text-slate-600 bg-slate-100" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <div className="text-sm font-medium text-slate-500">
          Oxirgi yangilanish: Bugun, 10:45
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                {stat.change} <ArrowUpRight className="w-3 h-3 ml-0.5" />
              </span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 mb-1">{stat.name}</p>
              <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Section Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-slate-800">Haftalik ko'rishlar</h2>
            <select className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 outline-none font-medium text-slate-600">
              <option>Shu hafta</option>
              <option>O'tgan hafta</option>
            </select>
          </div>
          
          <div className="h-64 flex items-end justify-between gap-2 px-2">
             {/* Mock CSS Bar Chart */}
             {[40, 70, 45, 90, 65, 85, 100].map((h, i) => (
               <div key={i} className="w-full flex flex-col items-center gap-2 group">
                 <div className="w-full bg-slate-100 rounded-t-md relative h-full flex items-end justify-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t-md transition-all duration-500 group-hover:bg-blue-600"
                      style={{ height: `${h}%` }}
                    ></div>
                 </div>
                 <span className="text-xs font-medium text-slate-400">
                   {['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'][i]}
                 </span>
               </div>
             ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6"
        >
          <h2 className="text-lg font-bold text-slate-800 mb-6">Tezkor harakatlar</h2>
          <div className="grid grid-cols-2 gap-3">
             {quickActions.map(action => (
                <Link key={action.name} href={action.href} className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-md transition-all group">
                   <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6" />
                   </div>
                   <span className="text-sm font-semibold text-slate-700 text-center">{action.name}</span>
                </Link>
             ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
