import { HospitalBrowser } from "@/components/hospital-browser";
import type { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "综合榜",
};

export default function HospitalsPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground">正在整理综合榜…</p>}>
      <HospitalBrowser />
    </Suspense>
  );
}