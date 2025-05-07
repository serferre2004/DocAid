import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: '--font-dm-sans'
});


export const metadata: Metadata = {
  title: "DocAid",
  description: "Facilita tus consultas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={dmSans.className}>
      <body>
        {children}
      </body>
    </html>
  );
}
