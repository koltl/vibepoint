import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { USER_COLORS } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getInitials(username: string): string {
  return username
    .trim()
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

export function getColorForIndex(index: number): string {
  return USER_COLORS[index % USER_COLORS.length];
}

export function isNumericVote(value: string): boolean {
  return value !== "?" && value !== "☕" && !Number.isNaN(Number(value));
}

export function averageVote(values: string[]): number | null {
  const nums = values
    .map((v) => Number(v))
    .filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((a, b) => a + b, 0) / nums.length) * 10) / 10;
}

const REVEAL_ORDER: Record<string, number> = {
  "0": 0, "1": 1, "2": 2, "3": 3, "5": 5, "8": 8, "13": 13, "21": 21,
  "34": 34, "55": 55, "89": 89, "?": 100, "☕": 101,
};

export function revealSortKey(value: string | undefined): number {
  if (value === undefined || value === null) return -1;
  return REVEAL_ORDER[value] ?? 50;
}
