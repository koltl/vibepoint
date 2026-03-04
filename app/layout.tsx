import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { siteUrl } from "@/lib/site-config";

const title = "VibePoint — Scrum Poker & Planning Poker";
const description =
  "Free planning poker (Scrum poker) for agile teams. Real-time story point estimation, no sign-up. Run remote planning poker sessions and estimate together.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  keywords: [
    "scrum poker",
    "planning poker",
    "agile",
    "scrum",
    "planning",
    "story points",
    "estimation",
    "agile estimation",
    "remote planning poker",
    "story point estimation",
    "sprint planning",
  ],
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "VibePoint",
    title,
    description,
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "VibePoint — Planning poker for agile teams" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/opengraph-image"],
  },
  alternates: {
    canonical: siteUrl,
  },
};

function JsonLdScript() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "VibePoint",
    description,
    url: siteUrl,
    applicationCategory: "ProductivityApplication",
    operatingSystem: "Any",
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <JsonLdScript />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
