import type { Metadata } from "next";
import "./globals.css";
import Nav from "../components/Nav";

export const metadata: Metadata = {
  title: "TRANSLTR — Real-time Speech Translation",
  description:
    "Real-time speech-to-speech translation between English, Tiv, and Idoma. No API key, no uploads — powered entirely by your browser.",
  openGraph: {
    title: "TRANSLTR — Real-time Speech Translation",
    description:
      "Speak English, hear it in Tiv or Idoma instantly. Two-way conversation mode, projector view, and a full translation dashboard.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TRANSLTR — Real-time Speech Translation",
    description:
      "Browser-native speech translation for English, Tiv, and Idoma. No API keys required.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
