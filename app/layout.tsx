import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "PromoterLab AI", template: "%s | PromoterLab AI" },
  description: "Secure, high-precision E. coli DNA promoter sequence prediction.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`h-full ${inter.variable} ${jetbrainsMono.variable}`}>
        <body className="min-h-full font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
