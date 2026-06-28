import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "sonner";
import { LanguageProvider } from "@/lib/LanguageContext";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ፍኖተ ቅዱስ ያሬድ አብነት ት/ቤት - Student Management System",
  description: "Comprehensive student management system",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <ProtectedRoute>
            {children}
          </ProtectedRoute>
          <Toaster position="top-right" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}
