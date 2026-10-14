"use client";

import { DirectoryFilters, type DirectoryFilters as Filters } from "@/components/directory-filters";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  PROVINCES,
  formatRank,
  formatScore,
  getHospital,
  specialties,
} from "@/lib/data";
import { cn } from "cn";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function SpecialtyBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const requested = searchParams.get("specialty");
  const specialty =
    specialties.find((item) => item.id === requested || item.name === requested) ?? specialties[0];
  const provinceParam = searchParams.get("province") ?? "all";
  const cityParam = searchParams.get("city") ?? "all";
  const province = PROVINCES.some((item) => item.name === provinceParam) ? provinceParam : "all";
  const [sheetOpen, setSheetOpen] = useState(false);

  const cities = useMemo(() => {
    const names = specialty.entries
      .map((entry) => getHospital(entry.hospitalId))
      .filter((hospital) => hospital && (province === "all" || hospital.province === province))
      .map((hospital) => hospital!.city);
    return [...new Set(names)].sort((a, b) => a.localeCompare(b, "zh-CN"));
  }, [province, specialty]);

  const city = cities.includes(cityParam) ? cityParam : "all";

  function write(next: { specialtyId?: string; province?: string; city?: string }) {
    const params = new URLSearchParams();
    const specialtyId = next.specialtyId ?? specialty.id;
    if (specialtyId !== specialties[0].id) params.set("specialty", specialtyId);
    const nextProvince = next.province ?? province;
    const nextCity = next.city ?? city;
    if (nextProvince !== "all") params.set("province", nextProvince);
    if (nextCity !== "all") params.set("city", nextCity);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const rows = specialty.entries
    .map((entry) => ({ entry, hospital: getHospital(entry.hospitalId) }))
    .filter((row) => {
      if (!row.hospital) return false;
      if (province !== "all" && row.hospital.province !== province) return false;
      if (city !== "all" && row.hospital.city !== city) return false;
      return true;
    });

  const filters: Filters = { province, city, tier: "all", type: "all", q: "" };
  const filterProps = {
    filters,
    provinces: PROVINCES.map((item) => item.name),
    cities,
    onChange: (patch: Partial<Filters>) =>
      write({
        province: patch.province ?? province,
        city: patch.city ?? (patch.province ? "all" : city),
      }),
    onReset: () => write({ province: "all", city: "all" }),
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">专科榜</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            2023 年度专科声誉榜覆盖 45 个专科，每个专科公布前十名和平均声誉值。名次保持全国名次，不因地区筛选重排。
          </p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className={buttonVariants({ variant: "outline" }) + " lg:hidden"}>
            <SlidersHorizontal />
            地区
          </SheetTrigger>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>按地区查看</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <DirectoryFilters {...filterProps} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {specialties.map((item) => {
          const selected = item.id === specialty.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => write({ specialtyId: item.id, province, city: "all" })}
              className={cn(
                "rounded-md border px-2 py-2 text-left text-sm",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card hover:bg-accent",
              )}
              aria-pressed={selected}
            >
              {item.name}
            </button>
          );
        })}
      </div>

      <div className="hidden lg:block">
        <DirectoryFilters {...filterProps} />
      </div>

      <section>
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-2xl">{specialty.name}</h2>
          <p className="text-sm text-muted-foreground">
            全国前十 {specialty.entries.length} 家，当前显示 {rows.length} 家
          </p>
        </div>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center">
            <p className="font-medium">这个专科的前十名里，没有位于当前省市的医院</p>
            <Button className="mt-4" variant="outline" onClick={() => write({ province: "all", city: "all" })}>
              查看全国前十
            </Button>
          </div>
        ) : (
          <ol className="divide-y divide-border rounded-lg border border-border bg-card">
            {rows.map(({ entry, hospital }) => (
              <li key={entry.hospitalId} className="grid grid-cols-[4.5rem_1fr] gap-3 px-4 py-3 sm:grid-cols-[5.5rem_1fr_auto]">
                <p className={cn("font-serif text-lg", entry.rank === 1 && "text-primary")}>
                  {formatRank(entry.rank, entry.tied)}
                </p>
                <div>
                  <Link href={`/hospitals/${hospital!.id}`} className="font-medium hover:text-primary">
                    {hospital!.name}
                  </Link>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {hospital!.province} · {hospital!.city}
                  </p>
                </div>
                <p className="col-start-2 text-sm text-muted-foreground sm:col-start-auto sm:text-right">
                  声誉值 {formatScore(entry.score)}
                </p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}