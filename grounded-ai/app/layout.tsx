
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GroundedAI",
  description: "Get answers backed by your company documents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
