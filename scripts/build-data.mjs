import fs from "fs";
import path from "path";

const sourcePath =
  process.env.RANKING_SOURCE ??
  "/home/ubuntu/.cursor/projects/workspace/agent-tools/74a26fb1-3c6f-458f-a7ad-fbc45e09f9e4.txt";

const REGION_BY_PROVINCE = {
  北京: "华北",
  天津: "华北",
  河北: "华北",
  山西: "华北",
  内蒙古: "华北",
  辽宁: "东北",
  吉林: "东北",
  黑龙江: "东北",
  上海: "华东",
  江苏: "华东",
  浙江: "华东",
  安徽: "华东",
  福建: "华东",
  江西: "华东",
  山东: "华东",
  河南: "华中",
  湖北: "华中",
  湖南: "华中",
  广东: "华南",
  广西: "华南",
  海南: "华南",
  重庆: "西南",
  四川: "西南",
  贵州: "西南",
  云南: "西南",
  西藏: "西南",
  陕西: "西北",
  甘肃: "西北",
  青海: "西北",
  宁夏: "西北",
  新疆: "西北",
};

const SPECIALTY_ORDER = [
  "病理科",
  "传染感染科",
  "耳鼻喉科",
  "放射科",
  "呼吸科",
  "风湿科",
  "妇产科",
  "骨科",
  "精神医学",
  "口腔科",
  "麻醉科",
  "泌尿外科",
  "内分泌科",
  "皮肤科",
  "普通外科",
  "神经内科",
  "神经外科",
  "肾脏病",
  "消化科",
  "小儿内科",
  "小儿外科",
  "心血管病",
  "心外科",
  "胸外科",
  "血液科",
  "眼科",
  "整形外科",
  "肿瘤学",
  "老年医学",
  "康复医学",
  "检验医学",
  "烧伤科",
  "核医学",
  "超声医学",
  "急诊医学",
  "重症医学",
  "临床药学",
  "生殖医学",
  "变态反应",
  "健康管理",
  "结核病",
  "全科医学",
  "疼痛学",
  "运动医学",
  "罕见病",
];

const A_PLUS_PLUS_PLUS_PLUS = [
  "中国人民解放军总医院",
  "中国医学科学院北京协和医院",
  "北京大学第一医院",
  "北京大学第三医院",
  "中国医科大学附属第一医院",
  "上海交通大学医学院附属仁济医院",
  "上海交通大学医学院附属瑞金医院",
  "复旦大学附属中山医院",
  "复旦大学附属华山医院",
  "浙江大学医学院附属第一医院",
  "浙江大学医学院附属第二医院",
  "郑州大学第一附属医院",
  "华中科技大学同济医学院附属协和医院",
  "华中科技大学同济医学院附属同济医院",
  "中南大学湘雅二医院",
  "中南大学湘雅医院",
  "中山大学附属第一医院",
  "南方医科大学南方医院",
  "四川大学华西医院",
  "空军军医大学第一附属医院（西京医院）",
];

