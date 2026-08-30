export const company = {
  name: "Pak Multilinks Hygiene",
  subtitle: "Corporate Supplies",
  tagline: "Your Hygiene Partner",
  contactPerson: "Zohair Ahmed",
  designation: "Founder & Sales Head",
  phone: "+92 300 6917 385",
  phoneHref: "+923006917385",
  email: "zohair.shah8@gmail.com",
  address: "Shop No LG-9, Rehman Tower Main Market Gulberg II, Lahore",
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/\D/g, "") || "",
  currency: "PKR",
};

export const contacts = [
  {
    name: "Zohair Ahmed",
    designation: "Founder & Sales Head",
    primary: true,
    phones: [
      { label: "+92 300 6917 385", href: "+923006917385" },
      { label: "+92 312 1091 848", href: "+923121091848" },
    ],
    email: "zohair.shah8@gmail.com",
  },
  {
    name: "M. Bilal Shah",
    designation: "CEO",
    primary: false,
    phones: [{ label: "0325 8166829", href: "+923258166829" }],
    email: "bilalshah2237463@gmail.com",
  },
] as const;
