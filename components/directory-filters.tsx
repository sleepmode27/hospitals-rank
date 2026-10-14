"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HOSPITAL_TYPES, TIERS } from "@/lib/data";

export type DirectoryFilters = {
  province: string;
  city: string;
  tier: string;
  type: string;
  q: string;
};

type Option = { value: string; label: string };

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      {label}
      <Select
        value={value}
        items={options}
        onValueChange={(next) => onChange(next ?? "all")}
      >
        <SelectTrigger className="w-full bg-card">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[80]">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function DirectoryFilters({
  filters,
  provinces,
  cities,
  showTier = false,
  showType = false,
  showQuery = false,
  onChange,
  onReset,
}: {
  filters: DirectoryFilters;
  provinces: string[];
  cities: string[];
  showTier?: boolean;
  showType?: boolean;
  showQuery?: boolean;
  onChange: (patch: Partial<DirectoryFilters>) => void;
  onReset: () => void;
}) {
  const provinceOptions = [
    { value: "all", label: "全部省份" },
    ...provinces.map((province) => ({ value: province, label: province })),
  ];
  const cityOptions = [
    { value: "all", label: "全部城市" },
    ...cities.map((city) => ({ value: city, label: city })),
  ];
  const tierOptions = [
    { value: "all", label: "全部档位" },
    ...TIERS.map((tier) => ({ value: tier, label: tier })),
    { value: "none", label: "未进入综合榜" },
  ];
  const typeOptions = [
    { value: "all", label: "全部类型" },
    ...HOSPITAL_TYPES.map((type) => ({ value: type, label: type })),
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
      {showQuery ? (
        <label className="grid gap-1 text-xs text-muted-foreground sm:col-span-2 lg:col-span-2">
          医院名称
          <Input
            value={filters.q}
            placeholder="输入医院名称"
            onChange={(event) => onChange({ q: event.target.value })}
            className="bg-card"
          />
        </label>
      ) : null}
      <FilterSelect
        label="省份"
        value={filters.province}
        options={provinceOptions}
        onChange={(province) => onChange({ province, city: "all" })}
      />
      <FilterSelect
        label="城市"
        value={filters.city}
        options={cityOptions}
        onChange={(city) => onChange({ city })}
      />
      {showTier ? (
        <FilterSelect
          label="综合档位"
          value={filters.tier}
          options={tierOptions}
          onChange={(tier) => onChange({ tier })}
        />
      ) : null}
      {showType ? (
        <FilterSelect
          label="医院类型"
          value={filters.type}
          options={typeOptions}
          onChange={(type) => onChange({ type })}
        />
      ) : null}
      <div className="flex items-end">
        <Button type="button" variant="outline" className="w-full bg-card" onClick={onReset}>
          清除筛选
        </Button>
      </div>
    </div>
  );
}