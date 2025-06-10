import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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
      style: "normal",
    },
    {
      path: "../public/Proxima-Nova-Font/Proxima Nova Thin.otf",
      weight: "100",
      style: "normal",
    },
    {
      path: "../public/Proxima-Nova-Font/Proxima Nova Semibold.otf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-proxima-nova",
});

export const metadata: Metadata = {
  title: "Open T3.chat",
  description: "Open T3.chat",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${proximaNova.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
