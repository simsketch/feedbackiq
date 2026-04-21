import type { Metadata } from "next";
import Script from "next/script";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { DM_Sans, IBM_Plex_Mono } from "next/font/google";
import { buildMetadata } from "@/lib/seo";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = buildMetadata({
  title: "User feedback, shipped as code",
  path: "/",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-J3Q5ZW2PGP" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-J3Q5ZW2PGP', { site: location.hostname });
        `}</Script>
      </head>
      <body
        className={`${dmSans.variable} ${plexMono.variable} antialiased noise-bg`}
      >
        <ClerkProvider appearance={{ baseTheme: dark }}>{children}</ClerkProvider>
      </body>
    </html>
  );
}