/** @type {Record<string, [string, string]>} */
const PLACE = {
  "中国人民解放军总医院": ["北京", "北京"],
  "中国医学科学院北京协和医院": ["北京", "北京"],
  "北京大学第一医院": ["北京", "北京"],
  "北京大学第三医院": ["北京", "北京"],
  "中国医科大学附属第一医院": ["辽宁", "沈阳"],
  "上海交通大学医学院附属仁济医院": ["上海", "上海"],
  "上海交通大学医学院附属瑞金医院": ["上海", "上海"],
  "复旦大学附属中山医院": ["上海", "上海"],
  "复旦大学附属华山医院": ["上海", "上海"],
  "浙江大学医学院附属第一医院": ["浙江", "杭州"],
  "浙江大学医学院附属第二医院": ["浙江", "杭州"],
  "郑州大学第一附属医院": ["河南", "郑州"],
  "华中科技大学同济医学院附属协和医院": ["湖北", "武汉"],
  "华中科技大学同济医学院附属同济医院": ["湖北", "武汉"],
  "中南大学湘雅二医院": ["湖南", "长沙"],
  "中南大学湘雅医院": ["湖南", "长沙"],
  "中山大学附属第一医院": ["广东", "广州"],
  "南方医科大学南方医院": ["广东", "广州"],
  "四川大学华西医院": ["四川", "成都"],
  "空军军医大学第一附属医院（西京医院）": ["陕西", "西安"],
  "中日友好医院": ["北京", "北京"],
  "中国医学科学院阜外医院": ["北京", "北京"],
  "中国医学科学院肿瘤医院": ["北京", "北京"],
  "北京大学人民医院": ["北京", "北京"],
  "首都医科大学附属北京儿童医院": ["北京", "北京"],
  "首都医科大学附属北京天坛医院": ["北京", "北京"],
  "首都医科大学附属北京同仁医院": ["北京", "北京"],
  "上海市第六人民医院": ["上海", "上海"],
  "上海交通大学医学院附属第九人民医院": ["上海", "上海"],
  "复旦大学附属儿科医院": ["上海", "上海"],
  "复旦大学附属肿瘤医院": ["上海", "上海"],
  "海军军医大学第一附属医院": ["上海", "上海"],
  "江苏省人民医院（南京医科大学第一附属医院）": ["江苏", "南京"],
  "南京大学医学院附属鼓楼医院": ["江苏", "南京"],
  "山东大学齐鲁医院": ["山东", "济南"],
  "广东省人民医院": ["广东", "广州"],
  "广州医科大学附属第一医院": ["广东", "广州"],
  "中山大学肿瘤防治中心": ["广东", "广州"],
  "陆军军医大学第一附属医院": ["重庆", "重庆"],
  "四川省人民医院": ["四川", "成都"],
  "北京积水潭医院": ["北京", "北京"],
  "首都医科大学附属北京安贞医院": ["北京", "北京"],
  "首都医科大学宣武医院": ["北京", "北京"],
  "中国医科大学附属盛京医院": ["辽宁", "沈阳"],
  "上海市肺科医院": ["上海", "上海"],
  "上海交通大学医学院附属新华医院": ["上海", "上海"],
  "复旦大学附属眼耳鼻喉科医院": ["上海", "上海"],
  "中国人民解放军东部战区总医院": ["江苏", "南京"],
  "东南大学附属中大医院": ["江苏", "南京"],
  "苏州大学附属第一医院": ["江苏", "苏州"],
  "浙江大学医学院附属邵逸夫医院": ["浙江", "杭州"],
  "福建医科大学附属第一医院": ["福建", "福州"],
  "南昌大学第一附属医院": ["江西", "南昌"],
  "山东第一医科大学附属省立医院（山东省立医院）": ["山东", "济南"],
  "青岛大学附属医院": ["山东", "青岛"],
  "武汉大学人民医院": ["湖北", "武汉"],
  "武汉大学中南医院": ["湖北", "武汉"],
  "中山大学附属第三医院": ["广东", "广州"],
  "重庆医科大学附属第一医院": ["重庆", "重庆"],
  "四川大学华西口腔医院": ["四川", "成都"],
  "北京大学口腔医院": ["北京", "北京"],
  "北京大学肿瘤医院": ["北京", "北京"],
  "北京医院": ["北京", "北京"],
  "首都医科大学附属北京友谊医院": ["北京", "北京"],
  "首都医科大学附属北京朝阳医院": ["北京", "北京"],
  "天津医科大学肿瘤医院": ["天津", "天津"],
  "天津医科大学总医院": ["天津", "天津"],
  "吉林大学第一医院": ["吉林", "长春"],
  "哈尔滨医科大学附属第二医院": ["黑龙江", "哈尔滨"],
  "浙江大学医学院附属儿童医院": ["浙江", "杭州"],
  "中国科学技术大学附属第一医院（安徽省立医院）": ["安徽", "合肥"],
  "安徽医科大学第一附属医院": ["安徽", "合肥"],
  "中南大学湘雅三医院": ["湖南", "长沙"],
  "广州市妇女儿童医疗中心": ["广东", "广州"],
  "中山大学中山眼科中心": ["广东", "广州"],
  "中山大学孙逸仙纪念医院": ["广东", "广州"],
  "南方医科大学珠江医院": ["广东", "广州"],
  "重庆医科大学附属儿童医院": ["重庆", "重庆"],
  "四川大学华西第二医院": ["四川", "成都"],
  "西安交通大学第一附属医院": ["陕西", "西安"],
  "北京大学第六医院": ["北京", "北京"],
  "首都医科大学附属北京世纪坛医院": ["北京", "北京"],
  "中国医学科学院血液病医院（研究所）": ["天津", "天津"],
  "中国人民解放军北部战区总医院": ["辽宁", "沈阳"],
  "哈尔滨医科大学附属第一医院": ["黑龙江", "哈尔滨"],
  "上海市胸科医院（暨上海交通大学医学院附属胸科医院）": ["上海", "上海"],
  "上海市第一人民医院": ["上海", "上海"],
  "上海市精神卫生中心": ["上海", "上海"],
  "上海交通大学医学院附属上海儿童医学中心": ["上海", "上海"],
  "复旦大学附属妇产科医院": ["上海", "上海"],
  "海军军医大学第二附属医院": ["上海", "上海"],
  "浙江大学医学院附属妇产科医院": ["浙江", "杭州"],
  "温州医科大学附属眼视光医院": ["浙江", "温州"],
  "福建医科大学附属协和医院": ["福建", "福州"],
  "河南省人民医院": ["河南", "郑州"],
  "武汉大学口腔医院": ["湖北", "武汉"],
  "深圳市人民医院": ["广东", "深圳"],
  "陆军军医大学第二附属医院": ["重庆", "重庆"],
  "西安交通大学第二附属医院": ["陕西", "西安"],
  "空军军医大学第二附属医院（唐都医院）": ["陕西", "西安"],
  "中国医学科学院整形外科医院": ["北京", "北京"],
  "天津市眼科医院": ["天津", "天津"],
  "首都儿科研究所": ["北京", "北京"],
  "山东大学附属生殖医院": ["山东", "济南"],
  "中信湘雅生殖与遗传专科医院": ["湖南", "长沙"],
  "重庆市妇幼保健院": ["重庆", "重庆"],
  "武汉市第三医院暨武汉大学附属同仁医院": ["湖北", "武汉"],
  "江南大学附属医院": ["江苏", "无锡"],
  "中国医学科学院皮肤病医院（研究所）": ["江苏", "南京"],
  "山东第一医科大学附属皮肤病医院": ["山东", "济南"],
  "天津医科大学第二医院": ["天津", "天津"],
  "复旦大学附属华东医院": ["上海", "上海"],
  "空军军医大学第三附属医院（口腔医院）": ["陕西", "西安"],
  "中山大学光华口腔医学院附属口腔医院": ["广东", "广州"],
  "首都医科大学附属北京口腔医院": ["北京", "北京"],
  "南京医科大学附属口腔医院（江苏省口腔医院）": ["江苏", "南京"],
  "浙江大学医学院附属口腔医院": ["浙江", "杭州"],
  "中国医科大学附属口腔医院": ["辽宁", "沈阳"],
  "中国康复研究中心（北京博爱医院）": ["北京", "北京"],
  "首都医科大学附属北京安定医院": ["北京", "北京"],
  "南京脑科医院": ["江苏", "南京"],
  "广州医科大学附属脑科医院": ["广东", "广州"],
  "北京回龙观医院": ["北京", "北京"],
  "山西医科大学第一医院": ["山西", "太原"],
  "河北医科大学第三医院": ["河北", "石家庄"],
  "天津市天津医院": ["天津", "天津"],
  "广州医科大学附属第二医院": ["广东", "广州"],
  "山东省肿瘤医院暨山东省肿瘤防治研究院": ["山东", "济南"],
  "中国科学院大学附属肿瘤医院（浙江省肿瘤医院）": ["浙江", "杭州"],
  "江苏省肿瘤医院": ["江苏", "南京"],
  "四川省肿瘤医院": ["四川", "成都"],
  "首都医科大学附属复兴医院": ["北京", "北京"],
  "遵义医科大学附属医院": ["贵州", "遵义"],
  "首都医科大学附属北京胸科医院": ["北京", "北京"],
  "深圳市第三人民医院（南方科技大学第二附属医院）": ["广东", "深圳"],
  "上海市（复旦大学附属）公共卫生临床中心": ["上海", "上海"],
  "广州市胸科医院": ["广东", "广州"],
  "武汉市肺科医院": ["湖北", "武汉"],
  "山东省公共卫生临床中心": ["山东", "济南"],
  "华中科技大学协和深圳医院": ["广东", "深圳"],};

