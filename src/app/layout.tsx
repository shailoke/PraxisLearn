import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "PraxisLearn",
  description: "Learn with fun and interactive AI-powered lessons",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] min-h-screen pt-4 pb-12 px-4 sm:px-6`}
      >
        <div className="max-w-5xl mx-auto">
          <header className="mb-8 flex items-center justify-between glass-card px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-xl font-bold shadow-md">
                P
              </div>
              <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Praxis<span className="text-primary">Learn</span></h1>
            </div>
          </header>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
