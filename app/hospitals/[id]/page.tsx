import { TierBadge } from "@/components/tier-badge";
import { Badge } from "@/components/ui/badge";
import {
  formatRank,
  formatScore,
  getHospital,
  hospitals,
  specialtyHits,
  tierLabel,
} from "@/lib/data";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return hospitals.map((hospital) => ({ id: hospital.id }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const hospital = getHospital(id);
  return { title: hospital?.name ?? "未找到医院" };
}

export default async function HospitalPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const hospital = getHospital(id);
  if (!hospital) notFound();
  const hits = specialtyHits(hospital.id);

  return (
    <article className="grid gap-8">
      <div>
        <Link
          href={`/hospitals?province=${encodeURIComponent(hospital.province)}`}
          className="text-sm text-muted-foreground hover:text-primary"
        >
          返回{hospital.province}综合榜
        </Link>
        <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-4xl">{hospital.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {hospital.region} · {hospital.province} · {hospital.city}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>三级甲等</Badge>
          <TierBadge tier={hospital.tier} />
          <Badge variant="outline">{hospital.type}</Badge>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {hospital.tier
            ? `2023 年度综合榜档位为 ${tierLabel(hospital.tier)}。同等级医院不分先后。`
            : "未进入 2023 年度综合榜。本页不编造综合名次。"}
        </p>
      </div>

      <section>
        <h2 className="font-serif text-2xl">专科声誉前十</h2>
        {hits.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-border bg-card px-4 py-8 text-sm text-muted-foreground">
            未进入 2023 年度专科声誉榜前十。
          </p>
        ) : (
          <ul className="mt-3 divide-y divide-border rounded-lg border border-border bg-card">
            {hits.map(({ specialty, entry }) => (
              <li key={specialty.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <Link
                  href={`/specialties?specialty=${specialty.id}`}
                  className="font-medium hover:text-primary"
                >
                  {specialty.name}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {formatRank(entry.rank, entry.tied)} · 声誉值 {formatScore(entry.score)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  );
}