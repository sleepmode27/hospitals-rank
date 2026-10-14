import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg py-16 text-center">
      <h1 className="font-serif text-3xl">没有找到这一页</h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        医院可能不在本站收录范围内，或者地址写错了。可以回到地图，按省份重新查找。
      </p>
      <Button className="mt-6" render={<Link href="/" />}>
        回到地图
      </Button>
    </div>
  );
}