import type { Metadata } from "next";
import localFont from "next/font/local";
import { Inter, Comic_Neue } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import "./font-styles.css";
import { Providers } from "@/components/providers";
import { FontProvider } from "@/components/FontProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const comicNeue = Comic_Neue({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-comic-sans" });

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
  title: "Free3 Chat",
  description: "Free3 Chat is a feature-rich, multi-provider chat platform with deep user customization and a pixel-perfect interface based on T3 Chat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                const storedFont = localStorage.getItem('app-font');
                let fontFamily = '"Proxima Nova", sans-serif';
                
                if (storedFont === 'inter') {
                  fontFamily = 'Inter, sans-serif';
                } else if (storedFont === 'comic-sans') {
                  fontFamily = '"Comic Sans MS", "Comic Neue", cursive';
                }
                
                document.documentElement.style.setProperty('--app-font', fontFamily);
              } catch (e) {
                console.error('Error setting initial font:', e);
              }
            })();
          `
        }} />
      </head>
      <body
        className={`${proximaNova.variable} ${inter.variable} ${comicNeue.variable} font-sans antialiased`}
        style={{ fontFamily: 'var(--app-font)' }}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <Providers>
            <FontProvider>
              {children}
            </FontProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}