const EXTRA = [
  ["内蒙古医科大学附属医院", "内蒙古", "呼和浩特", "综合"],
  ["内蒙古自治区人民医院", "内蒙古", "呼和浩特", "综合"],
  ["广西医科大学第一附属医院", "广西", "南宁", "综合"],
  ["广西壮族自治区人民医院", "广西", "南宁", "综合"],
  ["海南省人民医院", "海南", "海口", "综合"],
  ["海南医科大学第一附属医院", "海南", "海口", "综合"],
  ["昆明医科大学第一附属医院", "云南", "昆明", "综合"],
  ["云南省第一人民医院", "云南", "昆明", "综合"],
  ["西藏自治区人民医院", "西藏", "拉萨", "综合"],
  ["兰州大学第一医院", "甘肃", "兰州", "综合"],
  ["兰州大学第二医院", "甘肃", "兰州", "综合"],
  ["青海大学附属医院", "青海", "西宁", "综合"],
  ["青海省人民医院", "青海", "西宁", "综合"],
  ["宁夏医科大学总医院", "宁夏", "银川", "综合"],
  ["新疆医科大学第一附属医院", "新疆", "乌鲁木齐", "综合"],
  ["新疆维吾尔自治区人民医院", "新疆", "乌鲁木齐", "综合"],
  ["河北省人民医院", "河北", "石家庄", "综合"],
  ["河北医科大学第二医院", "河北", "石家庄", "综合"],
  ["山西省人民医院", "山西", "太原", "综合"],
  ["吉林大学中日联谊医院", "吉林", "长春", "综合"],
  ["贵州医科大学附属医院", "贵州", "贵阳", "综合"],
  ["贵州省人民医院", "贵州", "贵阳", "综合"],
  ["中国中医科学院广安门医院", "北京", "北京", "中医"],
  ["北京中医药大学东直门医院", "北京", "北京", "中医"],
  ["上海中医药大学附属龙华医院", "上海", "上海", "中医"],
  ["天津中医药大学第一附属医院", "天津", "天津", "中医"],
  ["江苏省中医院", "江苏", "南京", "中医"],
  ["浙江中医药大学附属第一医院（浙江省中医院）", "浙江", "杭州", "中医"],
  ["广东省中医院", "广东", "广州", "中医"],
  ["成都中医药大学附属医院", "四川", "成都", "中医"],
  ["湖南中医药大学第一附属医院", "湖南", "长沙", "中医"],
  ["河南中医药大学第一附属医院", "河南", "郑州", "中医"],
];

