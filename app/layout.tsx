import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SourceBar } from "@/components/source-bar";
import { meta } from "@/lib/data";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "三甲医院名录",
    template: "%s · 三甲医院名录",
  },
  description: `${meta.publisher}《${meta.comprehensiveTitle}》与《${meta.specialtyTitle}》整理。名录只收三级甲等医院，可按省份、城市和档位筛选。`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <div className="sticky top-0 z-40">
          <SourceBar />
          <SiteHeader />
        </div>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
      </body>
    </html>
  );
}