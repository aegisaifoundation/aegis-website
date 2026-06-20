import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "AEGIS | Intelligence Infrastructure",
  description: "Building intelligence through connection. The future of intelligence belongs to connected communities.",
  icons: {
    icon: "/assets/logo.png"
  }
};

export default function RootLayout({
  children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} h-full antialiased scroll-smooth`}
    >
      <body className="min-h-full flex flex-col bg-[#020408] text-white selection:bg-[#4D7CFE]/30 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
