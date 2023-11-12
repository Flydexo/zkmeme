import type {Metadata} from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "next-themes";
import clsx from "clsx";

const inter = Inter({subsets: ["latin"]});

export const metadata: Metadata = {
  title: "ZKMeme",
  description:
    "A meme is a thousand images, a ZKMeme is 2**251+17*2192+1 memes",
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={clsx(inter.className, "dark")}>{children}</body>
    </html>
  );
}
