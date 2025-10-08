import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FoodieMatch - Discover Your Perfect Food Match",
  description: "Swipe through delicious dishes tailored to your dietary preferences, allergies, and taste. Find your next favorite meal with AI-powered recommendations.",
  keywords: ["FoodieMatch", "food dating", "restaurant discovery", "dietary preferences", "food recommendations", "AI", "Next.js", "TypeScript"],
  authors: [{ name: "FoodieMatch Team" }],
  openGraph: {
    title: "FoodieMatch - Discover Your Perfect Food Match",
    description: "Swipe through delicious dishes tailored to your dietary preferences and taste.",
    url: "https://foodiematch.app",
    siteName: "FoodieMatch",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FoodieMatch - Discover Your Perfect Food Match",
    description: "Swipe through delicious dishes tailored to your dietary preferences and taste.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
