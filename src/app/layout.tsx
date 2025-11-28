import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { defaultMetadata } from "@/lib/seo";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { LoadingWrapper } from "@/components/shared/LoadingWrapper";
import { NotificationProvider as ToastNotificationProvider } from "@/components/shared/NotificationProvider";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { UserStatusProvider } from "@/providers/UserStatusProvider";
import { WhatsAppFloatButton } from "@/components/shared/WhatsAppFloatButton";

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
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased overflow-x-hidden`}
        suppressHydrationWarning={true}
      >
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7249639965881490"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <QueryProvider>
          <LoadingProvider>
            <UserStatusProvider>
            <NotificationsProvider>
              <LoadingWrapper>
                {children}
              </LoadingWrapper>
              <ToastNotificationProvider />
              <WhatsAppFloatButton />
            </NotificationsProvider>
            </UserStatusProvider>
          </LoadingProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
