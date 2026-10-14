import { ChinaMap } from "@/components/china-map";
import { TierBadge } from "@/components/tier-badge";
import { meta, provinceSummaries } from "@/lib/data";
import Link from "next/link";

export default function HomePage() {
  const summaries = provinceSummaries().sort((a, b) => b.count - a.count || a.province.localeCompare(b.province, "zh-CN"));

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold sm:text-4xl">按省查看三甲医院</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          地图上的颜色表示本站收录数量。点一个省，可以看到该省三甲医院，并按城市、复旦综合档位继续筛选。
          香港、澳门、台湾不在本榜收录范围。
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="overflow-hidden rounded-xl border border-border bg-card">
          <ChinaMap summaries={provinceSummaries()} />
          <p className="border-t border-border px-4 py-3 text-xs leading-relaxed text-muted-foreground">
            代表医院按进入专科声誉前十的次数选取，次数相同再看综合档。这不是综合榜名次。
            {meta.coverageNote}
          </p>
        </section>

        <aside className="rounded-xl border border-border bg-card">
          <h2 className="border-b border-border px-4 py-3 font-serif text-lg">省份缩略</h2>
          <ul className="max-h-[640px] divide-y divide-border overflow-y-auto">
            {summaries.map((item) => (
              <li key={item.province}>
                <Link
                  href={`/hospitals?province=${encodeURIComponent(item.province)}`}
                  className="grid gap-1 px-4 py-3 hover:bg-accent"
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium">{item.province}</span>
                    <span className="text-xs text-muted-foreground">{item.count} 家</span>
                  </span>
                  <span className="text-xs leading-relaxed text-muted-foreground">
                    综合榜 {item.ranked} 家
                    {item.topTier ? ` · 最高 ${item.topTier}` : " · 综合榜未上榜"}
                  </span>
                  {item.representative ? (
                    <span className="truncate text-xs text-foreground">{item.representative}</span>
                  ) : (
                    <TierBadge tier={null} />
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}