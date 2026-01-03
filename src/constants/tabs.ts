import {
  HomeSvg,
  StatsSvg,
  CenterSvg,
  GoalsSvg,
  SettingsSvg,
} from "@components/SVGImage";

interface TabItem {
  name: string;
  label: string;
  Svg: React.FC<{ color?: string; width?: number; height?: number }>;
  center?: boolean;
}

export const TABS: TabItem[] = [
  { name: "Home", label: "Home", Svg: HomeSvg },
  { name: "Stats", label: "Stats", Svg: StatsSvg },
  { name: "Center", label: "", center: true, Svg: CenterSvg },
  { name: "Analytics", label: "Analytics", Svg: GoalsSvg },
  { name: "Settings", label: "Settings", Svg: SettingsSvg },
];
