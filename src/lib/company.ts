export const company = {
  name: "Pak Multilinks Hygiene",
  subtitle: "Corporate Supplies",
  tagline: "Your Hygiene Partner",
  contactPerson: "Zohair Ahmed",
  designation: "Founder & Sales Head",
  phone: "+92 317 1678 829",
  phoneHref: "+923171678829",
  email: "zohair.shah8@gmail.com",
  address: "Shop No LG-9, Rehman Tower Main Market Gulberg II, Lahore",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "923171678829",
  facebookUrl: process.env.NEXT_PUBLIC_FACEBOOK_URL || "https://www.facebook.com/pakmultilinks",
  currency: "PKR",
};

export const contacts = [
  {
    name: "Zohair Ahmed",
    designation: "Founder & Sales Head",
    primary: false,
    phones: [
      { label: "+92 317 1678 829", href: "+923171678829" },
      { label: "+92 312 1091 848", href: "+923121091848" },
    ],
    email: "zohair.shah8@gmail.com",
  },
  {
    name: "M. Bilal Shah",
    designation: "CEO",
    primary: true,
    phones: [{ label: "0317 1678829", href: "+923171678829" }],
    email: "bilalshah2237463@gmail.com",
  },
] as const;
