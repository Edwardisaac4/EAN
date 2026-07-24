import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import Footer from "@/components/layout/Footer";
import Preloader from "@/components/layout/Preloader";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-ui",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EAN Aviation",
  description: "EAN Aviation is West Africa's most comprehensive aviation services provider.",
  icons: {
    icon: "/images/ean icon.png",
    shortcut: "/images/ean icon.png",
    apple: "/images/ean icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-ean-navy text-white font-ui select-none">
        <Preloader />
        {children}
        <Footer />
      </body>
    </html>
  );
}

