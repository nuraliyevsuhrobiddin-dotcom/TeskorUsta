import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Briefcase, ChevronLeft, MapPin, Phone, ShieldCheck, Star } from "lucide-react";
import {
  fetchSeoLandingListings,
  getAllSeoLandingPairs,
  getSeoLandingPath,
  getSiteUrl,
  resolveSeoParams,
} from "@/lib/seoLanding";
import type { Listing } from "@/data/mockListings";

type SeoLandingPageProps = {
  params: Promise<{
    category: string;
    district: string;
  }>;
};

function getPhoneHref(phone?: string) {
  const normalized = phone?.replace(/[^\d+]/g, "").trim();
  return normalized ? `tel:${normalized}` : null;
}

function buildTitle(category: string, district: string) {
  return `${category} ${district} | TezkorUsta`;
}

function buildDescription(category: string, district: string) {
  return `${district} tumanida ishonchli ${category.toLowerCase()} ustalarini toping. Reyting, tajriba, xizmatlar va aloqa ma'lumotlari TezkorUsta platformasida.`;
}

function SeoListingCard({ listing }: { listing: Listing }) {
  const phoneHref = getPhoneHref(listing.phone);

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <Link href={`/listings/${listing.slug}`} className="block">
        <div className="relative h-44 overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
          <Image
            src={listing.imageUrl}
            alt={`${listing.name} - ${listing.category} ${listing.district}`}
            fill
            sizes="(max-width: 430px) 100vw, 390px"
            className="object-cover"
          />
          {listing.isVip && (
            <span className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white shadow">
              <ShieldCheck className="h-3.5 w-3.5" />
              VIP Usta
            </span>
          )}
          <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-lg bg-white/90 px-2 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur dark:bg-slate-900/90 dark:text-slate-200">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {listing.rating} ({listing.reviewsCount})
          </span>
        </div>

        <div className="px-1 pt-3">
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100">{listing.name}</h2>
          <p className="mt-1 text-sm font-medium text-blue-600 dark:text-blue-400">{listing.category}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800">
              <MapPin className="h-3.5 w-3.5" />
              {listing.district}
            </span>
            <span className="flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1 dark:bg-slate-800">
              <Briefcase className="h-3.5 w-3.5" />
              {listing.experienceYears} yil tajriba
            </span>
          </div>
          {listing.description && (
            <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
              {listing.description}
            </p>
          )}
        </div>
      </Link>

      <a
        href={phoneHref ?? `/listings/${listing.slug}`}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-blue-50 hover:text-blue-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300"
      >
        <Phone className="h-4 w-4" />
        Bog&apos;lanish
      </a>
    </article>
  );
}

export function generateStaticParams() {
  return getAllSeoLandingPairs().map(({ categorySlug, districtSlug }) => ({
    category: categorySlug,
    district: districtSlug,
  }));
}

export async function generateMetadata({ params }: SeoLandingPageProps): Promise<Metadata> {
  const { category: categorySlug, district: districtSlug } = await params;
  const resolved = resolveSeoParams(categorySlug, districtSlug);

  if (!resolved) {
    return {};
  }

  const title = buildTitle(resolved.category, resolved.district);
  const description = buildDescription(resolved.category, resolved.district);
  const path = getSeoLandingPath(resolved.category, resolved.district);

  return {
    title,
    description,
    keywords: [
      `${resolved.category} ${resolved.district}`,
      `${resolved.district} ${resolved.category}`,
      `${resolved.category} usta`,
      `${resolved.district} usta`,
      "Toshkent usta topish",
    ],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title,
      description,
      url: `${getSiteUrl()}${path}`,
      type: "website",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
  };
}

export default async function SeoLandingPage({ params }: SeoLandingPageProps) {
  const { category: categorySlug, district: districtSlug } = await params;
  const resolved = resolveSeoParams(categorySlug, districtSlug);

  if (!resolved) {
    notFound();
  }

  const listings = await fetchSeoLandingListings(resolved.category, resolved.district);
  const keyword = `${resolved.category} ${resolved.district}`;

  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-[430px] flex-col bg-slate-50 text-slate-900 shadow-2xl dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-slate-100 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <Link href="/" className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800" aria-label="Bosh sahifaga qaytish">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">SEO sahifa</p>
          <p className="text-lg font-bold">{keyword}</p>
        </div>
      </header>

      <section className="px-5 py-6">
        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">TezkorUsta orqali toping</p>
        <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight">
          {resolved.district} tumanida {resolved.category.toLowerCase()} kerakmi?
        </h1>
        <div className="mt-4 space-y-4 text-[15px] leading-7 text-slate-600 dark:text-slate-300">
          <p>
            {keyword} bo&apos;yicha ishonchli ustalarni shu sahifada ko&apos;rishingiz mumkin. TezkorUsta
            Toshkent bo&apos;ylab santexnik, elektrik, konditsioner ustasi va boshqa mutaxassislarni
            topishni osonlashtiradi.
          </p>
          <p>
            Ustalarni reytingi, tajribasi, tumani va xizmat tavsifi bo&apos;yicha solishtiring. Mos
            kelgan mutaxassis profiliga o&apos;tib, telefon orqali bog&apos;lanishingiz mumkin.
          </p>
        </div>
      </section>

      <section className="flex-1 px-5 pb-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold">{resolved.district}dagi ustalar</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {listings.length} ta {resolved.category.toLowerCase()} topildi
            </p>
          </div>
          <Link href="/search" className="text-sm font-bold text-blue-600 dark:text-blue-400">
            Qidirish
          </Link>
        </div>

        {listings.length > 0 ? (
          <div className="flex flex-col gap-4">
            {listings.map((listing) => (
              <SeoListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-8 text-center dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold">Hozircha mos usta yo&apos;q</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
              Bu sahifa Google uchun ochiq va keyingi qo&apos;shilgan {resolved.category.toLowerCase()} ustalari
              shu yerda chiqadi. Hozir barcha ustalarni qidiruv sahifasida ko&apos;rishingiz mumkin.
            </p>
            <Link
              href="/search"
              className="mt-5 inline-flex rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm"
            >
              Barcha ustalarni ko&apos;rish
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
