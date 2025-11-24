import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import {ExceptionGroup} from "@/types";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const generateThemeColors = (count: number, theme: "light" | "dark"): string[] => {
  const colors: string[] = [];

  // Base difference depending on theme
  const baseSaturation = theme === "light" ? 65 : 55;
  const baseLightness = theme === "light" ? 55 : 65;

  for (let i = 0; i < count; i++) {
    const hue = (i * 137.508) % 360; // Golden angle algorithm for perfect distribution
    colors.push(`hsl(${hue}, ${baseSaturation}%, ${baseLightness}%)`);
  }

  return colors;
};

export const getExceptionGroup = (exception: string): ExceptionGroup => {
  const e = exception.toLowerCase();

  if (e.includes("redis")) return "REDIS";
  if (e.includes("kafka")) return "KAFKA";
  if (e.includes("sql") || e.includes("postgres") || e.includes("psql")) return "POSTGRES";
  if (e.includes("http") || e.includes("rest") || e.includes("web")) return "REST";

  // Custom company-wide exceptions
  if (e.startsWith("com.geopost")) return "GEOPOST";

  return "UNKNOWN";
};

export const palette = {
  REDIS: {
    light: "bg-red-100 text-red-800",
    dark: "bg-red-950 text-red-300",
  },
  KAFKA: {
    light: "bg-purple-100 text-purple-800",
    dark: "bg-purple-950 text-purple-300",
  },
  POSTGRES: {
    light: "bg-amber-100 text-amber-800",
    dark: "bg-amber-950 text-amber-300",
  },
  REST: {
    light: "bg-green-100 text-green-800",
    dark: "bg-green-950 text-green-300",
  },
  GEOPOST: {
    light: "bg-cyan-100 text-cyan-800",
    dark: "bg-cyan-950 text-cyan-300",
  },
  UNKNOWN: {
    light: "bg-gray-100 text-gray-800",
    dark: "bg-gray-950 text-gray-300",
  },
} as const;

export const getExceptionColor = (
    exception: string,
    theme: "light" | "dark"
): string => {
  const group = getExceptionGroup(exception);
  return palette[group][theme];
};
