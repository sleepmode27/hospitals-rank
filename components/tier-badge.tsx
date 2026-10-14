import { Badge } from "@/components/ui/badge";
import { tierLabel, type Tier } from "@/lib/data";
import { cn } from "cn";

export function TierBadge({ tier }: { tier: Tier | null }) {
  const top = tier === "A++++";
  return (
    <Badge
      variant={top ? "default" : "outline"}
      className={cn("shrink-0", top && "border-transparent bg-primary text-primary-foreground")}
    >
      {tierLabel(tier)}
    </Badge>
  );
}