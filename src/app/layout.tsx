// app/layout.tsx
import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";
import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Suspense } from "react";
import Head from "next/head";
import SolanaProvider from "./solanaProvider";

export const metadata: Metadata = {
  title: "Sprout waitlist",
  description: "Book your spot for priority access to Sprout.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="dark">
        <Head>
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense
            fallback={
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-points"></div>
            }
          >
            <main
              className="flex flex-row items-center justify-center min-h-screen pb-2 bg-background antialiased"
              style={{
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "100vw",
                // height: "105vh",
              }}
            >
              <Header />
              <SolanaProvider>
                {children}
              </SolanaProvider>

            </main>
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