const TYPE_OVERRIDE = {
  中国医学科学院阜外医院: "专科",
  北京大学第六医院: "专科",
  四川大学华西第二医院: "妇幼儿童",
  北京积水潭医院: "综合",
  天津市天津医院: "专科",
  华中科技大学协和深圳医院: "综合",
  复旦大学附属华东医院: "综合",
  首都医科大学附属复兴医院: "综合",
  北京医院: "综合",
  首都儿科研究所: "妇幼儿童",
};

function norm(name) {
  return name
    .replace(/\s+/g, "")
    .replace(/\(/g, "（")
    .replace(/\)/g, "）")
    .replace(
      "暨上海交通大学附属胸科医院",
      "暨上海交通大学医学院附属胸科医院",
    );
}

function inferType(name) {
  if (TYPE_OVERRIDE[name]) return TYPE_OVERRIDE[name];
  if (/儿童|妇产|妇幼|妇女儿童|儿科/.test(name)) return "妇幼儿童";
  if (
    /口腔|肿瘤|眼科|眼视光|精神|脑科|胸科|肺科|皮肤|整形|血液病|康复|生殖|公共卫生|安定|回龙观|博爱/.test(
      name,
    )
  ) {
    return "专科";
  }
  if (/中医/.test(name)) return "中医";
  return "综合";
}

