import hospitalsData from "@/data/hospitals.json";
import metaData from "@/data/meta.json";
import specialtiesData from "@/data/specialties.json";

export const TIERS = ["A++++", "A+++", "A++", "A+", "A"] as const;
export type Tier = (typeof TIERS)[number];

export const HOSPITAL_TYPES = ["综合", "专科", "中医", "妇幼儿童"] as const;
export type HospitalType = (typeof HOSPITAL_TYPES)[number];

export type Region =
  | "华北"
  | "东北"
  | "华东"
  | "华中"
  | "华南"
  | "西南"
  | "西北";

export type Hospital = {
  id: string;
  name: string;
  province: string;
  city: string;
  region: Region;
  type: HospitalType;
  tier: Tier | null;
  tierOrder: number | null;
};

export type SpecialtyEntry = {
  hospitalId: string;
  score: number;
  rank: number;
  tied: boolean;
};

export type Specialty = {
  id: string;
  name: string;
  entries: SpecialtyEntry[];
};

export const hospitals = hospitalsData as Hospital[];
export const specialties = specialtiesData as Specialty[];
export const meta = metaData;

export const REGION_ORDER: Region[] = [
  "华北",
  "东北",
  "华东",
  "华中",
  "华南",
  "西南",
  "西北",
];

export const PROVINCES: { name: string; geoName: string; region: Region }[] = [
  { name: "北京", geoName: "北京市", region: "华北" },
  { name: "天津", geoName: "天津市", region: "华北" },
  { name: "河北", geoName: "河北省", region: "华北" },
  { name: "山西", geoName: "山西省", region: "华北" },
  { name: "内蒙古", geoName: "内蒙古自治区", region: "华北" },
  { name: "辽宁", geoName: "辽宁省", region: "东北" },
  { name: "吉林", geoName: "吉林省", region: "东北" },
  { name: "黑龙江", geoName: "黑龙江省", region: "东北" },
  { name: "上海", geoName: "上海市", region: "华东" },
  { name: "江苏", geoName: "江苏省", region: "华东" },
  { name: "浙江", geoName: "浙江省", region: "华东" },
  { name: "安徽", geoName: "安徽省", region: "华东" },
  { name: "福建", geoName: "福建省", region: "华东" },
  { name: "江西", geoName: "江西省", region: "华东" },
  { name: "山东", geoName: "山东省", region: "华东" },
  { name: "河南", geoName: "河南省", region: "华中" },
  { name: "湖北", geoName: "湖北省", region: "华中" },
  { name: "湖南", geoName: "湖南省", region: "华中" },
  { name: "广东", geoName: "广东省", region: "华南" },
  { name: "广西", geoName: "广西壮族自治区", region: "华南" },
  { name: "海南", geoName: "海南省", region: "华南" },
  { name: "重庆", geoName: "重庆市", region: "西南" },
  { name: "四川", geoName: "四川省", region: "西南" },
  { name: "贵州", geoName: "贵州省", region: "西南" },
  { name: "云南", geoName: "云南省", region: "西南" },
  { name: "西藏", geoName: "西藏自治区", region: "西南" },
  { name: "陕西", geoName: "陕西省", region: "西北" },
  { name: "甘肃", geoName: "甘肃省", region: "西北" },
  { name: "青海", geoName: "青海省", region: "西北" },
  { name: "宁夏", geoName: "宁夏回族自治区", region: "西北" },
  { name: "新疆", geoName: "新疆维吾尔自治区", region: "西北" },
];

const TIER_WEIGHT: Record<Tier, number> = {
  "A++++": 5,
  "A+++": 4,
  "A++": 3,
  "A+": 2,
  A: 1,
};

const hospitalById = new Map(hospitals.map((hospital) => [hospital.id, hospital]));

export function getHospital(id: string) {
  return hospitalById.get(id);
}

export function formatScore(score: number) {
  return score.toFixed(3);
}

export function formatRank(rank: number, tied: boolean) {
  return tied ? `并列 ${rank}` : String(rank);
}

export function tierLabel(tier: Tier | null) {
  return tier ?? "未进入综合榜";
}

export type SpecialtyHit = {
  specialty: Specialty;
  entry: SpecialtyEntry;
};

export function specialtyHits(hospitalId: string): SpecialtyHit[] {
  const hits: SpecialtyHit[] = [];
  for (const specialty of specialties) {
    for (const entry of specialty.entries) {
      if (entry.hospitalId === hospitalId) hits.push({ specialty, entry });
    }
  }
  hits.sort(
    (a, b) =>
      a.entry.rank - b.entry.rank ||
      a.specialty.name.localeCompare(b.specialty.name, "zh-CN"),
  );
  return hits;
}

const specialtyHitCount = new Map<string, number>();
for (const specialty of specialties) {
  for (const entry of specialty.entries) {
    specialtyHitCount.set(
      entry.hospitalId,
      (specialtyHitCount.get(entry.hospitalId) ?? 0) + 1,
    );
  }
}

export type ProvinceSummary = {
  province: string;
  geoName: string;
  region: Region;
  count: number;
  ranked: number;
  topTier: Tier | null;
  representative: string | null;
  representativeId: string | null;
};

export function provinceSummaries(): ProvinceSummary[] {
  return PROVINCES.map((province) => {
    const list = hospitals.filter((hospital) => hospital.province === province.name);
    const ranked = list.filter((hospital) => hospital.tier);
    const topTier = ranked.reduce<Tier | null>((best, hospital) => {
      if (!hospital.tier) return best;
      if (!best || TIER_WEIGHT[hospital.tier] > TIER_WEIGHT[best]) return hospital.tier;
      return best;
    }, null);
    const representative = [...list].sort((a, b) => {
      const byHits =
        (specialtyHitCount.get(b.id) ?? 0) - (specialtyHitCount.get(a.id) ?? 0);
      if (byHits) return byHits;
      const byTier = (b.tier ? TIER_WEIGHT[b.tier] : 0) - (a.tier ? TIER_WEIGHT[a.tier] : 0);
      if (byTier) return byTier;
      return (a.tierOrder ?? 999) - (b.tierOrder ?? 999);
    })[0];
    return {
      province: province.name,
      geoName: province.geoName,
      region: province.region,
      count: list.length,
      ranked: ranked.length,
      topTier,
      representative: representative?.name ?? null,
      representativeId: representative?.id ?? null,
    };
  });
}

export function compareHospitals(a: Hospital, b: Hospital) {
  if (a.tier && b.tier) return (a.tierOrder ?? 0) - (b.tierOrder ?? 0);
  if (a.tier) return -1;
  if (b.tier) return 1;
  const regionDelta = REGION_ORDER.indexOf(a.region) - REGION_ORDER.indexOf(b.region);
  if (regionDelta) return regionDelta;
  const provinceDelta = a.province.localeCompare(b.province, "zh-CN");
  if (provinceDelta) return provinceDelta;
  return a.name.localeCompare(b.name, "zh-CN");
}
