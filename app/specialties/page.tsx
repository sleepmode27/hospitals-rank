import { SpecialtyBrowser } from "@/components/specialty-browser";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "专科榜",
};

export default function SpecialtiesPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">正在整理专科榜…</p>}>
      <SpecialtyBrowser />
    </Suspense>
  );
}