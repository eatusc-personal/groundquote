import type { Metadata } from "next";
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
  "@graph": [
    {
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
    },
    {
      "@type": "FAQPage",
      "@id": `${siteUrl}/#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "What is retrieval-augmented generation?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Retrieval-augmented generation, or RAG, finds relevant passages in a source before creating an answer. Groundquote keeps those passages visible so the answer can be checked.",
          },
        },
        {
          "@type": "Question",
          name: "Does Groundquote store uploaded documents?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Groundquote processes document text for the current request and does not persist documents or questions in its application database. Generated mode sends the question and retrieved passages to the configured model provider.",
          },
        },
        {
          "@type": "Question",
          name: "What happens when the answer is not in the document?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Groundquote returns an explicit not-enough-information response when retrieval cannot find sufficient supporting evidence.",
          },
        },
      ],
    },
  ],
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
      </body>
    </html>
  );
}
