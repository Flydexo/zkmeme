import type {Metadata, Viewport} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import clsx from "clsx";
import {Analytics} from "@vercel/analytics/react";
import {Header} from "@/components/panels/Header";
import {StarknetProvider} from "@/components/providers/starknet";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  metadataBase: new URL("https://zkmeme.vercel.app"),
  title: "ZKMeme",
  description:
    "A meme is a thousand images, a ZKMeme is 2**251+17*2192+1 memes",
  twitter: {
    site: "@flydex0",
    creator: "@flydex0",
    images: [
      {
        url: "/og.png",
        width: 800,
        height: 600,
        alt: "ZKMeme logo",
        type: "summary",
      },
    ],
    title: "A meme is a thousand images, a ZKMeme is 2**251+17*2192+1 memes",
    description:
      "A meme is a thousand images, a ZKMeme is 2**251+17*2192+1 memes",
  },
  openGraph: {
    url: "https://zkmeme.vercel.app",
    title: "ZKMeme",
    description:
      "A meme is a thousand images, a ZKMeme is 2**251+17*2192+1 memes",
    images: [{url: "/og.png", width: 800, height: 600, alt: "ZKMeme logo"}],
  },
  alternates: {
    canonical: "https://zkmeme.vercel.app",
  },
};

export const viewport: Viewport = {
  themeColor: "#e11d48",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="google-site-verification"
          content="HCM_UD_LHMCyEDEDGI2qHSEtu64847pQ8Pb4m0Xm2ac"
        />
      </head>
      <StarknetProvider>
        <body className={clsx(inter.className, "dark")}>
          <Header />
          {children}
        </body>
      </StarknetProvider>
      <Analytics />
    </html>
  );
}
