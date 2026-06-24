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
  metadataBase: new URL("https://aegis.com"),
  title: {
    default: "AEGIS | Intelligence Infrastructure",
    template: "%s | AEGIS"
  },
  description: "Building intelligence through connection. The future of intelligence belongs to connected communities.",
  icons: {
    icon: "/assets/logo.png"
  },
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "AEGIS | Intelligence Infrastructure",
    description: "Building intelligence through connection. The future of intelligence belongs to connected communities.",
    url: "https://aegis.com",
    siteName: "AEGIS AI Foundation",
    images: [
      {
        url: "/assets/logo.png",
        width: 512,
        height: 512,
        alt: "AEGIS Logo"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary",
    title: "AEGIS | Intelligence Infrastructure",
    description: "Building intelligence through connection. The future of intelligence belongs to connected communities.",
    images: ["/assets/logo.png"],
    creator: "@aegis"
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    }
  }
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://aegis.com/#organization",
      "name": "AEGIS AI Foundation",
      "url": "https://aegis.com",
      "logo": "https://aegis.com/assets/logo.png",
      "sameAs": [
        "https://x.com/aegis",
        "https://github.com/aegis",
        "https://linkedin.com/company/aegis"
      ]
    },
    {
      "@type": "WebSite",
      "@id": "https://aegis.com/#website",
      "url": "https://aegis.com",
      "name": "AEGIS AI Foundation",
      "publisher": {
        "@id": "https://aegis.com/#organization"
      }
    }
  ]
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        {children}
      </body>
    </html>
  );
}

