import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Motiva Physio",
  description:
    "Motiva Physio: a concept for a physiotherapy clinic website in Colombo, built around where it hurts.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
