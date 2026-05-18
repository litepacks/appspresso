import {
  AcademicCapIcon,
  ArrowLeftIcon,
  Bars3Icon,
  BellIcon,
  BookOpenIcon,
  BugAntIcon,
  CheckIcon,
  ChevronDownIcon,
  CircleStackIcon,
  Cog6ToothIcon,
  EllipsisHorizontalCircleIcon,
  GiftIcon,
  HomeIcon,
  PlusIcon,
  QueueListIcon,
  ShoppingBagIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import type { ComponentType, SVGProps } from "react";
import { cn } from "@/lib/utils";

type SvgIcon = ComponentType<SVGProps<SVGSVGElement>>;

/**
 * Discoverable name → Heroicons outline component.
 * Yeni ikon: hem buraya hem `IconName` tipine (keyof) eklenir.
 */
const ICONS = {
  home: HomeIcon,
  "book-open": BookOpenIcon,
  "queue-list": QueueListIcon,
  "ellipsis-horizontal-circle": EllipsisHorizontalCircleIcon,
  "academic-cap": AcademicCapIcon,
  "cog-6-tooth": Cog6ToothIcon,
  "circle-stack": CircleStackIcon,
  "shopping-bag": ShoppingBagIcon,
  gift: GiftIcon,
  bell: BellIcon,
  plus: PlusIcon,
  "x-mark": XMarkIcon,
  "chevron-down": ChevronDownIcon,
  "bug-ant": BugAntIcon,
  "bars-3": Bars3Icon,
  "arrow-left": ArrowLeftIcon,
  check: CheckIcon,
} as const satisfies Record<string, SvgIcon>;

export type IconName = keyof typeof ICONS;

const SIZE_PX = {
  xs: 14,
  sm: 16,
  md: 20,
  lg: 28,
  xl: 32,
} as const;

export type IconSize = keyof typeof SIZE_PX | number;

function resolveSize(size: IconSize | undefined): number {
  if (size === undefined) return 24;
  if (typeof size === "number") return size;
  return SIZE_PX[size];
}

export type IconProps = {
  /** Kebab-case-like key in `ICONS` map */
  name: IconName;
  /** Pixels; or preset `xs`–`xl` (default 24px) */
  size?: IconSize;
  className?: string;
  strokeWidth?: number;
  /** Short accessible label; when set, `aria-hidden` is not used */
  title?: string;
};

/**
 * Thin name-based wrapper for Heroicons (24/outline) — use `name` + `size`.
 */
export function Icon({
  name,
  size: sizeProp,
  className,
  strokeWidth,
  title,
}: IconProps) {
  const Cmp = ICONS[name];
  const size = resolveSize(sizeProp);

  return (
    <Cmp
      width={size}
      height={size}
      className={cn("shrink-0", className)}
      strokeWidth={strokeWidth}
      aria-hidden={title ? undefined : true}
      {...(title ? { role: "img" as const, "aria-label": title } : {})}
    />
  );
}
