import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finvisor — AI Financial Aid Advisor",
  description: "AI-powered financial aid appeal platform. Get personalized advice, document analysis, and automated submission support.",
  keywords: ["financial aid", "college", "appeal", "AI advisor", "scholarship"],
  authors: [{ name: "Finvisor Team" }],
  openGraph: {
    title: "Finvisor — AI Financial Aid Advisor",
    description: "Build the strongest possible financial aid appeal with AI assistance",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
