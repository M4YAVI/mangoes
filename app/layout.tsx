import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const telugu = localFont({
  src: "./fonts/mandali-bold.otf",
  variable: "--font-telugu",
});

export const metadata: Metadata = {
  title: "Palla Mamidi - The taste of royalty... Naturally...",
  description: "From our village to your home... Pure as nature. Farm fresh, 100% natural mangoes.",
};

import CartDrawer from "./components/CartDrawer";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${telugu.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
        <CartDrawer />
      </body>
    </html>
  );
}
