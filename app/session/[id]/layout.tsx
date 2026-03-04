import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Session — VibePoint",
    description: "Planning poker session",
    robots: { index: false, follow: false },
  };
}

export default function SessionIdLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
