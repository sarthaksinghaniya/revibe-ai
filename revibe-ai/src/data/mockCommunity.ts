export type CommunityPost = {
  id: string;
  userName: string;
  avatarInitials: string;
  imageSrc: string;
  caption: string;
  likes: number;
  comments: number;
  progressPct: number;
  createdAt: string;
};

export const mockPosts: CommunityPost[] = [
  {
    id: "p1",
    userName: "Aanya",
    avatarInitials: "AA",
    imageSrc: "/mock/ewaste-1.svg",
    caption: "Old router → a tiny home-lab monitor. Cleaned the board today.",
    likes: 128,
    comments: 14,
    progressPct: 45,
    createdAt: "2h ago",
  },
  {
    id: "p2",
    userName: "Dev",
    avatarInitials: "DK",
    imageSrc: "/mock/ewaste-2.svg",
    caption: "Upcycling a phone into a desk clock. Next: mount + cable routing.",
    likes: 342,
    comments: 37,
    progressPct: 70,
    createdAt: "Yesterday",
  },
  {
    id: "p3",
    userName: "Mina",
    avatarInitials: "MS",
    imageSrc: "/mock/ewaste-3.svg",
    caption: "Laptop fan salvage. Testing airflow before building the enclosure.",
    likes: 89,
    comments: 9,
    progressPct: 25,
    createdAt: "3d ago",
  },
];
