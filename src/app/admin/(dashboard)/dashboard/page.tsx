"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Eye, ShieldCheck, ArrowUpRight, PlusCircle, Settings, List, Handshake, Star, Activity, ClipboardList } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { fetchAdminAnalyticsStats, fetchAdminDashboardStats } from "@/lib/supabase/api";

export default function DashboardPage() {
  const [statsData, setStatsData] = useState({
    totalListings: 0,
    vipListings: 0,
    totalViews: 0,
    activeListings: 0,
    latestUpdateLabel: "Yuklanmoqda...",
  });
  const [analytics, setAnalytics] = useState({
    todayUsers: 0,
    weeklyActiveUsers: 0,
    totalJobRequests: 0,
    todayJobRequests: 0,
    conversion: {
      new: 0,
      contacted: 0,
      done: 0,
    },
    mostViewedListings: [] as Array<{ name: string; slug: string; views: number }>,
  });

  useEffect(() => {
    fetchAdminDashboardStats().then(setStatsData);
    fetchAdminAnalyticsStats().then(setAnalytics);
  }, []);

  const stats = [
    { name: "Jami e'lonlar", value: String(statsData.totalListings), change: "Live", icon: FileText, color: "bg-blue-500" },
    { name: "VIP e'lonlar", value: String(statsData.vipListings), change: "Live", icon: ShieldCheck, color: "bg-amber-500" },
    { name: "Bugungi ko'rishlar", value: statsData.totalViews.toLocaleString("uz-UZ"), change: "Live", icon: Eye, color: "bg-emerald-500" },
    { name: "Aktiv ustalar", value: String(statsData.activeListings), change: "Live", icon: Users, color: "bg-indigo-500" },
  ];

  const quickActions = [
    { name: "Yangi e'lon", icon: PlusCircle, href: "/admin/add", color: "text-blue-600 bg-blue-50" },
    { name: "VIP boshqaruv", icon: ShieldCheck, href: "/admin/vip", color: "text-amber-600 bg-amber-50" },
    { name: "Barcha e'lonlar", icon: List, href: "/admin/listings", color: "text-emerald-600 bg-emerald-50" },
    { name: "CRM", icon: Handshake, href: "/admin/crm", color: "text-indigo-600 bg-indigo-50" },
    { name: "Sharhlar", icon: Star, href: "/admin/reviews", color: "text-rose-600 bg-rose-50" },
    { name: "Sozlamalar", icon: Settings, href: "/admin/settings", color: "text-slate-600 bg-slate-100" },
  ];

  const analyticsCards = [
    { name: "Bugungi userlar", value: String(analytics.todayUsers), icon: Users, color: "bg-cyan-500" },
    { name: "Haftalik aktiv", value: String(analytics.weeklyActiveUsers), icon: Activity, color: "bg-violet-500" },
    { name: "Jami so'rovlar", value: String(analytics.totalJobRequests), icon: ClipboardList, color: "bg-blue-500" },
    { name: "Bugungi so'rovlar", value: String(analytics.todayJobRequests), icon: Handshake, color: "bg-emerald-500" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard</h1>
        <div className="text-sm font-medium text-slate-500">
          Oxirgi yangilanish: {statsData.latestUpdateLabel}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {analyticsCards.map((stat, i) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-md ${stat.color} mb-4`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-slate-500 mb-1">{stat.name}</p>
            <h3 className="text-2xl font-bold text-slate-800">{stat.value}</h3>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Job conversion</h2>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-bold text-blue-600 uppercase">New</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{analytics.conversion.new}</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-4">
              <p className="text-xs font-bold text-amber-600 uppercase">Contacted</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{analytics.conversion.contacted}</p>
            </div>
            <div className="rounded-xl bg-emerald-50 p-4">
              <p className="text-xs font-bold text-emerald-600 uppercase">Done</p>
              <p className="text-2xl font-black text-slate-800 mt-1">{analytics.conversion.done}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="text-lg font-bold text-slate-800 mb-5">Eng ko'p ko'rilgan ustalar</h2>
          {analytics.mostViewedListings.length > 0 ? (
            <div className="flex flex-col gap-3">
              {analytics.mostViewedListings.map((listing) => (
                <Link
                  key={`${listing.slug}-${listing.name}`}
                  href={listing.slug ? `/listings/${listing.slug}` : "/admin/listings"}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 hover:bg-slate-50"
                >
                  <span className="text-sm font-bold text-slate-700">{listing.name}</span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-black text-blue-600">
                    {listing.views}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm font-medium text-slate-500">Hali listing view eventlari yo'q</p>
          )}
        </div>
      </div>
    </div>
  );
}
