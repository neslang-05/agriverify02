import type { Metadata } from "next";
import { Inter, Noto_Sans_Meetei_Mayek } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const meeteiMayek = Noto_Sans_Meetei_Mayek({
  variable: "--font-meetei-mayek",
  subsets: ["latin"], // Noto Sans Meetei Mayek weights and subsets
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "AgriVerify - AI-Based Fake Seed & Fertilizer Detection",
  description: "Protect your crops from counterfeit agricultural products with AI-powered verification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${meeteiMayek.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
