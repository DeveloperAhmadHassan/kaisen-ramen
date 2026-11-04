export type Kind = "ramen" | "sides" | "drinks";

export type MenuItem = {
  id: string;
  name: string;
  kind: Kind;
  price: number;
  text: string;
  src?: string;
  w?: number;
  h?: number;
  heat?: number; // 0-3 chilis
  tags?: string[];
};

// placeholder prices and descriptions
export const MENU: MenuItem[] = [
  { id: "kara-tori", name: "Kara Tori", kind: "ramen", price: 15.5, heat: 3, tags: ["House favourite", "Spicy"], text: "Fiery broth, kimchi, chili oil, braised beef and a jammy egg.", src: "/images/bowl-main.png", w: 1000, h: 1000 },
  { id: "miso-tori", name: "Miso Tori", kind: "ramen", price: 14, heat: 1, tags: ["Hokkaido style"], text: "Rich miso broth, charred chicken, sweet corn and greens.", src: "/images/bowl-right.png", w: 1000, h: 1000 },
  { id: "chashu-men", name: "Chashu Men", kind: "ramen", price: 16, heat: 1, tags: ["Most filling"], text: "Torched pork chashu, two soft eggs, scallions and fresh chili.", src: "/images/bowl-left.png", w: 1000, h: 1000 },
  { id: "tsukimi-soba", name: "Tsukimi Soba", kind: "ramen", price: 13, heat: 0, tags: ["Light"], text: "Buckwheat noodles in dashi under a golden 'moon' yolk.", src: "/images/bowl-top.png", w: 1000, h: 1000 },
  { id: "grilled-tori", name: "Grilled Tori", kind: "sides", price: 7, text: "Herb-crusted chicken breast, sliced off the grill.", src: "/images/chicken.png", w: 706, h: 398 },
  { id: "ajitama", name: "Ajitama", kind: "sides", price: 2.5, text: "Soy-marinated soft-boiled egg with a molten yolk.", src: "/images/garnish-egg-half.png", w: 786, h: 648 },
  { id: "butter-corn", name: "Butter Corn", kind: "sides", price: 4, text: "Sweet corn on the cob, glossed with miso butter.", src: "/images/garnish-corn.png", w: 800, h: 601 },
  { id: "mushrooms", name: "Mushrooms", kind: "sides", price: 4.5, text: "Button mushrooms seared hot with garlic and soy.", src: "/images/garnish-mushroom.png", w: 800, h: 534 },
  { id: "yuzu-soda", name: "Yuzu Soda", kind: "drinks", price: 4, text: "Sparkling, sharp and citrusy." },
  { id: "iced-matcha", name: "Iced Matcha", kind: "drinks", price: 4.5, text: "Stone-ground, lightly sweetened." },
  { id: "hojicha", name: "Hojicha", kind: "drinks", price: 3, text: "Roasted green tea, hot or iced." },
  { id: "ramune", name: "Ramune", kind: "drinks", price: 3.5, text: "The classic marble-stopper soda." },
];

export const byKind = (kind: Kind) => MENU.filter((i) => i.kind === kind);
