import type { Metadata } from "next";
import "./globals.css";
import { TimelineProvider } from "@/lib/store";

export const metadata: Metadata = {
  title: "ohm",
  description: "Turn raw life data into legible identity",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <TimelineProvider>{children}</TimelineProvider>
      </body>
    </html>
  );
}
