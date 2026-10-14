"use client";

import { DirectoryFilters, type DirectoryFilters as Filters } from "@/components/directory-filters";
import { TierBadge } from "@/components/tier-badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  HOSPITAL_TYPES,
  PROVINCES,
  TIERS,
  compareHospitals,
  hospitals,
  type Hospital,
  type Tier,
} from "@/lib/data";
import { buttonVariants } from "@/components/ui/button";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

const EMPTY: Filters = { province: "all", city: "all", tier: "all", type: "all", q: "" };

function readFilters(params: URLSearchParams): Filters {
  const province = params.get("province") ?? "all";
  const city = params.get("city") ?? "all";
  const tier = params.get("tier") ?? "all";
  const type = params.get("type") ?? "all";
  const q = params.get("q") ?? "";
  return {
    province: PROVINCES.some((item) => item.name === province) ? province : "all",
    city,
    tier: tier === "none" || TIERS.includes(tier as Tier) ? tier : "all",
    type: HOSPITAL_TYPES.includes(type as (typeof HOSPITAL_TYPES)[number]) ? type : "all",
    q,
  };
}

export function HospitalBrowser() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const filters = readFilters(searchParams);
  const [sheetOpen, setSheetOpen] = useState(false);

  const cities = useMemo(() => {
    const pool =
      filters.province === "all"
        ? hospitals
        : hospitals.filter((hospital) => hospital.province === filters.province);
    return [...new Set(pool.map((hospital) => hospital.city))].sort((a, b) =>
      a.localeCompare(b, "zh-CN"),
    );
  }, [filters.province]);

  const city = cities.includes(filters.city) ? filters.city : "all";

  function write(next: Filters) {
    const params = new URLSearchParams();
    if (next.province !== "all") params.set("province", next.province);
    if (next.city !== "all") params.set("city", next.city);
    if (next.tier !== "all") params.set("tier", next.tier);
    if (next.type !== "all") params.set("type", next.type);
    if (next.q.trim()) params.set("q", next.q);
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  function update(patch: Partial<Filters>) {
    write({ ...filters, city, ...patch });
  }

  const matched = hospitals
    .filter((hospital) => {
      if (filters.province !== "all" && hospital.province !== filters.province) return false;
      if (city !== "all" && hospital.city !== city) return false;
      if (filters.tier === "none" && hospital.tier) return false;
      if (filters.tier !== "all" && filters.tier !== "none" && hospital.tier !== filters.tier) {
        return false;
      }
      if (filters.type !== "all" && hospital.type !== filters.type) return false;
      if (filters.q.trim() && !hospital.name.includes(filters.q.trim())) return false;
      return true;
    })
    .sort(compareHospitals);

  const groups = [
    ...TIERS.map((tier) => ({
      key: tier,
      title: tier,
      note: "同等级不分先后",
      items: matched.filter((hospital) => hospital.tier === tier),
    })),
    {
      key: "none",
      title: "未进入综合榜",
      note: "这些是三甲医院，没有进入 2023 年度综合榜。这里不编造名次。",
      items: matched.filter((hospital) => !hospital.tier),
    },
  ].filter((group) => group.items.length > 0);

  const filterProps = {
    filters: { ...filters, city },
    provinces: PROVINCES.map((item) => item.name),
    cities,
    showTier: true,
    showType: true,
    showQuery: true,
    onChange: update,
    onReset: () => write(EMPTY),
  };

  return (
    <div className="grid gap-6">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-semibold">综合榜</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            2023 年度复旦综合榜把前 100 家医院分成五档，每档 20 家。未上榜的三甲医院单列在最后。
          </p>
        </div>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className={buttonVariants({ variant: "outline" }) + " lg:hidden"}>
            <SlidersHorizontal />
            筛选
          </SheetTrigger>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>筛选医院</SheetTitle>
            </SheetHeader>
            <div className="px-4 pb-6">
              <DirectoryFilters {...filterProps} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="hidden lg:block">
        <DirectoryFilters {...filterProps} />
      </div>

      <p className="text-sm text-muted-foreground">显示 {matched.length} 家</p>

      {matched.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border bg-card px-4 py-10 text-center">
          <p className="font-medium">没有符合条件的医院</p>
          <p className="mt-1 text-sm text-muted-foreground">可以放宽省份、城市、档位或医院名称。</p>
          <Button className="mt-4" variant="outline" onClick={() => write(EMPTY)}>
            清除筛选
          </Button>
        </div>
      ) : (
        <div className="grid gap-8">
          {groups.map((group) => (
            <section key={group.key}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b border-border pb-2">
                <h2 className="font-serif text-xl">{group.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {group.items.length} 家 · {group.note}
                </p>
              </div>
              <ul className="divide-y divide-border">
                {group.items.map((hospital) => (
                  <HospitalRow key={hospital.id} hospital={hospital} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function HospitalRow({ hospital }: { hospital: Hospital }) {
  return (
    <li className="flex items-start justify-between gap-3 py-3">
      <div>
        <Link href={`/hospitals/${hospital.id}`} className="font-medium hover:text-primary">
          {hospital.name}
        </Link>
        <p className="mt-1 text-sm text-muted-foreground">
          {hospital.province} · {hospital.city} · {hospital.type}
        </p>
      </div>
      <TierBadge tier={hospital.tier} />
    </li>
  );
}