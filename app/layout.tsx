import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "MissionManagerWeb",
  description: "ジャンル・ミッション・タスクの3階層でタスクを管理するWebアプリ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased bg-gray-900 text-gray-100">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
