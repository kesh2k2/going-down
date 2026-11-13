import type { Metadata } from "next";
import { Geist, Geist_Mono, Cinzel } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Added an attractive, elegant classic font for VALINOR
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-cinzel",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VALINOR..✨་༘࿐",
  description: "A Night Where Legends Say Goodbye !",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${cinzel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
