export type FeatureQuickCard = {
  title: string;
  description: string;
  href: string;
  icon: "sparkles" | "guide" | "community";
};

export const featureQuickCards: FeatureQuickCard[] = [
  {
    title: "AI Ideas",
    description: "Get reuse ideas from a photo or details.",
    href: "/results",
    icon: "sparkles",
  },
  {
    title: "DIY Guides",
    description: "Follow step-by-step project instructions.",
    href: "/results",
    icon: "guide",
  },
  {
    title: "Community",
    description: "See progress posts and learn from others.",
    href: "/community",
    icon: "community",
  },
];
