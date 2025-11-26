import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "云端家书 - 把你的牵挂，变成孩子能感受到的温暖",
  description: "一个帮助留守儿童父母表达爱意的AI应用",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
