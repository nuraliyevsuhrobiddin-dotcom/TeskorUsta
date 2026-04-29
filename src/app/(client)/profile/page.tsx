"use client";

import BottomNav from "@/components/BottomNav";
import { User, Heart, Globe, ChevronRight, Phone, Bell, Moon, HelpCircle, Info, Send, Camera, X, Check } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const { language, toggleLanguage, t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [profileData, setProfileData] = useState({ name: "", phone: "", avatar: "" });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", avatar: "" });

  useEffect(() => {
    setDarkMode(localStorage.getItem("tezkor_theme") === "dark");
    setNotifications(localStorage.getItem("tezkor_notifications") !== "false");
    const savedProfile = localStorage.getItem("tezkor_profile");
    if (savedProfile) {
      try {
        setProfileData(JSON.parse(savedProfile));
      } catch (e) {}
    }
  }, []);

  const handleLanguageToggle = () => {
    toggleLanguage();
  };

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tezkor_theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tezkor_theme", "light");
    }
  };

  const toggleNotifications = () => {
    const next = !notifications;
    setNotifications(next);
    localStorage.setItem("tezkor_notifications", String(next));
    if (next) {
      toast.success(t("notifications") + " on");
    } else {
      toast.success(t("notifications") + " off");
    }
  };

  const handleOpenEdit = () => {
    setEditForm(profileData);
    setIsEditModalOpen(true);
  };

  const handleSaveProfile = () => {
    setProfileData(editForm);
    localStorage.setItem("tezkor_profile", JSON.stringify(editForm));
    setIsEditModalOpen(false);
    toast.success(t("save") + " muvaffaqiyatli");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Rasm hajmi 2MB dan oshmasligi kerak");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxSize = 400; // compress to 400x400 max

        if (width > height) {
          if (width > maxSize) {
            height *= Math.round(maxSize / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= Math.round(maxSize / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL("image/jpeg", 0.7); // 70% quality
          setEditForm(prev => ({ ...prev, avatar: dataUrl }));
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const ListItem = ({ icon: Icon, title, value, onClick, href, colorClass, isSwitch, switchValue }: any) => {
    const content = (
      <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-xl ${colorClass}`}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-100">{title}</span>
        </div>
        
        {isSwitch ? (
          <div className={`w-12 h-7 rounded-full transition-colors relative flex items-center px-1 cursor-pointer ${switchValue ? 'bg-blue-500' : 'bg-slate-200 dark:bg-slate-700'}`}>
            <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${switchValue ? 'translate-x-5' : 'translate-x-0'}`} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            {value && <span className="text-sm font-semibold text-slate-400 dark:text-slate-500">{value}</span>}
            <ChevronRight className="w-5 h-5 text-slate-300 dark:text-slate-600" />
          </div>
        )}
      </div>
    );

    if (href) {
      return <Link href={href} className="block interactive active:scale-[0.98]">{content}</Link>;
    }

    return <div onClick={onClick} className="block cursor-pointer interactive active:scale-[0.98]">{content}</div>;
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 pb-24 font-inter transition-colors duration-200">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-6">{t("profile")}</h1>
        <div 
          onClick={handleOpenEdit}
          className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm dark:shadow-none border border-slate-100 dark:border-slate-800 cursor-pointer interactive active:scale-[0.98]"
        >
          <div className="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-100 dark:border-blue-500/20 overflow-hidden relative">
            {profileData.avatar ? (
              <img src={profileData.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{profileData.name || "TezkorUsta"}</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">{profileData.phone || t("clientPage")}</p>
          </div>
          <div className="flex items-center justify-center w-8 h-8 bg-slate-50 dark:bg-slate-800/50 rounded-full border border-slate-100 dark:border-slate-800">
            <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          </div>
        </div>
      </header>

      <main className="flex-1 px-5">
        <div className="flex flex-col gap-6">
          
          {/* Group 1: Account & Activities */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-2">{t("account")}</h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              <ListItem 
                icon={Heart} 
                title={t("savedListings")} 
                href="/saved"
                colorClass="bg-rose-50 dark:bg-rose-500/10 text-rose-500" 
              />
            </div>
          </div>

          {/* Group 2: Preferences */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-2">{t("preferences")}</h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              <ListItem 
                icon={Globe} 
                title={t("changeLanguage")} 
                onClick={handleLanguageToggle}
                value={language === "uz" ? "O'zbekcha" : "Русский"}
                colorClass="bg-blue-50 dark:bg-blue-500/10 text-blue-500" 
              />
              <ListItem 
                icon={Bell} 
                title={t("notifications")} 
                isSwitch 
                switchValue={notifications}
                onClick={toggleNotifications}
                colorClass="bg-amber-50 dark:bg-amber-500/10 text-amber-500" 
              />
              <ListItem 
                icon={Moon} 
                title={t("darkMode")} 
                isSwitch 
                switchValue={darkMode}
                onClick={toggleDarkMode}
                colorClass="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300" 
              />
            </div>
          </div>

          {/* Group 3: Support */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-2">{t("support")}</h3>
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
              <ListItem 
                icon={Send} 
                title={t("writeTelegram")} 
                onClick={() => window.open('https://t.me/nuraliyev1s', '_blank')}
                colorClass="bg-sky-50 dark:bg-sky-500/10 text-sky-500" 
              />
              <ListItem 
                icon={Phone} 
                title={t("callUs")} 
                onClick={() => window.open('tel:+998997777031')}
                colorClass="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500" 
              />
              <ListItem 
                icon={HelpCircle} 
                title={t("faq")} 
                onClick={() => toast.success("Tez kunda...")}
                colorClass="bg-purple-50 dark:bg-purple-500/10 text-purple-500" 
              />
            </div>
          </div>

          {/* Group 4: About */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none bg-white dark:bg-slate-900 divide-y divide-slate-100 dark:divide-slate-800">
            <ListItem 
              icon={Info} 
              title={t("aboutApp")} 
              value="v1.0.0"
              onClick={() => toast.success("TezkorUsta v1.0.0")}
              colorClass="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400" 
            />
          </div>

        </div>
      </main>

      {/* Edit Profile Modal (Bottom Sheet) */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-[100] max-w-[430px] mx-auto"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[110] max-w-[430px] mx-auto bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>

              <div className="flex items-center justify-between px-6 pb-4 pt-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{t("editProfile")}</h3>
                <button onClick={() => setIsEditModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-6 overflow-y-auto no-scrollbar">
                
                {/* Avatar Upload */}
                <div className="flex justify-center">
                  <label className="relative w-28 h-28 rounded-full bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    {editForm.avatar ? (
                      <>
                        <img src={editForm.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-slate-900/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                           <Camera className="w-6 h-6 text-white mb-1" />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center text-slate-400 dark:text-slate-500">
                        <Camera className="w-8 h-8 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t("uploadAvatar")}</span>
                      </div>
                    )}
                  </label>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{t("name")}</label>
                    <input 
                      type="text" 
                      value={editForm.name} 
                      onChange={e => setEditForm({...editForm, name: e.target.value})} 
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100 transition-all placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                      placeholder="Masalan: Sardor" 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{t("phone")}</label>
                    <input 
                      type="tel" 
                      value={editForm.phone} 
                      onChange={e => setEditForm({...editForm, phone: e.target.value})} 
                      className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100 transition-all placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                      placeholder="+998 90 123 45 67" 
                    />
                  </div>
                </div>

                {/* Save Button */}
                <button 
                  onClick={handleSaveProfile} 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-2 transition-colors flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)]"
                >
                  <Check className="w-5 h-5" />
                  {t("save")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BottomNav />
    </div>
  );
}
