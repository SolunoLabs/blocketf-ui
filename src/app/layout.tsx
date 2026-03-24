import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "BlockETF V2",
  description: "Onchain ETF infrastructure for long-term crypto holders",
  icons: {
    icon: "/blocketf-mark-mono.svg",
    shortcut: "/blocketf-mark-mono.svg",
    apple: "/blocketf-mark-mono.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
