import { hospitals, meta } from "@/lib/data";

function formatPublishedOn(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function SourceBar() {
  return (
    <div className="bg-primary px-4 py-2 text-xs leading-relaxed text-primary-foreground sm:text-sm">
      <p className="mx-auto max-w-6xl">
        数据来源：{meta.publisher}《{meta.comprehensiveTitle}》《{meta.specialtyTitle}》，
        {formatPublishedOn(meta.publishedOn)}发布。全国三级甲等医院{" "}
        {meta.nationalGradeACount.toLocaleString("zh-CN")} 家（{meta.nationalCountYear}），引自
        {meta.nationalCountSource}。本站收录 {hospitals.length} 家，为公开资料整理稿，不是卫健委实时全量名录。
        {meta.sameTierNote}
      </p>
    </div>
  );
}
