import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, Share_Tech_Mono, Zen_Dots } from "next/font/google";
import "./globals.css";

const headingFont = Fraunces({
  variable: "--font-heading",
  subsets: ["latin"],
});

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const shareTechMono = Share_Tech_Mono({
  variable: "--font-share-tech-mono",
  subsets: ["latin"],
  weight: "400",
});

const zenDots = Zen_Dots({
  variable: "--font-zen-dots",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "SIC Wiki",
  description: "複雑な学習内容を、道筋つきで学べるコース型 Wiki",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body
        className={`${headingFont.variable} ${bodyFont.variable} ${shareTechMono.variable} ${zenDots.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