function parseSource(text) {
  const lines = text.split("\n");
  const tierStart = lines.findIndex((line) => line.includes("同一级别不分先后"));
  const specStart = lines.findIndex(
    (line) => line.includes("专科声誉排行榜") && line.startsWith("2023"),
  );
  if (tierStart < 0 || specStart < 0) {
    throw new Error("无法定位榜单段落");
  }

  const tiers = [];
  for (const line of lines.slice(tierStart, specStart)) {
    const match = line.match(/^\| (A\+*) \| (.+) \|$/);
    if (match) tiers.push({ tier: match[1], name: norm(match[2].trim()) });
  }

  const rows = [];
  let current = null;
  for (const line of lines.slice(specStart)) {
    const match = line.match(/^\| ([^|]+) \| ([^|]+) \| ([^|]+) \|$/);
    if (!match) continue;
    const specialty = match[1].trim();
    const hospital = match[2].trim();
    const score = match[3].trim();
    if (specialty === "专科类别" || specialty === "---" || !specialty) continue;
    if (specialty !== current) current = specialty;
    if (!hospital || hospital === "医院名称") continue;
    const specialtyName = current === "临床医学" ? "临床药学" : current;
    rows.push({
      specialty: specialtyName,
      name: norm(hospital),
      score: Number(score),
    });
  }
  return { tiers, rows };
}

