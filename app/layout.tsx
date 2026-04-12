import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VirtualAudience — AI Marketing Optimizer",
  description: "Optimize any marketing asset with a simulated audience of 30 virtual personas. No A/B testing required.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#0a0a0a] text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
