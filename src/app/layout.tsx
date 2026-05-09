import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Nav from "../components/Nav";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "TRANSLTR — Real-time Speech Translation",
  description: "Speak Tiv, Idoma, and English — translated in real time. Built for Benue State.",
  openGraph: {
    title: "TRANSLTR",
    description: "Real-time speech translation for Benue State.",
    images: ["/opengraph.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
