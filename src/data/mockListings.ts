export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Listing {
  id: string;
  slug: string;
  name: string;
  category: string;
  district: string;
  rating: number;
  reviewsCount: number;
  experienceYears: number;
  isVip: boolean;
  imageUrl: string;
  description: string;
  services: string[];
  reviews: Review[];
  isActive?: boolean;
  phone?: string;
  telegram?: string;
}

export const districts = [
  "Yunusobod",
  "Chilonzor",
  "Mirzo Ulug'bek",
  "Yashnobod",
  "Mirobod",
  "Olmazor",
  "Shayxontohur",
  "Sirg'ali",
  "Uchtepa",
  "Yakkasaroy",
  "Yangihayot"
];

export const defaultCategories = [
  "Santexnik",
  "Elektrik",
  "Konditsioner usta",
  "Pardozlovchi",
  "Mebel yig'uvchi",
  "Maishiy texnika"
];

export const mockListings: Listing[] = [
  {
    id: "1",
    slug: "azamat-santexnik",
    name: "Azamat M.",
    category: "Santexnik",
    district: "Yunusobod",
    rating: 4.9,
    reviewsCount: 124,
    experienceYears: 8,
    isVip: true,
    imageUrl: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?q=80&w=400&auto=format&fit=crop",
    description: "Assalomu alaykum! Men 8 yillik tajribaga ega professional santexnikman. Barcha turdagi santexnika ishlarini tez va sifatli bajaraman. Quvurlarni almashtirish, unitaz o'rnatish, isitish tizimlarini ta'mirlash.",
    services: [
      "Quvurlarni tozalash",
      "Unitaz o'rnatish",
      "Isitish tizimlari",
      "Suv oqishini bartaraf etish"
    ],
    reviews: [
      {
        id: "r1",
        author: "Jamshid T.",
        rating: 5,
        date: "12 Okt, 2023",
        comment: "Juda tez va sifatli ishladi. Rahmat!"
      },
      {
        id: "r2",
        author: "Malika B.",
        rating: 5,
        date: "05 Okt, 2023",
        comment: "O'z ishining ustasi ekan, hammaga tavsiya qilaman."
      }
    ]
  },
  {
    id: "2",
    slug: "dilshod-elektrik",
    name: "Dilshod K.",
    category: "Elektrik",
    district: "Chilonzor",
    rating: 4.8,
    reviewsCount: 89,
    experienceYears: 5,
    isVip: true,
    imageUrl: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=400&auto=format&fit=crop",
    description: "Uy va ofislar uchun barcha turdagi elektr montaj ishlari. Qisqa tutashuvlarni topish va to'g'irlash, rozetka va viklyuchatellarni o'rnatish.",
    services: [
      "Elektr simlarini tortish",
      "Qandil o'rnatish",
      "Avtomatlarni almashtirish",
      "Qisqa tutashuvni tuzatish"
    ],
    reviews: [
      {
        id: "r3",
        author: "Sardor A.",
        rating: 4,
        date: "22 Sen, 2023",
        comment: "Yaxshi ishladi, biroz kechikib keldi lekin ishini toza qildi."
      }
    ]
  },
  {
    id: "3",
    slug: "jasur-santexnik",
    name: "Jasur U.",
    category: "Santexnik",
    district: "Mirzo Ulug'bek",
    rating: 4.6,
    reviewsCount: 45,
    experienceYears: 3,
    isVip: false,
    imageUrl: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=400&auto=format&fit=crop",
    description: "Santexnika va kanalizatsiya muammolarini hal qilaman. Hamyonbop narxlar va kafolatli xizmat.",
    services: [
      "Kranlarni almashtirish",
      "Rakovina o'rnatish",
      "Kir yuvish mashinasini ulash"
    ],
    reviews: []
  },
  {
    id: "4",
    slug: "oybek-konditsioner",
    name: "Oybek T.",
    category: "Konditsioner usta",
    district: "Yashnobod",
    rating: 5.0,
    reviewsCount: 210,
    experienceYears: 12,
    isVip: true,
    imageUrl: "https://images.unsplash.com/photo-1534398079543-7ae6d016b86a?q=80&w=400&auto=format&fit=crop",
    description: "Konditsionerlarni yuvish, freon quyish, o'rnatish va ta'mirlash. Toshkent bo'ylab tezkor yetib borish.",
    services: [
      "Freon quyish",
      "Konditsioner yuvish",
      "Platani ta'mirlash",
      "Montaj va demontaj"
    ],
    reviews: []
  },
  {
    id: "5",
    slug: "rustam-pardoz",
    name: "Rustam B.",
    category: "Pardozlovchi",
    district: "Mirobod",
    rating: 4.7,
    reviewsCount: 67,
    experienceYears: 6,
    isVip: false,
    imageUrl: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?q=80&w=400&auto=format&fit=crop",
    description: "Kvartira va uylarni noldan ta'mirlash. Oboi yopishtirish, gipsokarton ishlari, kafel terish.",
    services: [
      "Kafel terish",
      "Oboi yopishtirish",
      "Malyar ishlari"
    ],
    reviews: []
  }
];
