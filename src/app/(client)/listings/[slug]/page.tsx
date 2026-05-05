"use client";

import { use, useEffect, useState } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Listing } from "@/data/mockListings";
import { fetchListingBySlug, addReviewToListing } from "@/lib/supabase/api";
import { ChevronLeft, Share2, Heart, Star, MapPin, Briefcase, Phone, Send, ShieldCheck, CheckCircle2, X } from "lucide-react";
import ListingCard from "@/components/ListingCard";
import { useFavorites } from "@/hooks/useFavorites";
import toast from "react-hot-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { trackEvent } from "@/lib/analytics";

function getTelegramHref(telegram?: string) {
  const value = telegram?.trim();
  if (!value) {
    return "https://t.me/tezkorusta";
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  const username = value.startsWith("@") ? value.slice(1) : value;
  return `https://t.me/${username}`;
}

function getPhoneHref(phone?: string) {
  const normalized = phone?.replace(/[^\d+]/g, "").trim();
  return normalized ? `tel:${normalized}` : "tel:+998900000000";
}

export default function ListingDetail({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const [listing, setListing] = useState<Listing | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const savedProfile = localStorage.getItem("tezkor_profile");
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed.name) {
          setReviewForm(prev => ({ ...prev, name: parsed.name }));
        }
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    fetchListingBySlug(resolvedParams.slug).then(async data => {
      setListing(data);
      if (data) {
         void trackEvent("listing_view", {
           listing_id: data.id,
           listing_slug: data.slug,
           listing_name: data.name,
           category: data.category,
           district: data.district,
         });
         // Optionally fetch all and filter, or just empty for now
         setSimilarListings([]);
      }
      setLoading(false);
    });
  }, [resolvedParams.slug]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return <div className="flex flex-col items-center justify-center min-h-screen text-slate-500">Yuklanmoqda...</div>;
  }

  if (!listing) return notFound();

  const telegramHref = getTelegramHref(listing.telegram);
  const phoneHref = getPhoneHref(listing.phone);

  const handleSubmitReview = async () => {
    if (!reviewForm.name.trim() || !reviewForm.comment.trim()) {
      toast.error("Iltimos, barcha maydonlarni to'ldiring");
      return;
    }
    setIsSubmitting(true);
    const success = await addReviewToListing(listing.id, reviewForm);
    setIsSubmitting(false);

    if (success) {
      toast.success(t("reviewSuccess"));
      setIsReviewModalOpen(false);
      setReviewForm(prev => ({ ...prev, comment: "", rating: 5 }));
      
      const newReview = {
        id: Math.random().toString(),
        author: reviewForm.name,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        date: new Date().toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' })
      };
      
      setListing(prev => {
        if (!prev) return prev;
        const newReviews = [newReview, ...prev.reviews];
        const newTotal = prev.rating * prev.reviewsCount + reviewForm.rating;
        const newCount = prev.reviewsCount + 1;
        const newAvg = (newTotal / newCount).toFixed(1);

        return {
          ...prev,
          reviews: newReviews,
          reviewsCount: newCount,
          rating: Number(newAvg)
        };
      });
    } else {
      toast.error("Xatolik yuz berdi");
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 pb-28 relative transition-colors duration-200">
      {/* Sticky Header */}
      <header className={`fixed top-0 w-full max-w-md mx-auto z-50 flex items-center justify-between px-4 py-3 transition-all duration-300 ${isScrolled ? 'bg-white/90 dark:bg-slate-900/90 backdrop-blur-md shadow-sm' : 'bg-transparent'}`}>
        <Link href="/" className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm text-slate-800 dark:text-slate-100 interactive">
          <ChevronLeft className="w-6 h-6" />
        </Link>
        <div className="flex gap-2">
          <button className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm text-slate-800 dark:text-slate-100 interactive">
            <Share2 className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              void toggleFavorite(listing.id);
            }} 
            className="flex items-center justify-center w-10 h-10 rounded-full bg-white/80 dark:bg-slate-800/80 backdrop-blur-md shadow-sm text-slate-800 dark:text-slate-100 interactive"
          >
            <Heart className={`w-5 h-5 ${isFavorite(listing.id) ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        </div>
      </header>

      {/* Image Gallery Header */}
      <div className="relative w-full h-[35vh] min-h-[300px]">
        <Image 
          src={listing.imageUrl} 
          alt={listing.name} 
          fill 
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/20 to-transparent" />
        
        {/* Info Overlay */}
        <div className="absolute bottom-0 left-0 w-full p-5">
          {listing.isVip && (
            <div className="inline-flex items-center gap-1 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-md mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              VIP Usta
            </div>
          )}
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">{listing.name}</h1>
          <p className="text-blue-200 font-medium">{listing.category}</p>
        </div>
      </div>

      <main className="flex-1 px-5 py-6">
        {/* Quick Stats */}
        <div className="flex flex-wrap gap-3 mb-8">
           <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1 justify-center">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="font-bold text-slate-800 dark:text-slate-100">{listing.rating} <span className="font-normal text-slate-500 dark:text-slate-400 text-sm">({listing.reviewsCount})</span></span>
           </div>
           <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1 justify-center">
              <MapPin className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{listing.district}</span>
           </div>
           <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800 flex-1 justify-center min-w-[120px]">
              <Briefcase className="w-4 h-4 text-emerald-500" />
              <span className="font-medium text-slate-700 dark:text-slate-300 text-sm">{listing.experienceYears} yil tajriba</span>
           </div>
        </div>

        {/* Description */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3">Haqida</h2>
          <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[15px]">
            {listing.description}
          </p>
        </section>

        {/* Services */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">Xizmatlar</h2>
          <div className="flex flex-col gap-3">
            {listing.services.map((service, i) => (
              <div key={i} className="flex items-center gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-500 flex-shrink-0" />
                <span className="text-slate-700 dark:text-slate-300 font-medium">{service}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section className="mb-8">
           <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Sharhlar <span className="text-blue-600 dark:text-blue-400 ml-1">{listing.reviewsCount} ta</span></h2>
              <button onClick={() => setIsReviewModalOpen(true)} className="text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors">
                + {t("writeReview")}
              </button>
           </div>
           
           {listing.reviews.length > 0 ? (
             <div className="flex flex-col gap-4">
               {listing.reviews.map(review => (
                 <div key={review.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                   <div className="flex justify-between items-start mb-2">
                     <span className="font-bold text-slate-800 dark:text-slate-100">{review.author}</span>
                     <div className="flex items-center">
                       <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 mr-1" />
                       <span className="text-sm font-semibold dark:text-slate-200">{review.rating}</span>
                     </div>
                   </div>
                   <p className="text-slate-600 dark:text-slate-400 text-sm">{review.comment}</p>
                   <span className="text-xs text-slate-400 dark:text-slate-500 mt-2 block">{review.date}</span>
                 </div>
               ))}
             </div>
           ) : (
             <div className="bg-slate-100 dark:bg-slate-800/50 p-6 rounded-2xl text-center">
               <p className="text-slate-500 dark:text-slate-400">Hozircha sharhlar yo'q</p>
             </div>
           )}
        </section>

        {/* Similar Masters */}
        {similarListings.length > 0 && (
          <section className="mb-4">
             <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4">O'xshash ustalar</h2>
             <div className="flex flex-col gap-4">
               {similarListings.map(l => (
                 <ListingCard key={l.id} listing={l} />
               ))}
             </div>
          </section>
        )}
      </main>

      {/* Sticky Bottom Actions */}
      <div className="fixed bottom-0 w-full max-w-[430px] mx-auto left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 p-4 px-5 pb-safe flex gap-3 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] dark:shadow-none">
        <a href={telegramHref} target="_blank" rel="noopener noreferrer" className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 interactive transition-colors">
          <Send className="w-5 h-5 text-blue-500" />
          Telegram
        </a>
        <a href={phoneHref} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 interactive shadow-lg shadow-blue-600/30 transition-colors">
          <Phone className="w-5 h-5" />
          Qo'ng'iroq
        </a>
      </div>

      {/* Write Review Modal */}
      <AnimatePresence>
        {isReviewModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReviewModalOpen(false)}
              className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-sm z-[100] max-w-[430px] mx-auto"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[110] max-w-[430px] mx-auto bg-white dark:bg-slate-900 rounded-t-[32px] shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full" />
              </div>
              <div className="flex items-center justify-between px-6 pb-4 pt-2 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 tracking-tight">{t("writeReview")}</h3>
                <button onClick={() => setIsReviewModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 flex flex-col gap-5 overflow-y-auto no-scrollbar pb-safe">
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{t("name")}</label>
                  <input 
                    type="text" 
                    value={reviewForm.name} 
                    onChange={e => setReviewForm({...reviewForm, name: e.target.value})} 
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold text-slate-800 dark:text-slate-100 transition-all placeholder:font-medium placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                    placeholder="Masalan: Sardor" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{t("selectRating")}</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button 
                        key={star} 
                        onClick={() => setReviewForm({...reviewForm, rating: star})}
                        className="p-1 focus:outline-none interactive"
                      >
                        <Star className={`w-10 h-10 transition-colors ${reviewForm.rating >= star ? 'text-amber-400 fill-amber-400' : 'text-slate-200 dark:text-slate-700 fill-slate-200 dark:fill-slate-700'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">{t("yourComment")}</label>
                  <textarea 
                    value={reviewForm.comment} 
                    onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} 
                    className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-800 dark:text-slate-100 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 min-h-[120px] resize-none" 
                    placeholder="Xizmat haqida fikringizni yozing..." 
                  />
                </div>

                <button 
                  onClick={handleSubmitReview}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl mt-2 transition-colors flex items-center justify-center gap-2 shadow-[0_8px_20px_-6px_rgba(37,99,235,0.5)] disabled:opacity-70 mb-4"
                >
                  {isSubmitting ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Send className="w-5 h-5" />}
                  {t("submitReview")}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
