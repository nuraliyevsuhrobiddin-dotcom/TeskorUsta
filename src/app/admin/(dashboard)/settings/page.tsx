"use client";

import { useEffect, useState } from "react";
import { Globe, Link as LinkIcon, Monitor, Phone, Save, Settings as SettingsIcon } from "lucide-react";
import toast from "react-hot-toast";
import { fetchSiteSettings, saveSiteSettings, SiteSettings } from "@/lib/supabase/api";

const fallbackSettings: SiteSettings = {
  siteName: "TezkorUsta",
  mainLanguage: "uz",
  theme: "light",
  supportPhone: "+998 90 123 45 67",
  telegramUrl: "https://t.me/tezkorusta_admin",
  maintenanceMode: false,
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(fallbackSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSiteSettings().then((data) => {
      setSettings(data);
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const success = await saveSiteSettings(settings);
    setSaving(false);

    if (success) {
      toast.success("Sozlamalar saqlandi");
    } else {
      toast.error("Sozlamalarni saqlashda xatolik");
    }
  };

  if (loading) {
    return <div className="h-96 rounded-2xl bg-slate-200 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Sozlamalar</h1>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Umumiy</h3>
          <p className="text-sm text-slate-500">Sayt nomi, til, mavzu va xizmat holati.</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-slate-400" /> Sayt nomi
            </span>
            <input
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
              value={settings.siteName}
              onChange={(event) => setSettings({ ...settings, siteName: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-400" /> Asosiy til
            </span>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
              value={settings.mainLanguage}
              onChange={(event) => setSettings({ ...settings, mainLanguage: event.target.value as SiteSettings["mainLanguage"] })}
            >
              <option value="uz">O'zbekcha</option>
              <option value="ru">Ruscha</option>
            </select>
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-slate-400" /> Mavzu
            </span>
            <select
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
              value={settings.theme}
              onChange={(event) => setSettings({ ...settings, theme: event.target.value as SiteSettings["theme"] })}
            >
              <option value="light">Yorqin</option>
              <option value="dark">Qorong'i</option>
              <option value="system">Tizim</option>
            </select>
          </label>
          <label className="flex items-center justify-between cursor-pointer p-3 border border-slate-100 rounded-xl hover:bg-slate-50 transition-colors">
            <div>
              <span className="block text-sm font-bold text-slate-800">Texnik rejim</span>
              <span className="block text-xs text-slate-500 font-medium mt-0.5">Saytni vaqtincha yopish belgisi</span>
            </div>
            <input
              type="checkbox"
              className="h-5 w-5 accent-blue-600"
              checked={settings.maintenanceMode}
              onChange={(event) => setSettings({ ...settings, maintenanceMode: event.target.checked })}
            />
          </label>
        </div>
      </div>

      <hr className="border-slate-200" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Aloqa</h3>
          <p className="text-sm text-slate-500">Mijozlar ko'radigan asosiy kontaktlar.</p>
        </div>
        <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> Telefon raqam
            </span>
            <input
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
              value={settings.supportPhone}
              onChange={(event) => setSettings({ ...settings, supportPhone: event.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <LinkIcon className="w-4 h-4 text-slate-400" /> Telegram havolasi
            </span>
            <input
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 font-medium"
              value={settings.telegramUrl}
              onChange={(event) => setSettings({ ...settings, telegramUrl: event.target.value })}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
