"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ChevronRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function AdminLogin() {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetSending, setIsResetSending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    if (!email || !password) {
      toast.error("Barcha maydonlarni to'ldiring");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast.error(error.message === "Email not confirmed" ? "Email tasdiqlanmagan!" : "Email yoki parol xato: " + error.message);
      setLoading(false);
    } else {
      toast.success("Tizimga muvaffaqiyatli kirdingiz!");
      router.push("/admin/dashboard");
      router.refresh(); // Refresh to update middleware state
    }
  };

  const handleForgotPasswordClick = () => {
    setResetEmail(email);
    setIsResetOpen((current) => !current);
  };

  const handlePasswordReset = async (event: React.FormEvent) => {
    event.preventDefault();

    const targetEmail = resetEmail.trim();
    if (!targetEmail) {
      toast.error("Email manzilni kiriting");
      return;
    }

    setIsResetSending(true);
    const { error } = await supabase.auth.resetPasswordForEmail(targetEmail, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    setIsResetSending(false);

    if (error) {
      toast.error("Reset havolasini yuborib bo'lmadi: " + error.message);
      return;
    }

    toast.success("Parolni tiklash havolasi emailingizga yuborildi");
    setIsResetOpen(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-blue-50 p-4">
      {/* Premium subtle background shapes */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/20 blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl p-8 rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] border border-white/50 relative z-10"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Boshqaruvi</h1>
          <p className="text-slate-500 text-sm mt-1">TezkorUsta platformasi boshqaruv paneli</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Email manzil</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="email" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                placeholder="admin@tezkorusta.uz"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">Parol</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input 
                type="password" 
                className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-1">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="w-5 h-5 rounded border border-slate-300 flex items-center justify-center bg-white group-hover:border-blue-500 transition-colors">
                <input type="checkbox" className="hidden" defaultChecked />
                <div className="w-3 h-3 bg-blue-500 rounded-sm" />
              </div>
              <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">Eslab qolish</span>
            </label>
            <button
              type="button"
              onClick={handleForgotPasswordClick}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Parolni unutdingizmi?
            </button>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="group mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)] hover:shadow-[0_10px_30px_-5px_rgba(37,99,235,0.6)]"
          >
            {loading ? "Tizimga kirilmoqda..." : "Kirish"}
            {!loading && <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        {isResetOpen && (
          <form onSubmit={handlePasswordReset} className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/60 p-4">
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
              Parolni tiklash emaili
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                className="w-full pl-11 pr-4 py-3.5 bg-white border border-blue-100 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                placeholder="admin@tezkorusta.uz"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={isResetSending}
              className="mt-3 w-full bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-bold py-3 rounded-xl transition-colors"
            >
              {isResetSending ? "Yuborilmoqda..." : "Reset havolasini yuborish"}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
