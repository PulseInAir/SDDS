import type { Metadata } from "next";
import { Outfit, Geist_Mono } from "next/font/google";
import "@/ui/styles/globals.css";
import { createClient } from "@/utils/supabase/server";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SDDS Portal - ITR Practice Management System",
  description: "Private Income Tax Return practice management and client follow-up system for Single Digit Data Solutions.",
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  let theme = "dark";
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("system_settings")
      .select("value")
      .eq("key", "theme_preference")
      .maybeSingle();
    if (data?.value) {
      theme = data.value;
    }
  } catch (e) {
    // Ignore error and default to dark
  }

  return (
    <html lang="en" data-theme={theme}>
      <body className={outfit.className}>
        {children}
      </body>
    </html>
  );
}
