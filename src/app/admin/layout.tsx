import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administration | Pak Multilinks Hygiene",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
