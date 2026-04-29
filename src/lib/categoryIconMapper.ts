import {
  Briefcase,
  Fan,
  Hammer,
  Paintbrush,
  Settings,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type HomeCategoryVisual = {
  bgClassName: string;
  colorClassName: string;
  icon: LucideIcon;
};

const CATEGORY_VISUALS: Record<string, HomeCategoryVisual> = {
  santexnik: {
    icon: Wrench,
    colorClassName: "text-blue-500 dark:text-blue-400",
    bgClassName: "bg-blue-50 dark:bg-blue-500/10",
  },
  elektrik: {
    icon: Zap,
    colorClassName: "text-amber-500 dark:text-amber-400",
    bgClassName: "bg-amber-50 dark:bg-amber-500/10",
  },
  "konditsioner usta": {
    icon: Fan,
    colorClassName: "text-cyan-500 dark:text-cyan-400",
    bgClassName: "bg-cyan-50 dark:bg-cyan-500/10",
  },
  pardozlovchi: {
    icon: Paintbrush,
    colorClassName: "text-rose-500 dark:text-rose-400",
    bgClassName: "bg-rose-50 dark:bg-rose-500/10",
  },
  "mebel yig'uvchi": {
    icon: Hammer,
    colorClassName: "text-orange-500 dark:text-orange-400",
    bgClassName: "bg-orange-50 dark:bg-orange-500/10",
  },
  "maishiy texnika": {
    icon: Settings,
    colorClassName: "text-violet-500 dark:text-violet-400",
    bgClassName: "bg-violet-50 dark:bg-violet-500/10",
  },
};

const DEFAULT_VISUAL: HomeCategoryVisual = {
  icon: Briefcase,
  colorClassName: "text-emerald-500 dark:text-emerald-400",
  bgClassName: "bg-emerald-50 dark:bg-emerald-500/10",
};

export function getCategoryVisual(category: string): HomeCategoryVisual {
  const normalizedCategory = category.trim().toLowerCase();
  return CATEGORY_VISUALS[normalizedCategory] ?? DEFAULT_VISUAL;
}
