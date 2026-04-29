"use client";

import { Save, Globe, Phone, Link as LinkIcon, Monitor, Settings as SettingsIcon } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminSettingsPage() {
  const handleSave = () => {
    toast.success("Sozlamalar saqlandi");
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sozlamalar</h1>
        <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all">
          <Save className="w-4 h-4" /> Saqlash
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
           <h3 className="text-lg font-bold text-slate-800 mb-1">Umumiy sozlamalar</h3>
           <p className="text-sm text-slate-500">Sayt nomi, asosiy til va mavzuni boshqarish.</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                <SettingsIcon className="w-4 h-4 text-slate-400" /> Sayt nomi
             </label>
             <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" defaultValue="TezkorUsta" />
           </div>
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" /> Asosiy til
             </label>
             <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium">
               <option value="uz">O'zbekcha</option>
               <option value="ru">Русский</option>
             </select>
           </div>
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                <Monitor className="w-4 h-4 text-slate-400" /> Mavzu (Theme)
             </label>
             <select className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium">
               <option value="light">Yorqin (Light)</option>
               <option value="dark">Qorong'i (Dark)</option>
               <option value="system">Tizim (System)</option>
             </select>
           </div>
        </div>
      </div>

      <hr className="border-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
           <h3 className="text-lg font-bold text-slate-800 mb-1">Aloqa</h3>
           <p className="text-sm text-slate-500">Qo'llab-quvvatlash uchun telefon raqami va telegram linki.</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" /> Telefon raqam
             </label>
             <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" defaultValue="+998 90 123 45 67" />
           </div>
           <div>
             <label className="block text-sm font-bold text-slate-700 mb-1.5 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-slate-400" /> Telegram havolasi
             </label>
             <input type="text" className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium" defaultValue="https://t.me/tezkorusta_admin" />
           </div>
        </div>
      </div>
    </div>
  );
}
