import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import {
  DM_Sans,
  IBM_Plex_Mono,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";

const bodyFont = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const displayFont = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const monoFont = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://groundquote.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Groundquote",
  title: {
    default: "Groundquote — citation-backed document answers",
    template: "%s | Groundquote",
  },
  description:
    "Free, open-source RAG document Q&A. Ask a policy, contract, research note, or product document and get a concise answer with visible source evidence—or a safe no-answer.",
  keywords: [
    "RAG",
    "retrieval augmented generation",
    "document question answering",
    "AI citations",
    "grounded AI",
    "document chat",
    "source verification",
    "open source AI",
  ],
  authors: [{ name: "Eric Lai", url: "https://github.com/eatusc" }],
  creator: "Eric Lai",
  publisher: "Groundquote",
  category: "productivity",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    title: "Groundquote — citation-backed document answers",
    description:
      "Ask the text. Check the source. Learn how evidence-first RAG works while you use it.",
    url: "/",
    siteName: "Groundquote",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Groundquote — answers you can trace",
    description:
      "Free document Q&A with visible source evidence and a safe no-answer path.",
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${siteUrl}/#application`,
  name: "Groundquote",
  url: siteUrl,
  description:
    "A free, open-source document question-answering application that returns citation-backed answers or safely says when the source is insufficient.",
  applicationCategory: ["UtilitiesApplication", "EducationalApplication"],
  operatingSystem: "Any modern web browser",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: 0,
    priceCurrency: "USD",
  },
  featureList: [
    "Citation-backed document answers",
    "Visible source passages",
    "Safe no-answer behavior",
    "Hybrid keyword and semantic retrieval",
    "Interactive RAG learning guide",
  ],
  codeRepository: "https://github.com/eatusc/groundquote",
  author: {
    "@type": "Person",
    name: "Eric Lai",
    url: "https://github.com/eatusc",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable}`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
          }}
        />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
