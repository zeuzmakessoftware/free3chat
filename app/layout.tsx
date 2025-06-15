import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Providers } from "@/components/providers";

const proximaNova = localFont({
  src: [
    {
      path: "../public/Proxima-Nova-Font/Proxima Nova Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/Proxima-Nova-Font/Proxima Nova Bold.otf",
      weight: "700",
      style: "bold",
    },
    {
      path: "../public/Proxima-Nova-Font/Proxima Nova Thin.otf",
      weight: "100",
      style: "thin",
    },
    {
      path: "../public/Proxima-Nova-Font/Proxima Nova Semibold.otf",
      weight: "600",
      style: "semibold",
    },
  ],
  variable: "--font-proxima-nova",
});

export const metadata: Metadata = {
  title: "Open Source T3.chat",
  description: "Open Source T3.chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${proximaNova.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
