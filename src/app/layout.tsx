import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Nav from "../components/Nav";

const serif = Instrument_Serif({
  weight: ["400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-display",
});

const sans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "TRANSLTR — Real-time Speech Translation",
  description: "Speak Tiv. Speak Idoma. Be heard. Real-time speech-to-speech translation built for Benue State.",
  openGraph: {
    title: "TRANSLTR — Real-time Speech Translation",
    description: "Speak Tiv. Speak Idoma. Be heard.",
    images: ["/opengraph.jpg"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
