"use client";

import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import SearchBar from "@/components/SearchBar";
import ListingCard from "@/components/ListingCard";
import { mockListings } from "@/data/mockListings";
import { ShieldCheck, Clock, Award, ChevronRight, Wrench, Zap, Star, CheckCircle2, Send } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Listing } from "@/data/mockListings";
import { fetchListings } from "@/lib/supabase/api";
import { useLanguage } from "@/contexts/LanguageContext";

const servicesList = [
  { id: "Santexnik", icon: Wrench, labelUz: "Santexnik", labelRu: "Сантехник", color: "text-blue-500 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10" },
  { id: "Elektrik", icon: Zap, labelUz: "Elektrik", labelRu: "Электрик", color: "text-amber-500 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10" },
];

const testimonials = [
  { id: 1, name: "Alisher T.", textUz: "Juda tez yetib kelishdi va muammoni hal qilishdi. Tavsiya qilaman!", textRu: "Приехали очень быстро и решили проблему. Рекомендую!" },
  { id: 2, name: "Madina K.", textUz: "Ustaning muomalasi va ishi a'lo darajada. Narxlari ham arzon.", textRu: "Мастер очень вежливый, работа на высшем уровне. Цены приемлемые." },
  { id: 3, name: "Sardor B.", textUz: "TezkorUsta orqali ishonchli elektrik topdim. Rahmat!", textRu: "Через TezkorUsta нашел надежного электрика. Спасибо!" },
];

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const { t, language } = useLanguage();

  useEffect(() => {
    fetchListings().then(data => {
      setListings(data);
      setLoading(false);
    });
  }, []);

  const vipListings = listings.filter(l => l.isVip);
  const recentListings = listings.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-24 font-inter transition-colors duration-200">
      <Header />

      <main className="flex-1 flex flex-col">
        {/* Premium Hero Section */}
        <section className="relative px-5 pt-8 pb-12 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white overflow-hidden rounded-b-[2.5rem] shadow-sm">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 opacity-20 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4"></div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.15] mb-3 drop-shadow-sm">
              {t("heroTitle1")} <br/>
              <span className="text-yellow-300">{t("heroTitle2")}</span> <br/>
              {t("heroTitle3")}
            </h1>
            <p className="text-blue-100 text-[15px] font-medium mb-8 max-w-[280px] leading-relaxed">
              {t("heroSubtitle")}
            </p>
          </motion.div>

          {/* Search Bar overlaps the hero bottom */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="absolute -bottom-6 left-5 right-5 z-20"
          >
            <SearchBar />
          </motion.div>
        </section>

        {/* Spacer for overlapping search bar */}
        <div className="h-10"></div>

        {/* Categories / Services Grid */}
        <section className="px-5 py-6 mt-2">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("services")}</h2>
            <Link href="/search" className="text-sm text-blue-600 font-bold flex items-center">
              {t("seeAll")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {servicesList.map((service, i) => {
              const Icon = service.icon;
              return (
                <Link href={`/search?category=${service.id}`} key={service.id}>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center gap-2 group interactive"
                  >
                    <div className={`w-16 h-16 rounded-2xl ${service.bg} ${service.color} flex items-center justify-center border border-slate-100 dark:border-slate-800 shadow-sm dark:shadow-none group-hover:scale-105 transition-transform`}>
                      <Icon className="w-7 h-7" strokeWidth={1.5} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center leading-tight">
                      {language === "uz" ? service.labelUz : service.labelRu}
                    </span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Trust & Safety Banner */}
        <section className="px-5 py-2">
          <div className="bg-slate-900 rounded-3xl p-5 text-white shadow-lg relative overflow-hidden">
            {/* Pattern */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <h3 className="font-bold text-lg">{t("trustReliable")}</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-2xl font-black text-white">10k+</div>
                  <div className="text-xs text-slate-400 font-medium">Mijozlar</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-yellow-400">99%</div>
                  <div className="text-xs text-slate-400 font-medium">Ijobiy sharhlar</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* VIP Ustalar */}
        <section className="mt-6 py-6 border-y border-slate-100 dark:border-slate-800/50 bg-white dark:bg-slate-900 transition-colors duration-200">
          <div className="px-5 mb-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500 fill-amber-500/20" />
              {t("vipMasters")}
            </h2>
            <Link href="/search?vip=true" className="text-sm text-blue-600 font-bold flex items-center">
              {t("seeAll")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex overflow-x-auto no-scrollbar px-5 gap-4 pb-4 snap-x">
            {vipListings.map((listing, i) => (
              <motion.div 
                key={listing.id} 
                className="w-[280px] shrink-0 snap-center"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <ListingCard listing={listing} featured />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Testimonials */}
        <section className="mt-8 overflow-hidden">
          <h2 className="px-5 text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">{t("testimonials")}</h2>
          <div className="flex overflow-x-auto no-scrollbar px-5 gap-4 pb-6 snap-x">
            {testimonials.map((testi, i) => (
              <motion.div 
                key={testi.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-[260px] shrink-0 snap-center bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col gap-3 transition-colors duration-200"
              >
                <div className="flex gap-1">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />)}
                </div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-relaxed italic">
                  "{language === "uz" ? testi.textUz : testi.textRu}"
                </p>
                <div className="mt-auto flex items-center gap-2 pt-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 text-xs">
                    {testi.name.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{testi.name}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 ml-auto" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Recent Listings */}
        <section className="mt-2 px-5 pb-8">
          <div className="mb-5 flex justify-between items-center">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">{t("recentListings")}</h2>
            <Link href="/listings" className="text-sm text-blue-600 font-bold flex items-center">
              {t("seeAll")} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-col gap-4">
             {recentListings.map((listing, i) => (
                <motion.div
                  key={listing.id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                >
                   <ListingCard listing={listing} />
                </motion.div>
             ))}
          </div>
        </section>



        {/* Contact Admin CTA */}
        <section className="px-5 pb-10">
          <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden interactive">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white opacity-5 rounded-full blur-xl"></div>
            <h3 className="text-xl font-bold mb-2 relative z-10">{t("becomeMasterTitle")}</h3>
            <p className="text-slate-300 text-sm font-medium mb-6 relative z-10 max-w-[220px]">
              {t("becomeMasterSub")}
            </p>
            <a href="https://t.me/nuraliyev1s" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-blue-500 text-white font-bold py-3 px-6 rounded-xl shadow-[0_8px_20px_-6px_rgba(59,130,246,0.5)] hover:scale-105 transition-transform relative z-10">
              <Send className="w-4 h-4" />
              {t("contactAdmin")}
            </a>
          </div>
        </section>

      </main>

      <BottomNav />
    </div>
  );
}
