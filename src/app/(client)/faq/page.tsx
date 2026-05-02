"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronLeft, HelpCircle, MessageCircle, ShieldCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useLanguage } from "@/contexts/LanguageContext";

const faqContent = [
  {
    question: {
      uz: "Usta qanday topaman?",
      ru: "Как найти мастера?",
    },
    answer: {
      uz: "Bosh sahifadagi qidiruvdan xizmat turini yozing yoki kategoriyalardan birini tanlang. Natijalar ichidan tuman, reyting va VIP belgisi orqali mos ustani topishingiz mumkin.",
      ru: "Введите нужную услугу в поиске на главной странице или выберите категорию. В результатах можно ориентироваться на район, рейтинг и отметку VIP.",
    },
  },
  {
    question: {
      uz: "Usta bilan qanday bog‘lanaman?",
      ru: "Как связаться с мастером?",
    },
    answer: {
      uz: "Usta kartasini oching va telefon yoki Telegram tugmasi orqali bevosita bog‘laning. Aloqa ma’lumotlari mavjud bo‘lsa, ular e’lon sahifasida ko‘rinadi.",
      ru: "Откройте карточку мастера и свяжитесь напрямую по телефону или через Telegram. Если контакты указаны, они отображаются на странице объявления.",
    },
  },
  {
    question: {
      uz: "Xizmat narxi qancha?",
      ru: "Сколько стоит услуга?",
    },
    answer: {
      uz: "Narx ish turi, murakkablik va manzilga qarab belgilanadi. Aniq narxni usta bilan bog‘lanib, ish hajmini tushuntirgandan keyin kelishib olasiz.",
      ru: "Цена зависит от типа работы, сложности и адреса. Точную стоимость лучше согласовать с мастером после описания объема задачи.",
    },
  },
  {
    question: {
      uz: "Ishonchli ustani qanday bilaman?",
      ru: "Как понять, что мастер надежный?",
    },
    answer: {
      uz: "Reyting, sharhlar, tajriba yillari va VIP belgilariga e’tibor bering. Ish boshlanishidan oldin narx, muddat va kafolat shartlarini kelishib olish tavsiya qilinadi.",
      ru: "Обращайте внимание на рейтинг, отзывы, опыт и отметку VIP. Перед началом работы рекомендуем согласовать цену, сроки и условия гарантии.",
    },
  },
  {
    question: {
      uz: "Men ham usta bo‘lib ro‘yxatdan o‘tsam bo‘ladimi?",
      ru: "Могу ли я зарегистрироваться как мастер?",
    },
    answer: {
      uz: "Ha, mumkin. Profil yoki bosh sahifadagi admin bilan bog‘lanish tugmasi orqali murojaat qiling, ma’lumotlaringiz tekshirilgandan so‘ng e’lon joylanadi.",
      ru: "Да, можно. Свяжитесь с администратором через профиль или главную страницу, после проверки данных объявление будет размещено.",
    },
  },
  {
    question: {
      uz: "Saytdan foydalanish pullikmi?",
      ru: "Платное ли использование сайта?",
    },
    answer: {
      uz: "Mijozlar uchun ustalarni qidirish va ko‘rish bepul. Usta bilan kelishilgan xizmat narxi esa alohida hisoblanadi.",
      ru: "Для клиентов поиск и просмотр мастеров бесплатны. Стоимость самой услуги согласовывается отдельно с мастером.",
    },
  },
  {
    question: {
      uz: "VIP usta nima?",
      ru: "Что такое VIP мастер?",
    },
    answer: {
      uz: "VIP usta platformada ajratib ko‘rsatiladigan usta hisoblanadi. Bunday e’lonlar ko‘proq ko‘rinadi va odatda faolroq javob berishi uchun alohida belgilangan bo‘ladi.",
      ru: "VIP мастер — это мастер, выделенный на платформе. Такие объявления заметнее и обычно отмечаются для более быстрого отклика.",
    },
  },
];

const pageCopy = {
  title: {
    uz: "Ko‘p so‘raladigan savollar",
    ru: "Частые вопросы",
  },
  subtitle: {
    uz: "TeskorUsta24 xizmatidan foydalanish bo‘yicha eng kerakli javoblar.",
    ru: "Самые полезные ответы по использованию сервиса TeskorUsta24.",
  },
  helperTitle: {
    uz: "Javob topilmadimi?",
    ru: "Не нашли ответ?",
  },
  helperText: {
    uz: "Admin bilan Telegram orqali bog‘laning, savolingizga tez javob beramiz.",
    ru: "Свяжитесь с администратором в Telegram, мы быстро ответим на ваш вопрос.",
  },
  helperAction: {
    uz: "Telegramga yozish",
    ru: "Написать в Telegram",
  },
};

export default function FaqPage() {
  const { language } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 pb-24 font-inter transition-colors duration-200 dark:bg-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-slate-100/90 px-5 py-4 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
        <div className="flex items-center gap-3">
          <Link
            href="/profile"
            className="interactive flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={language === "uz" ? "Orqaga" : "Назад"}
          >
            <ChevronLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              TeskorUsta24
            </p>
            <h1 className="text-lg font-black leading-tight text-slate-900 dark:text-white">
              {pageCopy.title[language]}
            </h1>
          </div>
        </div>
      </header>

      <main className="flex-1 px-5 pt-5">
        <section className="mb-5 overflow-hidden rounded-[28px] bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-5 text-white shadow-lg shadow-blue-900/10">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-yellow-300 backdrop-blur">
            <HelpCircle className="h-7 w-7" />
          </div>
          <h2 className="max-w-[300px] text-2xl font-black leading-tight">
            {pageCopy.title[language]}
          </h2>
          <p className="mt-2 max-w-[320px] text-sm font-medium leading-relaxed text-blue-50">
            {pageCopy.subtitle[language]}
          </p>
        </section>

        <section className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          {faqContent.map((item, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={item.question.uz}
                className="border-b border-slate-100 last:border-b-0 dark:border-slate-800"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? -1 : index)}
                  className="interactive flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  aria-expanded={isOpen}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-300">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span className="flex-1 text-sm font-extrabold leading-snug text-slate-800 dark:text-slate-100">
                    {item.question[language]}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-16 pb-5 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                        {item.answer[language]}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </section>

        <section className="mt-5 rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-sky-50 text-sky-500 dark:bg-sky-500/10">
              <MessageCircle className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base font-black text-slate-900 dark:text-white">
                {pageCopy.helperTitle[language]}
              </h2>
              <p className="mt-1 text-sm font-medium leading-relaxed text-slate-500 dark:text-slate-400">
                {pageCopy.helperText[language]}
              </p>
              <a
                href="https://t.me/nuraliyev1s"
                target="_blank"
                rel="noopener noreferrer"
                className="interactive mt-4 inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] transition-colors hover:bg-blue-700"
              >
                {pageCopy.helperAction[language]}
              </a>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
