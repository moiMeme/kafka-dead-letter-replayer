import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

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