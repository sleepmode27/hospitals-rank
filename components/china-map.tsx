"use client";

import type { ProvinceSummary } from "@/lib/data";
import { tierLabel } from "@/lib/data";
import * as echarts from "echarts";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const OUTSIDE = new Set(["台湾省", "香港特别行政区", "澳门特别行政区", "南海诸岛"]);

export function ChinaMap({ summaries }: { summaries: ProvinceSummary[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let chart: echarts.ECharts | null = null;
    let cancelled = false;

    const render = (geo: { features: { properties: { name?: string } }[] }) => {
      if (cancelled || !ref.current) return;
      for (const feature of geo.features) {
        if (!feature.properties.name) feature.properties.name = "南海诸岛";
      }
      echarts.registerMap("china", geo as never);
      chart = echarts.init(ref.current);
      const max = Math.max(...summaries.map((item) => item.count), 1);
      const byGeo = new Map(summaries.map((item) => [item.geoName, item]));

      chart.setOption({
        backgroundColor: "transparent",
        tooltip: {
          trigger: "item",
          backgroundColor: "#faf6ee",
          borderColor: "#d9ccb6",
          textStyle: { color: "#1c1915", fontSize: 13 },
          formatter: (params: { name?: string; data?: ProvinceSummary }) => {
            const name = params.name || "南海诸岛";
            if (OUTSIDE.has(name) || !params.data?.province) {
              return `${name}<br/>不在本榜收录范围`;
            }
            const item = params.data;
            const tier = item.topTier ? tierLabel(item.topTier) : "综合榜未上榜";
            const representative = item.representative ?? "暂无";
            return [
              `<strong>${item.province}</strong>`,
              `收录三甲 ${item.count} 家`,
              `综合榜上榜 ${item.ranked} 家`,
              `最高档 ${tier}`,
              `代表医院 ${representative}`,
            ].join("<br/>");
          },
        },
        visualMap: {
          min: 1,
          max,
          text: ["收录多", "收录少"],
          calculable: false,
          left: 8,
          bottom: 16,
          itemWidth: 12,
          itemHeight: 80,
          textStyle: { color: "#5c5348", fontSize: 12 },
          inRange: { color: ["#f3e6d4", "#e7c2a4", "#c96b52", "#8f2d2a"] },
        },
        series: [
          {
            type: "map",
            map: "china",
            roam: true,
            zoom: 1.2,
            layoutCenter: ["50%", "48%"],
            layoutSize: "115%",
            selectedMode: false,
            label: {
              show: element.clientWidth > 720,
              color: "#3f342c",
              fontSize: 10,
            },
            itemStyle: {
              areaColor: "#e8e0d2",
              borderColor: "#8d8172",
              borderWidth: 0.6,
            },
            emphasis: {
              label: { show: true, color: "#1c1915" },
              itemStyle: { areaColor: "#f0d3a4" },
            },
            data: [
              ...summaries.map((item) => ({ ...item, name: item.geoName, value: item.count })),
              ...["台湾省", "香港特别行政区", "澳门特别行政区", "南海诸岛"].map((name) => ({
                name,
                value: null,
                itemStyle: { areaColor: "#e8e0d2" },
                label: { show: false },
                emphasis: { disabled: true },
              })),
            ],
          },
        ],
      });

      chart.on("click", (params) => {
        const summary = byGeo.get(String(params.name));
        if (!summary || summary.count === 0) return;
        router.push(`/hospitals?province=${encodeURIComponent(summary.province)}`);
      });
      setStatus("ready");
    };

    fetch("/geo/china.json")
      .then((response) => {
        if (!response.ok) throw new Error("map");
        return response.json();
      })
      .then(render)
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    const onResize = () => chart?.resize();
    window.addEventListener("resize", onResize);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", onResize);
      chart?.dispose();
    };
  }, [router, summaries]);

  return (
    <div className="relative min-h-[420px] lg:min-h-[640px]">
      <div ref={ref} className="h-[420px] w-full lg:h-[640px]" role="img" aria-label="中国地图，按省显示收录的三甲医院" />
      {status === "loading" ? (
        <p className="absolute inset-0 grid place-items-center text-sm text-muted-foreground">地图加载中</p>
      ) : null}
      {status === "error" ? (
        <p className="absolute inset-x-4 top-4 rounded-md bg-card px-3 py-2 text-sm text-muted-foreground">
          地图没有载入。可以从省份名单进入。
        </p>
      ) : null}
    </div>
  );
}