function main() {
  const text = fs.readFileSync(sourcePath, "utf8");
  const { tiers, rows } = parseSource(text);

  if (tiers.length !== 100) {
    throw new Error(`综合榜应为 100 家，实际 ${tiers.length}`);
  }
  for (const tier of ["A++++", "A+++", "A++", "A+", "A"]) {
    const count = tiers.filter((item) => item.tier === tier).length;
    if (count !== 20) throw new Error(`${tier} 应为 20 家，实际 ${count}`);
  }
  const top = tiers.filter((item) => item.tier === "A++++").map((item) => item.name);
  if (top.join("|") !== A_PLUS_PLUS_PLUS_PLUS.map(norm).join("|")) {
    throw new Error("A++++ 与澎湃新闻报道名单不一致");
  }

  const hospitals = [];
  const idByName = new Map();

  function addHospital(name, province, city, type, tier, tierOrder) {
    const canonical = norm(name);
    if (idByName.has(canonical)) return idByName.get(canonical);
    if (!REGION_BY_PROVINCE[province]) throw new Error(`未知省份 ${province}：${canonical}`);
    const id = `h${String(hospitals.length + 1).padStart(3, "0")}`;
    hospitals.push({
      id,
      name: canonical,
      province,
      city,
      region: REGION_BY_PROVINCE[province],
      type,
      tier,
      tierOrder,
    });
    idByName.set(canonical, id);
    return id;
  }

  tiers.forEach((item, index) => {
    const place = PLACE[item.name];
    if (!place) throw new Error(`缺少属地：${item.name}`);
    addHospital(item.name, place[0], place[1], inferType(item.name), item.tier, index + 1);
  });

  const grouped = new Map();
  for (const row of rows) {
    if (!grouped.has(row.specialty)) grouped.set(row.specialty, []);
    grouped.get(row.specialty).push(row);
  }

  for (const name of SPECIALTY_ORDER) {
    if (!grouped.has(name)) throw new Error(`缺少专科：${name}`);
  }
  for (const name of grouped.keys()) {
    if (!SPECIALTY_ORDER.includes(name)) throw new Error(`未列入专科顺序：${name}`);
  }

  const specialties = SPECIALTY_ORDER.map((name, index) => {
    const list = grouped.get(name);
    if (list.length !== 10) throw new Error(`${name} 应为 10 家，实际 ${list.length}`);
    const entries = list.map((row, rowIndex) => {
      const place = PLACE[row.name];
      if (!place) throw new Error(`${name} 缺少属地：${row.name}`);
      if (!Number.isFinite(row.score)) throw new Error(`${name} 声誉值无效：${row.name}`);
      const id = addHospital(row.name, place[0], place[1], inferType(row.name), null, null);
      const previous = rowIndex > 0 ? list[rowIndex - 1] : null;
      const tied = previous ? previous.score === row.score : false;
      const rank = tied ? null : rowIndex + 1;
      return { hospitalId: id, score: row.score, rank, tiedWithPrevious: tied };
    });
    let lastRank = 0;
    for (const entry of entries) {
      if (entry.tiedWithPrevious) entry.rank = lastRank;
      else lastRank = entry.rank;
      delete entry.tiedWithPrevious;
    }
    for (const entry of entries) {
      entry.tied = entries.filter((item) => item.rank === entry.rank).length > 1;
    }
    return { id: `s${String(index + 1).padStart(2, "0")}`, name, entries };
  });

  for (const [name, province, city, type] of EXTRA) {
    addHospital(name, province, city, type, null, null);
  }

  const covered = new Set(hospitals.map((item) => item.province));
  const missing = Object.keys(REGION_BY_PROVINCE).filter((name) => !covered.has(name));
  if (missing.length) throw new Error(`省份没有医院：${missing.join("、")}`);

  const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
  const dataDir = path.join(root, "data");
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, "hospitals.json"), JSON.stringify(hospitals, null, 2) + "\n");
  fs.writeFileSync(path.join(dataDir, "specialties.json"), JSON.stringify(specialties, null, 2) + "\n");
  const meta = {
    publisher: "复旦大学医院管理研究所",
    comprehensiveTitle: "2023年度中国医院综合排行榜",
    specialtyTitle: "2023年度中国医院专科声誉排行榜",
    publishedOn: "2024-11-16",
    nationalGradeACount: 1975,
    nationalCountYear: "2025年末",
    nationalCountSource: "国家卫生健康委《2025年我国卫生健康事业发展统计公报》",
    sameTierNote: "综合榜同等级不分先后，按行政大区编码排列，同区院名笔画少者在前。",
    coverageNote:
      "本站只收三级甲等医院，收录复旦榜上榜医院，并补入各省级行政区的主要三甲。这是公开资料整理稿，不是卫健委实时全量名录。",
  };
  fs.writeFileSync(path.join(dataDir, "meta.json"), JSON.stringify(meta, null, 2) + "\n");

  const tierCounts = {};
  for (const hospital of hospitals) {
    const key = hospital.tier ?? "未上榜";
    tierCounts[key] = (tierCounts[key] ?? 0) + 1;
  }
  console.log(`hospitals ${hospitals.length}`);
  console.log(tierCounts);
  console.log(`specialties ${specialties.length}`);
  console.log(`provinces ${covered.size}`);
}

main();
