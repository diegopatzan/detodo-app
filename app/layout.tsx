import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "China detodo Admin",
  description: "Dashboard administrativo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 h-screen overflow-hidden flex flex-col`}>
        {/* Navbar */}
        <div className="w-full flex-shrink-0 z-50">
          <Navbar />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
          {/* Page Content */}
          <main className="flex-1 overflow-auto bg-[#f8f8fa]">
            <div className="container mx-auto p-4 max-w-full">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
