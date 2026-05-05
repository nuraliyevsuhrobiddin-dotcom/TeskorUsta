"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type Language = "uz" | "ru";

interface Translations {
  [key: string]: {
    uz: string;
    ru: string;
  };
}

const translations: Translations = {
  profile: { uz: "Profil", ru: "Профиль" },
  savedListings: { uz: "Saqlangan e'lonlar", ru: "Сохраненные объявления" },
  changeLanguage: { uz: "Tilni o'zgartirish", ru: "Изменить язык" },
  support: { uz: "Qo'llab-quvvatlash", ru: "Поддержка" },
  settings: { uz: "Sozlamalar", ru: "Настройки" },
  logout: { uz: "Tizimdan chiqish", ru: "Выйти" },
  languageUz: { uz: "O'zbekcha", ru: "Узбекский" },
  languageRu: { uz: "Ruscha", ru: "Русский" },
  // Settings translations
  darkMode: { uz: "Tungi rejim", ru: "Темный режим" },
  notifications: { uz: "Bildirishnomalar", ru: "Уведомления" },
  clearCache: { uz: "Keshni tozalash", ru: "Очистить кэш" },
  version: { uz: "Versiya", ru: "Версия" },
  // Support translations
  callUs: { uz: "Qo'ng'iroq qilish", ru: "Позвонить" },
  writeTelegram: { uz: "Telegram orqali yozish", ru: "Написать в Telegram" },
  writeEmail: { uz: "Email yuborish", ru: "Отправить Email" },
  // New translations
  myRequests: { uz: "Mening buyurtmalarim", ru: "Мои заказы" },
  faq: { uz: "Ko'p so'raladigan savollar", ru: "Частые вопросы" },
  aboutApp: { uz: "Ilova haqida", ru: "О приложении" },
  preferences: { uz: "Afzalliklar", ru: "Предпочтения" },
  account: { uz: "Hisob", ru: "Аккаунт" },
  guest: { uz: "Mehmon", ru: "Гость" },
  loginRegister: { uz: "Kirish / Ro'yxatdan o'tish", ru: "Войти / Регистрация" },
  
  // Home Page Redesign Translations
  heroTitle1: { uz: "Uyingiz uchun", ru: "Для вашего дома" },
  heroTitle2: { uz: "eng ishonchli", ru: "самые надежные" },
  heroTitle3: { uz: "ustalar", ru: "мастера" },
  heroSubtitle: { uz: "Santexnik, elektrik va boshqa xizmatlar bir zumda.", ru: "Сантехник, электрик и другие услуги мгновенно." },
  heroConversionLine1: { uz: "2 daqiqada", ru: "За 2 минуты" },
  heroConversionLine2: { uz: "ishonchli usta", ru: "надежного мастера" },
  heroConversionLine3: { uz: "toping", ru: "найдите" },
  heroConversionSubtitle: { uz: "Toshkent bo‘yicha 24/7 xizmat", ru: "Услуги по Ташкенту 24/7" },
  heroTrustMasters: { uz: "100+ faol ustalar", ru: "100+ активных мастеров" },
  heroTrustFastReply: { uz: "Tez javob", ru: "Быстрый ответ" },
  searchPlaceholder: { uz: "Usta qidirish...", ru: "Поиск мастера..." },
  searchSubtitle: { uz: "Santexnik, elektrik, va boshqalar", ru: "Сантехник, электрик и другие" },
  trustReliable: { uz: "Ishonchli Ustalar", ru: "Надежные мастера" },
  trustFast: { uz: "Tezkor Yetib borish", ru: "Быстрый выезд" },
  trustQuality: { uz: "Sifatli Xizmat", ru: "Качество" },
  services: { uz: "Xizmatlar", ru: "Услуги" },
  districts: { uz: "Tumanlar", ru: "Районы" },
  vipMasters: { uz: "VIP Ustalar", ru: "VIP Мастера" },
  seeAll: { uz: "Barchasi", ru: "Все" },
  recentListings: { uz: "So'nggi e'lonlar", ru: "Последние объявления" },
  testimonials: { uz: "Mijozlarimiz fikrlari", ru: "Отзывы клиентов" },
  becomeMasterTitle: { uz: "O'z ishingiz ustasimisiz?", ru: "Вы мастер своего дела?" },
  becomeMasterSub: { uz: "Platformamizga qo'shiling va mijozlar toping.", ru: "Присоединяйтесь к платформе и находите клиентов." },
  contactAdmin: { uz: "Admin bilan bog'lanish", ru: "Связаться с админом" },
  registerNow: { uz: "Ro'yxatdan o'tish", ru: "Регистрация" },
  editProfile: { uz: "Profilni tahrirlash", ru: "Редактировать профиль" },
  name: { uz: "Ismingiz", ru: "Ваше имя" },
  phone: { uz: "Telefon raqamingiz", ru: "Ваш номер телефона" },
  save: { uz: "Saqlash", ru: "Сохранить" },
  uploadAvatar: { uz: "Rasm yuklash", ru: "Загрузить фото" },
  clientPage: { uz: "Mijoz sahifasi", ru: "Страница клиента" },
  writeReview: { uz: "Sharh yozish", ru: "Написать отзыв" },
  yourComment: { uz: "Fikringiz", ru: "Ваш отзыв" },
  submitReview: { uz: "Sharhni yuborish", ru: "Отправить отзыв" },
  selectRating: { uz: "Baholang", ru: "Оцените" },
  reviewSuccess: { uz: "Sharhingiz muvaffaqiyatli yuborildi!", ru: "Ваш отзыв успешно отправлен!" },
  noReviewsYet: { uz: "Hozircha sharhlar yo'q", ru: "Пока нет отзывов" }
};

interface LanguageContextProps {
  language: Language;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("uz");

  useEffect(() => {
    const saved = window.localStorage.getItem("tezkor_language");
    if (saved === "ru" || saved === "uz") {
      setLanguage(saved);
    }
  }, []);

  const toggleLanguage = () => {
    const next = language === "uz" ? "ru" : "uz";
    setLanguage(next);
    window.localStorage.setItem("tezkor_language", next);
  };

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
}
