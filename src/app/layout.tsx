import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { LoadingWrapper } from "@/components/LoadingWrapper";
import { NotificationProvider } from "@/components/NotificationProvider";
import { QueryProvider } from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <QueryProvider>
          <LoadingProvider>
            <LoadingWrapper>
              {children}
            </LoadingWrapper>
            <NotificationProvider />
          </LoadingProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
